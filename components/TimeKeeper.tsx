import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, Bell, CheckCircle, Clock, Calculator, Square } from 'lucide-react';

type SegmentType = 'opening' | 'core' | 'closing';

interface SegmentConfig {
  id: SegmentType;
  label: string;
  durationMinutes: number;
  color: string;
}

const ALARM_TYPES = [
  { id: 'classic', label: 'Beeper Klasik' },
  { id: 'chime', label: 'Lonceng Lembut' },
  { id: 'digital', label: 'Alarm Digital' },
];

const TimeKeeper: React.FC = () => {
  // Configuration State
  const [config, setConfig] = useState<SegmentConfig[]>([
    { id: 'opening', label: 'Pembuka', durationMinutes: 10, color: 'text-blue-600 dark:text-blue-400' },
    { id: 'core', label: 'Kegiatan Inti', durationMinutes: 40, color: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'closing', label: 'Penutup', durationMinutes: 10, color: 'text-orange-600 dark:text-orange-400' },
  ]);
  const [totalTimeInput, setTotalTimeInput] = useState<number | ''>(60); // Default 60 mins (10+40+10)
  const [selectedSound, setSelectedSound] = useState('classic');

  // Timer State
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(-1); // -1: Not started, 0-2: Running, 3: Finished
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(true);
  
  // Alarm State
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  // --- AUDIO LOGIC (Web Audio API) ---
  const playAlarmSound = (type: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    
    // Resume context if suspended (browser policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

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
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.setValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      
      // Secondary beeps for digital feel
      const playSubBeep = (delay: number) => {
          const o2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          o2.connect(g2);
          g2.connect(ctx.destination);
          o2.type = 'square';
          o2.frequency.setValueAtTime(800, now + delay);
          g2.gain.setValueAtTime(0.2, now + delay);
          g2.gain.setValueAtTime(0, now + delay + 0.1);
          o2.start(now + delay);
          o2.stop(now + delay + 0.1);
      };
      playSubBeep(0.4);
      playSubBeep(0.8);

    } else {
      // Classic Beep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      
      // Repeat beep
      setTimeout(() => {
          if (ctx.state === 'closed') return;
          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.connect(g2);
          g2.connect(ctx.destination);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(600, ctx.currentTime);
          g2.gain.setValueAtTime(0.1, ctx.currentTime);
          g2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.5);
      }, 600);
    }
  };

  const startAlarmLoop = () => {
    setIsAlarmActive(true);
    // Play immediately
    playAlarmSound(selectedSound);
    
    // Clear any existing interval just in case
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);

    // Loop every 2.5 seconds
    alarmIntervalRef.current = window.setInterval(() => {
      playAlarmSound(selectedSound);
    }, 2500);
  };

  const stopAlarmAndProceed = () => {
    // 1. Stop Audio Loop
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setIsAlarmActive(false);
    setShowNotification(null);

    // 2. Proceed Logic
    if (activeSegmentIndex < 2) {
      // Move to next segment but PAUSE it
      const nextIndex = activeSegmentIndex + 1;
      setActiveSegmentIndex(nextIndex);
      setTimeLeft(config[nextIndex].durationMinutes * 60);
      setIsRunning(false); // REQUIRE MANUAL START
    } else {
      // All finished
      setActiveSegmentIndex(3); 
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      audioContextRef.current?.close();
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, []);

  // Sync Total Input when config changes manually
  useEffect(() => {
    const sum = config.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    setTotalTimeInput(sum);
  }, [config]);

  // --- TIMER LOGIC ---

  useEffect(() => {
    let interval: number;

    if (isRunning && activeSegmentIndex >= 0 && activeSegmentIndex < 3 && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0 && activeSegmentIndex < 3 && !isAlarmActive) {
      // Segment Finished -> Trigger Alarm Loop
      handleSegmentEnd();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, activeSegmentIndex, isAlarmActive]);

  const handleSegmentEnd = () => {
    setIsRunning(false);
    const currentSegment = config[activeSegmentIndex];
    setShowNotification(`WAKTU ${currentSegment.label.toUpperCase()} HABIS!`);
    startAlarmLoop();
  };

  // --- INPUT HANDLERS (Same as before) ---
  const handleDurationChange = (index: number, val: string) => {
    if (val === '') {
      const newConfig = [...config];
      newConfig[index].durationMinutes = 0;
      setConfig(newConfig);
      return;
    }
    const num = parseInt(val) || 0;
    const newConfig = [...config];
    newConfig[index].durationMinutes = num;
    setConfig(newConfig);
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
        { ...config[0], durationMinutes: sideDuration },
        { ...config[1], durationMinutes: core },
        { ...config[2], durationMinutes: sideDuration },
      ]);
    }
  };

  // --- CONTROLS ---

  const handleStartSetup = () => {
    setIsSetupMode(false);
    setActiveSegmentIndex(0);
    setTimeLeft(config[0].durationMinutes * 60);
    setIsRunning(false); 
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setActiveSegmentIndex(0);
    setTimeLeft(config[0].durationMinutes * 60);
  };

  const fullReset = () => {
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    setIsAlarmActive(false);
    setIsRunning(false);
    setIsSetupMode(true);
    setActiveSegmentIndex(-1);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate Progress
  const totalDurationCurrent = activeSegmentIndex >= 0 && activeSegmentIndex < 3 
    ? config[activeSegmentIndex].durationMinutes * 60 
    : 1;
  const progressPercent = activeSegmentIndex >= 0 && activeSegmentIndex < 3
    ? ((totalDurationCurrent - timeLeft) / totalDurationCurrent) * 100
    : 100;


  // --- RENDER ---

  if (isSetupMode) {
    const totalTimeCalculated = config.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    return (
      <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Penjaga Waktu Bersegmen</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Atur durasi untuk setiap fase pembelajaran. Aplikasi akan otomatis memberi sinyal saat pergantian segmen.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
           {/* Header & Total Calculator */}
           <div className="bg-indigo-600 p-6 text-white">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                 <Clock className="w-8 h-8" />
                 <h3 className="text-xl font-bold">Konfigurasi Waktu</h3>
               </div>
               
               {/* Quick Total Input */}
               <div className="flex items-center gap-3 bg-indigo-700/50 p-2 rounded-lg border border-indigo-500/30">
                 <label className="text-xs md:text-sm font-medium text-indigo-100 flex items-center gap-1">
                    <Calculator className="w-4 h-4" />
                    Set Total (Menit):
                 </label>
                 <input 
                   type="number" 
                   min="1" 
                   value={totalTimeInput}
                   onChange={(e) => handleTotalTimeChange(e.target.value)}
                   placeholder="0"
                   className="w-20 bg-white text-indigo-900 font-bold text-center rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-300"
                 />
                 <span className="text-xs text-indigo-200 hidden sm:inline">(Otomatis Set)</span>
               </div>
             </div>
           </div>

           <div className="p-8 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {config.map((seg, idx) => (
                  <div key={seg.id} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors relative">
                     <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${seg.color}`}>
                       {seg.label}
                     </label>
                     <div className="flex items-center gap-2">
                       <input 
                         type="number" 
                         min="0" 
                         value={seg.durationMinutes === 0 ? '' : seg.durationMinutes}
                         onChange={(e) => handleDurationChange(idx, e.target.value)}
                         placeholder=""
                         className="w-full text-3xl font-mono font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                       />
                       <span className="text-slate-400 font-medium">Menit</span>
                     </div>
                     <div className="absolute top-4 right-4 text-xs font-mono text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                       {totalTimeCalculated > 0 ? Math.round((seg.durationMinutes / totalTimeCalculated) * 100) : 0}%
                     </div>
                  </div>
                ))}
             </div>

             <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
               <div className="w-full md:w-auto">
                 <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                   <Bell className="w-4 h-4" /> Suara Alarm
                 </label>
                 <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                    {ALARM_TYPES.map(sound => (
                      <button
                        key={sound.id}
                        onClick={() => { setSelectedSound(sound.id); playAlarmSound(sound.id); }}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                          selectedSound === sound.id 
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        {sound.label}
                      </button>
                    ))}
                 </div>
               </div>

               <button
                 onClick={handleStartSetup}
                 className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
               >
                 <Play className="w-5 h-5 fill-current" />
                 Mulai Penjaga Waktu
               </button>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // FOCUS / RUNNING MODE

  const currentSegment = activeSegmentIndex < 3 ? config[activeSegmentIndex] : config[2];
  const isFinished = activeSegmentIndex === 3;

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 relative">
      
      {/* ALARM ACTIVE OVERLAY */}
      {isAlarmActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-600 rounded-3xl animate-in fade-in duration-300 text-white">
          <Bell className="w-32 h-32 animate-bounce mb-6" />
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase px-4 text-center mb-10">
            WAKTU {config[activeSegmentIndex].label.toUpperCase()} HABIS!
          </h1>
          <button
            onClick={stopAlarmAndProceed}
            className="bg-white text-red-600 hover:bg-slate-100 px-10 py-6 rounded-2xl font-black text-2xl md:text-3xl shadow-xl hover:scale-105 transition-transform flex items-center gap-4"
          >
            <Square className="w-8 h-8 fill-current" />
            HENTIKAN ALARM
          </button>
          <p className="mt-8 opacity-80 font-medium animate-pulse">Klik untuk lanjut ke segmen berikutnya</p>
        </div>
      )}

      {/* Main Clock Card (Behind Overlay if active) */}
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border-8 border-slate-800 relative">
        
        {/* Top Bar: Progress & Segments */}
        <div className="bg-slate-800 p-4 md:p-6 flex justify-between items-center border-b border-slate-700">
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 w-full no-scrollbar">
            {config.map((seg, idx) => {
               const isActive = idx === activeSegmentIndex;
               const isPast = idx < activeSegmentIndex;
               return (
                 <div 
                   key={seg.id} 
                   className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                     isActive 
                       ? 'bg-slate-700 border-indigo-500 text-white ring-2 ring-indigo-500/50' 
                       : isPast 
                         ? 'bg-slate-800 border-slate-600 text-slate-500 opacity-60' 
                         : 'bg-slate-800 border-slate-700 text-slate-400'
                   }`}
                 >
                   {isPast ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`}></div>}
                   <span className="font-bold text-sm md:text-base">{seg.label}</span>
                   <span className="text-xs font-mono opacity-60">({seg.durationMinutes}m)</span>
                 </div>
               )
            })}
             {isFinished && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/30 border border-green-500 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-bold">Selesai</span>
                </div>
             )}
          </div>
          
          <button onClick={fullReset} className="ml-4 p-2 text-slate-400 hover:text-white transition-colors" title="Kembali ke Pengaturan">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Main Display Area */}
        <div className="p-10 md:p-20 text-center relative bg-slate-900">
           
           {/* Active Segment Label */}
           <h2 className={`text-2xl md:text-4xl font-black uppercase tracking-[0.2em] mb-4 md:mb-8 ${isFinished ? 'text-green-500' : currentSegment.color}`}>
             {isFinished ? 'Pembelajaran Selesai' : currentSegment.label}
           </h2>

           {/* BIG CLOCK */}
           <div className={`font-mono text-[6rem] sm:text-[8rem] md:text-[12rem] leading-none font-bold tracking-tighter tabular-nums drop-shadow-2xl ${isRunning ? 'text-slate-100' : 'text-slate-500'}`}>
             {isFinished ? "00:00" : formatTime(timeLeft)}
           </div>
           
           {/* Status Text */}
           <div className="mt-4 text-slate-500 text-lg md:text-xl font-medium">
             {isFinished 
               ? "Semua segmen telah berakhir." 
               : isRunning 
                 ? "Waktu berjalan..." 
                 : (activeSegmentIndex === 0 && timeLeft === config[0].durationMinutes * 60) 
                    ? "Siap Memulai" 
                    : "Timer Dijeda - Tekan Play untuk Lanjut"}
           </div>

           {/* Background Progress Bar (Bottom) */}
           {!isFinished && (
             <div className="absolute bottom-0 left-0 w-full h-3 bg-slate-800">
               <div 
                 className={`h-full transition-all duration-1000 ease-linear ${
                    activeSegmentIndex === 0 ? 'bg-blue-600' : activeSegmentIndex === 1 ? 'bg-emerald-600' : 'bg-orange-600'
                 }`}
                 style={{ width: `${progressPercent}%` }}
               ></div>
             </div>
           )}
        </div>

        {/* Controls Footer */}
        <div className="bg-slate-800 p-6 md:p-8 flex justify-center gap-6 border-t border-slate-700">
           {!isFinished && (
             <>
               <button
                 onClick={toggleTimer}
                 className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                   isRunning 
                     ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                     : 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse'
                 }`}
               >
                 {isRunning ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
               </button>

               <button
                 onClick={resetTimer}
                 className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition-all transform active:scale-95"
                 title="Ulangi Segmen Ini"
               >
                 <RotateCcw className="w-8 h-8" />
               </button>
             </>
           )}
           
           {isFinished && (
             <button
                onClick={fullReset}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center gap-2"
             >
               <RotateCcw className="w-5 h-5" />
               Mulai Sesi Baru
             </button>
           )}
        </div>

      </div>
      
      {/* Help Text */}
      <p className="mt-6 text-slate-400 text-sm flex items-center gap-2">
         <Volume2 className="w-4 h-4" />
         Pastikan volume perangkat Anda aktif untuk mendengar alarm.
      </p>

    </div>
  );
};

export default TimeKeeper;