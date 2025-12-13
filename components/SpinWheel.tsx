import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types';
import InputSection from './InputSection';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, Play, Trophy, X, Sparkles, Volume2, VolumeX } from 'lucide-react';

// --- AUDIO ENGINE (Synthesizer Sederhana) ---
const playTickSound = (ctx: AudioContext) => {
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Suara "Tik" pendek dan tajam (Woodblock style)
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
  
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
};

const playWinSound = (ctx: AudioContext) => {
  if (ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime;
  
  // Arpeggio C Major (C - E - G - C_High)
  const notes = [523.25, 659.25, 783.99, 1046.50];
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + (i * 0.1);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5);
    
    osc.start(startTime);
    osc.stop(startTime + 1.5);
  });

  // Tambahan efek "Sparkle" (High frequency randomness)
  setTimeout(() => {
     for(let i=0; i<10; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 2000 + Math.random() * 1000;
        gain.gain.setValueAtTime(0.05, ctx.currentTime + (i*0.05));
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + (i*0.05) + 0.1);
        osc.start(ctx.currentTime + (i*0.05));
        osc.stop(ctx.currentTime + (i*0.05) + 0.1);
     }
  }, 400);
};

// --- CONFETTI ENGINE (Simple Canvas) ---
const fireConfetti = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles: any[] = [];
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 25,
      vy: (Math.random() - 1) * 25,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 100,
      gravity: 0.5
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    
    particles.forEach(p => {
      if (p.life > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life--;
        p.size *= 0.96;
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (active) requestAnimationFrame(animate);
    else {
        // Clear canvas when done
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  animate();
};


const WHEEL_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', 
  '#3498DB', '#F1C40F', '#E67E22', '#2ECC71',
];

const SpinWheel: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Student | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickTimeoutRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeStudents = students.filter(s => !removedIds.has(s.id));
  const hasEnoughData = activeStudents.length > 1;

  // Initialize Audio Context on user interaction (Play button)
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const handleStudentsLoaded = (newStudents: Student[]) => {
    setStudents(newStudents);
    setRemovedIds(new Set()); 
    setRotation(0);
    setWinner(null);
  };

  const handleReset = () => {
    setStudents([]);
    setRemovedIds(new Set());
    setRotation(0);
    setWinner(null);
  };

  // Logic untuk mengatur ritme suara "tik" agar melambat
  const scheduleTicks = (duration: number, totalRotation: number) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    
    // Kita simulasi: Semakin lama, delay antar "tik" semakin panjang.
    // Ini bukan fisika sempurna, tapi cukup untuk efek dramatis.
    let elapsed = 0;
    let delay = 50; // Mulai cepat (50ms)
    
    const tickLoop = () => {
       if (elapsed >= duration) return;

       playTickSound(audioCtxRef.current!);
       
       // Perlambat delay secara eksponensial
       // Faktor 1.05 - 1.15 memberikan perlambatan yang natural
       delay = delay * 1.08; 
       elapsed += delay;

       if (elapsed < duration) {
          tickTimeoutRef.current = window.setTimeout(tickLoop, delay);
       }
    };

    tickLoop();
  };

  const spin = () => {
    if (isSpinning || !hasEnoughData) return;

    initAudio(); // Pastikan audio siap
    setIsSpinning(true);
    setWinner(null);

    // Kalkulasi putaran
    const randomExtra = Math.floor(Math.random() * 360);
    const spinDuration = 5000; // 5 Detik ketegangan
    const totalSpin = (360 * 8) + randomExtra; // 8 Putaran penuh + acak
    const newRotation = rotation + totalSpin;

    setRotation(newRotation);
    
    // Jalankan efek suara ketegangan
    scheduleTicks(spinDuration, totalSpin);

    // Durasi animasi CSS harus match dengan timeout ini
    setTimeout(() => {
      setIsSpinning(false);
      calculateWinner(newRotation);
    }, spinDuration);
  };

  const calculateWinner = (finalRotation: number) => {
    const normalizedRotation = finalRotation % 360;
    const viewAngle = (360 - (normalizedRotation % 360)) % 360;
    const segmentAngle = 360 / activeStudents.length;
    const winningIndex = Math.floor(viewAngle / segmentAngle);
    
    const winnerStudent = activeStudents[winningIndex % activeStudents.length];
    setWinner(winnerStudent);
    
    // Celebration Effects
    if (soundEnabled && audioCtxRef.current) {
       playWinSound(audioCtxRef.current);
    }
    if (canvasRef.current) {
        fireConfetti(canvasRef.current);
    }
  };

  const removeWinner = () => {
    if (winner) {
      const newRemoved = new Set(removedIds);
      newRemoved.add(winner.id);
      setRemovedIds(newRemoved);
      setWinner(null);
    }
  };

  const getCoordinatesForPercent = (percent: number, radius: number) => {
    const x = Math.cos(2 * Math.PI * percent) * radius;
    const y = Math.sin(2 * Math.PI * percent) * radius;
    return [x, y];
  };

  useEffect(() => {
     return () => {
        if (tickTimeoutRef.current) clearTimeout(tickTimeoutRef.current);
     }
  }, []);

  return (
    <div className="animate-in fade-in duration-500 pb-12 relative">
      {/* Canvas Layer for Confetti */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]" />

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Roda Keberuntungan</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Putar roda untuk memilih nama secara acak. Ideal untuk undian, giliran presentasi, atau doorprize.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Input Data & List */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
           <InputSection 
              onStudentsLoaded={handleStudentsLoaded} 
              currentCount={activeStudents.length}
              title="Daftar Nama"
           />
           
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  Nama Tersedia ({activeStudents.length})
                </h3>
                {activeStudents.length > 0 && (
                  <button onClick={handleReset} className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
             </div>
             
             <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
               {activeStudents.length === 0 ? (
                 <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                   <p className="text-sm">Belum ada data nama.</p>
                   <p className="text-xs mt-1">Gunakan panel input di atas.</p>
                 </div>
               ) : (
                 activeStudents.map((s, i) => (
                   <div key={s.id} className="text-sm px-3 py-2 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-md flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-600/80 transition-colors group">
                     <span className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-200">
                       <span className="text-slate-300 dark:text-slate-500 font-mono text-xs w-4">{i + 1}.</span>
                       {s.name}
                     </span>
                     <button 
                        onClick={() => {
                          const newRemoved = new Set(removedIds);
                          newRemoved.add(s.id);
                          setRemovedIds(newRemoved);
                        }}
                        className="text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                        title="Hapus nama ini"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 ))
               )}
             </div>
           </div>
        </div>

        {/* Kolom Kanan: Area Roda (The Stage) */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          {/* THE STAGE: Now fully adaptive to Light/Dark mode */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-12 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[500px] transition-colors duration-500">
            
            {/* Background Effects: Light (Indigo/Pink Gradient) vs Dark (Slate Gradient) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50 via-purple-50 to-pink-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500"></div>
            <div className="absolute inset-0 opacity-30 dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] transition-opacity duration-500"></div>
            
            {/* Sound Toggle */}
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
              title={soundEnabled ? "Matikan Suara" : "Hidupkan Suara"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Container Roda */}
            <div className="relative z-10 scale-95 sm:scale-100">
              
              {/* Pointer (Jarum Penunjuk) - Fixed at Top with shadow */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30 drop-shadow-2xl">
                 <div className="w-14 h-16 bg-red-600 clip-arrow shadow-lg relative flex items-center justify-center border-t-4 border-red-400">
                    <div className="w-4 h-4 bg-red-800 rounded-full mt-[-15px] border-2 border-red-400"></div>
                 </div>
              </div>
              <style>{` .clip-arrow { clip-path: polygon(50% 100%, 0% 0%, 100% 0%); } `}</style>

              {/* Roda Putar - Adaptive Border & Shadow */}
              <div 
                className="relative w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] sm:w-[450px] sm:h-[450px] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_60px_rgba(0,0,0,0.6)] border-[12px] border-white dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-500"
              >
                 {/* Pegs / Pasak di sekeliling roda */}
                 {Array.from({ length: 24 }).map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-3 h-3 bg-slate-200 dark:bg-slate-300 rounded-full shadow-md z-20"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${i * 15}deg) translate(calc(50% + 225px - 14px))`, 
                      }}
                    />
                 ))}

                 {/* Rotating Disc */}
                 <div 
                    className="w-full h-full rounded-full overflow-hidden transition-transform ease-[cubic-bezier(0.1,0.05,0.15,1.0)]"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transitionDuration: isSpinning ? '5s' : '0s' // Increased to 5s for suspense
                    }}
                 >
                    {activeStudents.length > 0 ? (
                      <svg viewBox="-100 -100 200 200" className="w-full h-full transform -rotate-90"> 
                         {activeStudents.map((student, index) => {
                           const count = activeStudents.length;
                           const sliceAngle = 1 / count;
                           const startAngle = index * sliceAngle;
                           const endAngle = (index + 1) * sliceAngle;
                           
                           const [startX, startY] = getCoordinatesForPercent(startAngle, 100);
                           const [endX, endY] = getCoordinatesForPercent(endAngle, 100);
                           
                           const largeArcFlag = sliceAngle > 0.5 ? 1 : 0;
                           const pathData = `M 0 0 L ${startX} ${startY} A 100 100 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

                           const midAnglePercent = startAngle + (sliceAngle / 2);
                           const rotateAngle = midAnglePercent * 360; 

                           const bgColor = WHEEL_COLORS[index % WHEEL_COLORS.length];
                           const isLightBg = ['#FFEEAD', '#F1C40F', '#96CEB4'].includes(bgColor);
                           const textColor = isLightBg ? '#1e293b' : 'white';

                           return (
                             <g key={student.id}>
                               <path 
                                 d={pathData} 
                                 fill={bgColor} 
                                 stroke="rgba(0,0,0,0.15)" 
                                 strokeWidth="0.8" 
                               />
                               <g transform={`rotate(${rotateAngle})`}>
                                  <text
                                    x="65" 
                                    y="2" 
                                    fill={textColor}
                                    fontSize={count > 24 ? "3.5" : count > 12 ? "4.5" : "6"}
                                    fontWeight="800"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    fontFamily="sans-serif"
                                    style={{ userSelect: 'none', textShadow: isLightBg ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)' }}
                                  >
                                    {student.name.length > 14 ? student.name.substring(0, 12) + '..' : student.name}
                                  </text>
                               </g>
                             </g>
                           );
                         })}
                      </svg>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium p-8 text-center transition-colors">
                        <span className="text-lg">Input Data untuk Memulai</span>
                      </div>
                    )}
                 </div>

                 {/* Center Hub (Poros Tengah) */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.4)] z-20 flex items-center justify-center border-4 border-slate-100 dark:border-slate-200 transition-colors">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-full"></div>
                       <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-white drop-shadow-md" />
                    </div>
                 </div>
              </div>

            </div>

            {/* Controls */}
            <div className="mt-12 relative z-20 flex flex-col items-center gap-4">
              <button
                onClick={spin}
                disabled={isSpinning || !hasEnoughData}
                className={`group relative px-10 py-4 rounded-full font-bold text-xl tracking-wide shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all transform active:scale-95 ${
                  !isSpinning && hasEnoughData
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-[0_0_30px_rgba(255,165,0,0.6)] hover:-translate-y-1'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-600'
                }`}
              >
                 <span className="relative z-10 flex items-center gap-2">
                   {isSpinning ? 'MENUNGGU HASIL...' : 'PUTAR SEKARANG'}
                   {!isSpinning && <Play className="w-5 h-5 fill-current" />}
                 </span>
                 {!isSpinning && hasEnoughData && (
                   <div className="absolute inset-0 rounded-full bg-white opacity-20 group-hover:animate-pulse"></div>
                 )}
              </button>
              
              {!hasEnoughData && (
                 <p className="text-slate-500 dark:text-slate-400 text-sm bg-white/60 dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                   {activeStudents.length === 0 ? "Masukkan nama peserta di panel kiri" : "Minimal 2 peserta diperlukan"}
                 </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, rotateX: -20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden text-center relative border-4 border-white dark:border-slate-700 ring-4 ring-indigo-500/30"
            >
              <div className="bg-gradient-to-b from-indigo-500 to-purple-600 p-10 relative overflow-hidden">
                {/* Background Animation inside Modal */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
                <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-yellow-400/30 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                   <motion.div 
                     initial={{ scale: 0, rotate: -180 }}
                     animate={{ scale: 1.2, rotate: 0 }}
                     transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                     className="mx-auto w-24 h-24 bg-white text-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-2xl border-4 border-yellow-200"
                   >
                      <Trophy className="w-12 h-12" strokeWidth={1.5} />
                   </motion.div>
                   <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                   >
                      <h3 className="text-indigo-100 font-bold uppercase tracking-wider text-sm mb-2 flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" /> Selamat Kepada <Sparkles className="w-4 h-4" />
                      </h3>
                      <h2 className="text-4xl font-black text-white leading-tight drop-shadow-lg break-words">
                        {winner.name}
                      </h2>
                   </motion.div>
                </div>
              </div>

              <div className="p-6 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={removeWinner}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                >
                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Hapus & Putar Lagi
                </button>
                <button
                  onClick={() => setWinner(null)}
                  className="w-full py-3 px-4 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors text-sm"
                >
                  Tutup, biarkan nama tetap ada
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpinWheel;