import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, Bell, CheckCircle, Clock, Calculator, Zap, Users, Mic, BookOpen, ClipboardList, Edit3, ArrowRight, SkipForward } from 'lucide-react';

type SegmentType = 'opening' | 'core' | 'closing' | 'single';

interface SegmentConfig {
  id: SegmentType;
  label: string;
  durationMinutes: number;
  color: string; // Tailwind text color class
}

const ALARM_TYPES = [
  { id: 'classic', label: 'Beeper Klasik' },
  { id: 'chime', label: 'Lonceng Lembut' },
  { id: 'digital', label: 'Alarm Digital' },
];

const DEFAULT_PRESETS = [
  { label: 'Ice Breaking', duration: 3, icon: Zap, color: 'text-yellow-600 dark:text-yellow-400' },
  { label: 'Presentasi', duration: 5, icon: Mic, color: 'text-purple-600 dark:text-purple-400' },
  { label: 'Diskusi', duration: 15, icon: Users, color: 'text-blue-600 dark:text-blue-400' },
  { label: 'Tugas', duration: 30, icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Ujian', duration: 60, icon: ClipboardList, color: 'text-rose-600 dark:text-rose-400' },
];

// Helper to format time MM:SS
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const VisualTimer = ({ timeLeft, totalTime, colorClass }: { timeLeft: number, totalTime: number, colorClass: string }) => {
  // SVG Config
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  // Progress 1 -> 0
  const progress = Math.max(0, timeLeft / totalTime); 
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-72 h-72 sm:w-80 sm:h-80 drop-shadow-xl">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-200 dark:text-slate-800"
        />
        {/* Progress Circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-linear ${colorClass.replace('text-', 'text-')}`} // Use the text color as stroke color
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      
      {/* Digital Time Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-6xl sm:text-7xl font-black font-mono tracking-tighter ${colorClass}`}>
          {formatTime(timeLeft)}
        </span>
        <span className="text-slate-400 text-sm font-medium mt-2 uppercase tracking-widest">Sisa Waktu</span>
      </div>
    </div>
  );
};

const TimeKeeper: React.FC = () => {
  // Configuration State
  const [config, setConfig] = useState<SegmentConfig[]>([
    { id: 'opening', label: 'Pembuka', durationMinutes: 10, color: 'text-blue-600 dark:text-blue-400' },
    { id: 'core', label: 'Kegiatan Inti', durationMinutes: 40, color: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'closing', label: 'Penutup', durationMinutes: 10, color: 'text-orange-600 dark:text-orange-400' },
  ]);
  const [totalTimeInput, setTotalTimeInput] = useState<number | ''>(60);
  const [selectedSound, setSelectedSound] = useState('classic');
  
  // Custom Box State (Transient, not saved to presets)
  const [customBoxName, setCustomBoxName] = useState('Kustom');
  const [customBoxDuration, setCustomBoxDuration] = useState<number | ''>('');

  // Timer State
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(-1); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(true);
  
  // Alarm State
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  // --- AUDIO LOGIC ---
  const playAlarmSound = (type: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'chime') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 1.5);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(1, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
    } else if (type === 'digital') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1200, now + 0.1);
      osc.frequency.setValueAtTime(800, now + 0.2);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.setValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      
      setTimeout(() => {
          if (ctx.state === 'closed') return;
          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.connect(g2);
          g2.connect(ctx.destination);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(600, ctx.currentTime);
          g2.gain.setValueAtTime(0.3, ctx.currentTime);
          g2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.5);
      }, 600);
    }
  };

  const startAlarmLoop = () => {
    setIsAlarmActive(true);
    playAlarmSound(selectedSound);
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = window.setInterval(() => {
      playAlarmSound(selectedSound);
    }, 2500);
  };

  const stopAlarmAndProceed = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setIsAlarmActive(false);
    setShowNotification(null);

    if (activeSegmentIndex < config.length - 1) {
      const nextIndex = activeSegmentIndex + 1;
      setActiveSegmentIndex(nextIndex);
      setTimeLeft(config[nextIndex].durationMinutes * 60);
      setIsRunning(false); 
    } else {
      setActiveSegmentIndex(config.length); 
      setIsRunning(false);
    }
  };

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, []);

  // Sync Total Input with Config (Only when config actually changes not via input)
  // We avoid auto-setting if the user is typing (managed by handling logic below)
  useEffect(() => {
    const sum = config.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    // Only update if not currently editing (handled by checking focus or logic flow, 
    // but here we just ensure we don't force '0' if it should be empty)
    if (sum !== 0 && totalTimeInput !== '') {
       setTotalTimeInput(sum);
    }
  }, [config]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: number;
    const maxIndex = config.length;

    if (isRunning && activeSegmentIndex >= 0 && activeSegmentIndex < maxIndex && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0 && activeSegmentIndex < maxIndex && !isAlarmActive) {
      handleSegmentEnd();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, activeSegmentIndex, isAlarmActive, config]);

  const handleSegmentEnd = () => {
    setIsRunning(false);
    const currentSegment = config[activeSegmentIndex];
    setShowNotification(`WAKTU ${currentSegment.label.toUpperCase()} HABIS!`);
    startAlarmLoop();
  };

  const startTimer = () => {
    let startIndex = activeSegmentIndex;
    
    // If invalid index (first run), reset to 0
    if (startIndex === -1 || startIndex >= config.length) {
      startIndex = 0;
      setActiveSegmentIndex(0);
    }

    if (isSetupMode && config[startIndex]) {
       setTimeLeft(config[startIndex].durationMinutes * 60);
    }

    setIsSetupMode(false);
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => setIsRunning(true);

  const resetTimer = () => {
    setIsRunning(false);
    setActiveSegmentIndex(-1);
    setIsSetupMode(true);
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    setIsAlarmActive(false);
    setShowNotification(null);
  };

  const handleFullReset = () => {
    setConfig([
        { id: 'opening', label: 'Pembuka', durationMinutes: 10, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'core', label: 'Kegiatan Inti', durationMinutes: 40, color: 'text-emerald-600 dark:text-emerald-400' },
        { id: 'closing', label: 'Penutup', durationMinutes: 10, color: 'text-orange-600 dark:text-orange-400' },
    ]);
    setTotalTimeInput(60);
    resetTimer();
  };

  const skipSegment = () => {
    stopAlarmAndProceed();
  };

  const handlePresetClick = (duration: number, label: string, color: string) => {
     setConfig([
       { 
         id: 'single', 
         label: label, 
         durationMinutes: duration, 
         color: color
        }
     ]);
     setTotalTimeInput(duration);
     setActiveSegmentIndex(0);
     setTimeLeft(duration * 60);
     setIsSetupMode(true);
  };

  const applyCustomBox = () => {
     const dur = customBoxDuration === '' ? 0 : customBoxDuration;
     if(dur <= 0) return;

     handlePresetClick(dur, customBoxName || 'Kustom', 'text-slate-600 dark:text-slate-300');
  }

  const handleDurationChange = (index: number, val: string) => {
    const num = val === '' ? 0 : parseInt(val);
    const newConfig = [...config];
    newConfig[index].durationMinutes = num;
    setConfig(newConfig);
    
    if (newConfig.length === 1) {
        setTotalTimeInput(val === '' ? '' : num);
    }
  };

  const handleTotalTimeChange = (val: string) => {
    if (val === '') {
        setTotalTimeInput('');
        return;
    }
    const total = parseInt(val);
    setTotalTimeInput(total);
    if (total > 0) {
      let sideDuration = 10;
      if (total >= 90) sideDuration = 15;
      if (total < 25) sideDuration = Math.floor(total * 0.2);
      const core = total - (sideDuration * 2);
      setConfig([
        { id: 'opening', label: 'Pembuka', durationMinutes: sideDuration, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'core', label: 'Kegiatan Inti', durationMinutes: core > 0 ? core : 0, color: 'text-emerald-600 dark:text-emerald-400' },
        { id: 'closing', label: 'Penutup', durationMinutes: sideDuration, color: 'text-orange-600 dark:text-orange-400' },
      ]);
    }
  };

  const currentSegment = activeSegmentIndex >= 0 && activeSegmentIndex < config.length ? config[activeSegmentIndex] : null;

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Manajemen Waktu Kelas</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Atur durasi aktivitas pembelajaran. Mendukung sesi bertahap (Pembuka - Inti - Penutup) atau timer cepat.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
          
          {/* Header Bar */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
               <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
               <span className="font-semibold text-slate-800 dark:text-slate-200">Timer Pembelajaran</span>
            </div>
            
            {/* Sound Selector */}
            {isSetupMode && (
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <select 
                  value={selectedSound}
                  onChange={(e) => setSelectedSound(e.target.value)}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-md py-1 px-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-orange-500"
                >
                  {ALARM_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* SETUP MODE VIEW */}
          {isSetupMode ? (
            <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
              
              {/* 1. Quick Presets */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Preset Cepat
                    </h3>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {/* Default Presets */}
                    {DEFAULT_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => handlePresetClick(preset.duration, preset.label, preset.color)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-md transition-all group bg-white dark:bg-slate-800/80"
                      >
                         <div className={`p-2.5 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-600 mb-2 transition-colors`}>
                           <preset.icon className={`w-5 h-5 ${preset.color}`} />
                         </div>
                         <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{preset.label}</span>
                         <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{preset.duration} Menit</span>
                      </button>
                    ))}
                    
                    {/* CUSTOM BOX (Immediate Custom) */}
                    <div className="flex flex-col gap-1 p-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 pb-1 mb-1">
                             <Edit3 className="w-3 h-3 text-slate-400" />
                             <input 
                               type="text" 
                               value={customBoxName}
                               onChange={(e) => setCustomBoxName(e.target.value)}
                               placeholder="Nama..."
                               className="w-full bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none placeholder-slate-400"
                             />
                        </div>
                        <div className="flex items-center gap-1 mt-auto">
                             <div className="relative flex-1">
                                <input 
                                    type="number"
                                    value={customBoxDuration}
                                    onChange={(e) => setCustomBoxDuration(e.target.value === '' ? '' : parseInt(e.target.value))}
                                    placeholder="0"
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 text-xs text-center py-1 text-slate-800 dark:text-slate-200 font-mono focus:ring-1 focus:ring-orange-500"
                                />
                                <span className="absolute right-1 top-1.5 text-[8px] text-slate-400 pointer-events-none">m</span>
                             </div>
                             <button 
                               onClick={applyCustomBox}
                               className="bg-orange-500 hover:bg-orange-600 text-white p-1 rounded transition-colors"
                               title="Mulai"
                             >
                               <ArrowRight className="w-4 h-4" />
                             </button>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700"></div>

              {/* 2. Manual Config */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                   <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                     <Settings className="w-4 h-4" /> Pengaturan Waktu
                   </h3>
                   <div className="flex items-center gap-3">
                     {config.length > 1 && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
                            <Calculator className="w-4 h-4 text-slate-500" />
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Total:</span>
                            <input 
                            type="number" 
                            value={totalTimeInput}
                            onChange={(e) => handleTotalTimeChange(e.target.value)}
                            className="w-12 bg-transparent border-b border-slate-400 text-center text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500"
                            placeholder="0"
                            />
                            <span className="text-xs text-slate-500">mnt</span>
                        </div>
                     )}
                     <button 
                        onClick={handleFullReset}
                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded transition-colors"
                     >
                        <RotateCcw className="w-3 h-3" /> Reset Default
                     </button>
                   </div>
                </div>

                <div className={`grid grid-cols-1 ${config.length > 1 ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-4`}>
                  {config.map((segment, idx) => (
                    <div key={segment.id} className="relative p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${segment.color.replace('text-', 'bg-').split(' ')[0]}`}></div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${segment.color}`}>{segment.label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={segment.durationMinutes === 0 ? '' : segment.durationMinutes}
                          onChange={(e) => handleDurationChange(idx, e.target.value)}
                          className="w-full text-2xl font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500"
                          placeholder="0"
                        />
                        <span className="text-sm font-medium text-slate-500">mnt</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startTimer}
                  className="w-full py-4 mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Play className="w-6 h-6 fill-current" />
                  Mulai Timer
                </button>
              </div>
            </div>
          ) : (
            // RUNNING MODE VIEW
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] relative">
              
              {/* Segment Progress Bar Top */}
              <div className="absolute top-0 left-0 w-full h-1.5 flex">
                {config.map((seg, i) => {
                  let statusColor = 'bg-slate-200 dark:bg-slate-700';
                  if (i < activeSegmentIndex) statusColor = seg.color.replace('text-', 'bg-').split(' ')[0]; // Completed
                  else if (i === activeSegmentIndex) statusColor = 'bg-orange-500 animate-pulse'; // Active
                  
                  return (
                    <div key={seg.id} className={`flex-1 h-full ${statusColor} first:rounded-bl-none last:rounded-br-none`}></div>
                  );
                })}
              </div>

              {currentSegment ? (
                <>
                  <div className="mb-8 text-center space-y-2">
                    <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold bg-opacity-10 ${currentSegment.color} ${currentSegment.color.replace('text-', 'bg-').split(' ')[0]} bg-opacity-10`}>
                      {currentSegment.label}
                    </span>
                  </div>

                  {/* VISUAL TIMER COMPONENT */}
                  <VisualTimer 
                     timeLeft={timeLeft} 
                     totalTime={currentSegment.durationMinutes * 60} 
                     colorClass={currentSegment.color}
                  />

                  {/* Controls */}
                  <div className="flex items-center gap-6 mt-10">
                    <button 
                      onClick={resetTimer} 
                      className="p-3 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </button>

                    <button 
                      onClick={isRunning ? pauseTimer : resumeTimer}
                      className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                    >
                      {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </button>

                    <button 
                      onClick={skipSegment} 
                      className="p-3 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Skip / Next"
                    >
                      <SkipForward className="w-6 h-6" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sesi Selesai!</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Semua tahapan waktu telah berakhir.</p>
                  <button onClick={resetTimer} className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700">
                    Kembali ke Pengaturan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Alarm Notification Overlay */}
          {isAlarmActive && showNotification && (
            <div className="absolute inset-0 z-50 bg-orange-600/95 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in zoom-in duration-300">
              <Bell className="w-20 h-20 mb-4 animate-bounce" />
              <h2 className="text-4xl font-black text-center px-4 mb-2">{showNotification}</h2>
              <p className="text-orange-100 mb-8">Waktu telah habis</p>
              <button 
                onClick={stopAlarmAndProceed}
                className="px-8 py-3 bg-white text-orange-600 font-bold rounded-full text-lg shadow-lg hover:bg-orange-50 transition-colors"
              >
                {activeSegmentIndex < config.length - 1 ? 'Lanjut Tahap Berikutnya' : 'Selesai'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeKeeper;