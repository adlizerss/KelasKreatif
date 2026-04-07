import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Student } from '../types';
import InputSection from './InputSection';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  RotateCcw, 
  Play, 
  Trophy, 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Disc, 
  Box, 
  Dices,
  Grid3X3
} from 'lucide-react';

// --- AUDIO & CONFETTI HELPERS ---

const createAudioContext = () => {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return null;
    return new AudioContext();
  } catch (e) {
    return null;
  }
};

const playTickSound = (ctx: AudioContext) => {
  try {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

const playWinSound = (ctx: AudioContext) => {
  try {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    const times = [0, 0.15, 0.3, 0.6, 0.75, 0.9];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + times[i]);
      gain.gain.linearRampToValueAtTime(0.3, now + times[i] + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + times[i] + 0.4);
      osc.start(now + times[i]);
      osc.stop(now + times[i] + 0.4);
    });
  } catch (e) {}
};

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
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 1) * 20,
      size: Math.random() * 8 + 4,
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
        p.size *= 0.95;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    if (active) requestAnimationFrame(animate);
  };
  animate();
};

const WHEEL_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', 
  '#6366f1', '#f97316', '#14b8a6', '#d946ef',
];

// --- SUB-COMPONENTS ---

const WheelView = ({ 
  activeStudents, 
  isSpinning, 
  rotation, 
  spin, 
  getFontSize, 
  getWheelBackground,
  hasEnoughData
}: any) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      {/* POINTER */}
      <div className="relative z-30 mb-[-25px] drop-shadow-xl">
           <div className="w-12 h-14 bg-rose-600 clip-arrow flex items-center justify-center border-t-4 border-rose-400">
              <div className="w-3 h-3 bg-rose-800 rounded-full mt-[-20px] border-2 border-rose-300"></div>
           </div>
      </div>
      <style>{` .clip-arrow { clip-path: polygon(50% 100%, 0% 0%, 100% 0%); } `}</style>

      {/* WHEEL */}
      <div className="relative z-10 p-2 rounded-full bg-white dark:bg-slate-700 shadow-2xl">
        <div className="relative w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] sm:w-[450px] sm:h-[450px] rounded-full overflow-hidden transition-all duration-500 border-4 border-white dark:border-slate-600">
           <div 
             className="w-full h-full rounded-full relative"
             style={{ 
               transform: `rotate(${rotation}deg)`,
               transition: isSpinning ? 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
               background: getWheelBackground()
             }}
           >
             {activeStudents.length === 0 ? (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">Kosong</div>
             ) : (
                activeStudents.map((student: any, i: number) => {
                  const sliceAngle = 360 / activeStudents.length;
                  const midAngle = (i * sliceAngle) + (sliceAngle / 2);
                  return (
                    <div
                      key={student.id}
                      className="absolute top-1/2 left-1/2 flex items-center justify-end"
                      style={{
                        width: '50%',
                        height: '24px',
                        transformOrigin: '0% 50%',
                        transform: `translateY(-50%) rotate(${midAngle - 90}deg)`,
                        paddingRight: '12px',
                        paddingLeft: '32px',
                      }}
                    >
                       <div className="w-full text-right overflow-hidden">
                          <span 
                            className={`text-white drop-shadow-md truncate inline-block max-w-full leading-none ${getFontSize()}`}
                            style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
                          >
                            {student.name}
                          </span>
                       </div>
                    </div>
                  );
                })
             )}
           </div>
           <div className="absolute top-1/2 left-1/2 w-14 h-14 bg-white dark:bg-slate-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg z-20 flex items-center justify-center border-4 border-rose-50 dark:border-rose-900">
              <div className="w-6 h-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full shadow-inner"></div>
           </div>
        </div>
      </div>

      <div className="relative z-20 mt-10">
        <button
          onClick={spin}
          disabled={isSpinning || !hasEnoughData}
          className={`
            group relative px-10 py-5 rounded-2xl font-black text-xl tracking-widest uppercase transition-all duration-300 transform
            ${isSpinning || !hasEnoughData
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed scale-95' 
              : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xl hover:scale-105 hover:shadow-2xl hover:-translate-y-1'
            }
          `}
        >
          <span className="flex items-center gap-3 relative z-10">
            {isSpinning ? (
              <>
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <span>Memutar...</span>
              </>
            ) : (
              <>
                 <Play className="w-6 h-6 fill-current" />
                 <span>Putar</span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

const BoxView = ({ shuffledStudents, onReveal, revealedIndices }: any) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl p-4">
        {shuffledStudents.map((student: any, index: number) => {
          const isRevealed = revealedIndices.includes(index);
          return (
            <motion.button
              key={`${student.id}-${index}`}
              layout
              onClick={() => onReveal(index)}
              disabled={isRevealed}
              whileHover={!isRevealed ? { scale: 1.05, rotate: [0, -2, 2, 0] } : {}}
              whileTap={!isRevealed ? { scale: 0.95 } : {}}
              className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center p-2 shadow-lg transition-all relative overflow-hidden
                ${isRevealed 
                  ? 'bg-white dark:bg-slate-800 border-2 border-indigo-500 dark:border-indigo-400' 
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-b-4 border-indigo-700 cursor-pointer'
                }
              `}
            >
              {isRevealed ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-center"
                 >
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Terpilih</span>
                   <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-tight line-clamp-2">{student.name}</span>
                 </motion.div>
              ) : (
                 <span className="text-4xl font-black drop-shadow-md">{index + 1}</span>
              )}
              
              {/* Shine effect */}
              {!isRevealed && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              )}
            </motion.button>
          );
        })}
      </div>
      {shuffledStudents.length === 0 && (
        <div className="text-slate-400 text-center">Belum ada data. Masukkan nama terlebih dahulu.</div>
      )}
    </div>
  );
};

const DiceView = ({ activeStudents, rollDice, isRolling }: any) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <motion.div
        animate={isRolling ? { 
          rotateX: [0, 360, 720, 1080], 
          rotateY: [0, 360, 720, 1080],
          y: [0, -50, 0, -30, 0],
          scale: [1, 1.2, 1]
        } : {}}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="w-40 h-40 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center mb-12 relative"
      >
        <Dices className={`w-20 h-20 text-indigo-500 ${isRolling ? 'opacity-50' : 'opacity-100'}`} />
        {isRolling && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-3xl bg-indigo-400 opacity-20"></span>
          </div>
        )}
      </motion.div>

      <button
        onClick={rollDice}
        disabled={isRolling || activeStudents.length === 0}
        className={`
          group relative px-10 py-5 rounded-2xl font-black text-xl tracking-widest uppercase transition-all duration-300 transform
          ${isRolling || activeStudents.length === 0
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed scale-95' 
            : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl hover:scale-105 hover:shadow-2xl hover:-translate-y-1'
          }
        `}
      >
        <span className="flex items-center gap-3 relative z-10">
           <Dices className="w-6 h-6" />
           <span>Kocok Dadu</span>
        </span>
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---

const Randomizer: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'wheel' | 'box' | 'dice'>('wheel');
  
  // Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  // Box State
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [shuffledStudents, setShuffledStudents] = useState<Student[]>([]);

  // Dice State
  const [isRolling, setIsRolling] = useState(false);

  // Shared State
  const [winner, setWinner] = useState<Student | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickTimeoutRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeStudents = useMemo(() => students.filter(s => !removedIds.has(s.id)), [students, removedIds]);
  const hasEnoughData = activeStudents.length > 1;

  // --- AUDIO INIT ---
  const initAudio = () => {
    if (!audioCtxRef.current) audioCtxRef.current = createAudioContext();
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume().catch(() => {});
  };

  // --- HANDLERS ---
  const handleStudentsLoaded = (newStudents: Student[]) => {
    setStudents(newStudents);
    setRemovedIds(new Set()); 
    setRotation(0);
    setWinner(null);
    setRevealedIndices([]);
  };

  const handleReset = () => {
    setStudents([]);
    setRemovedIds(new Set());
    setRotation(0);
    setWinner(null);
    setRevealedIndices([]);
  };

  // Sync Shuffled Students for Box Mode
  useEffect(() => {
    // When activeStudents changes (content or length), re-shuffle and reset boxes
    // This ensures that if a student is removed, the grid is regenerated cleanly.
    setShuffledStudents([...activeStudents].sort(() => Math.random() - 0.5));
    setRevealedIndices([]);
  }, [activeStudents]);

  // --- WHEEL LOGIC ---
  const spin = () => {
    if (isSpinning || !hasEnoughData) return;
    initAudio();
    setIsSpinning(true);
    setWinner(null);

    const winnerIndex = Math.floor(Math.random() * activeStudents.length);
    const selectedStudent = activeStudents[winnerIndex];

    const sliceAngle = 360 / activeStudents.length;
    const winnerAngle = (winnerIndex * sliceAngle) + (sliceAngle / 2);
    const fullSpins = 360 * 6; 
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.4); 
    const currentRotationMod = rotation % 360;
    let distanceToTarget = (360 - winnerAngle) - currentRotationMod;
    while (distanceToTarget < 0) distanceToTarget += 360;
    distanceToTarget += jitter;
    const newRotation = rotation + fullSpins + distanceToTarget;

    setRotation(newRotation);

    const duration = 5000;
    let elapsed = 0;
    let tickDelay = 50;
    const playTicks = () => {
       if (!soundEnabled || elapsed >= duration) return;
       if (audioCtxRef.current) playTickSound(audioCtxRef.current);
       tickDelay = tickDelay * 1.08;
       elapsed += tickDelay;
       if (elapsed < duration) tickTimeoutRef.current = window.setTimeout(playTicks, tickDelay);
    };
    playTicks();

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(selectedStudent);
      if (soundEnabled && audioCtxRef.current) playWinSound(audioCtxRef.current);
      if (canvasRef.current) fireConfetti(canvasRef.current);
    }, duration);
  };

  // --- BOX LOGIC ---
  const handleBoxReveal = (index: number) => {
    if (revealedIndices.includes(index)) return;
    initAudio();
    
    const selectedStudent = shuffledStudents[index];
    
    // Add to revealed
    setRevealedIndices(prev => [...prev, index]);
    
    setWinner(selectedStudent);
    if (soundEnabled && audioCtxRef.current) playWinSound(audioCtxRef.current);
    if (canvasRef.current) fireConfetti(canvasRef.current);
  };

  // --- DICE LOGIC ---
  const rollDice = () => {
    if (isRolling || activeStudents.length === 0) return;
    initAudio();
    setIsRolling(true);
    setWinner(null);

    let elapsed = 0;
    const interval = setInterval(() => {
      if (soundEnabled && audioCtxRef.current) playTickSound(audioCtxRef.current);
      elapsed += 100;
      if (elapsed > 1500) clearInterval(interval);
    }, 100);

    setTimeout(() => {
      const winnerIndex = Math.floor(Math.random() * activeStudents.length);
      const selectedStudent = activeStudents[winnerIndex];
      setIsRolling(false);
      setWinner(selectedStudent);
      if (soundEnabled && audioCtxRef.current) playWinSound(audioCtxRef.current);
      if (canvasRef.current) fireConfetti(canvasRef.current);
    }, 1500);
  };

  const removeWinner = () => {
    if (winner) {
      const newRemoved = new Set(removedIds);
      newRemoved.add(winner.id);
      setRemovedIds(newRemoved);
      setWinner(null);
      // Note: This will trigger the useEffect to re-shuffle and reset boxes, which is desired behavior.
    }
  };

  const getWheelBackground = () => {
    if (activeStudents.length === 0) return '#e2e8f0';
    const parts = activeStudents.map((_, i) => {
       const start = i * (360 / activeStudents.length);
       const end = (i + 1) * (360 / activeStudents.length);
       return `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  };

  const getFontSize = () => {
     const count = activeStudents.length;
     if (count > 40) return 'text-[8px]';
     if (count > 30) return 'text-[9px]';
     if (count > 20) return 'text-[10px]';
     if (count > 12) return 'text-xs';
     return 'text-sm font-bold';
  };

  return (
    <div className="animate-in fade-in duration-500 pb-40 relative">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[70]" />

      {/* WINNER MODAL */}
      <AnimatePresence>
        {winner && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
               onClick={() => setWinner(null)}
             ></motion.div>
             <motion.div 
               initial={{ scale: 0.5, opacity: 0, y: 50 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.5, opacity: 0, y: 50 }}
               transition={{ type: "spring", damping: 15 }}
               className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border-4 border-indigo-500 overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 z-0"></div>
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                
                <div className="relative z-10">
                   <div className="inline-flex p-3 rounded-full bg-yellow-100 text-yellow-600 mb-4 shadow-sm animate-bounce">
                      <Trophy className="w-8 h-8 fill-current" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Terpilih</h3>
                   <div className="py-4 my-2 border-y-2 border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 break-words leading-tight px-2">
                        {winner.name}
                      </h2>
                   </div>
                   <div className="mt-6 flex flex-col gap-3">
                      <button 
                        onClick={removeWinner}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                      >
                         <Trash2 className="w-5 h-5" /> Hapus & Tutup
                      </button>
                      <button 
                        onClick={() => setWinner(null)}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                         <RotateCcw className="w-5 h-5" /> Simpan & Putar Lagi
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Pengundian Acak</h2>
        <p className="text-slate-500 dark:text-slate-400">Pilih metode pengundian yang paling seru untuk kelasmu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
           <InputSection 
              onStudentsLoaded={handleStudentsLoaded} 
              currentCount={activeStudents.length}
              title="Daftar Nama"
              colorTheme="rose"
           >
              {activeStudents.length > 0 && (
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">Nama Tersedia ({activeStudents.length})</h3>
                      <button onClick={handleReset} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                   </div>
                   <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                      {activeStudents.map((s, i) => (
                         <div key={s.id} className="text-sm px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-md flex justify-between items-center group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                           <span className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-300">
                             <span className="text-slate-400 font-mono text-xs w-4">{i + 1}.</span> {s.name}
                           </span>
                           <button onClick={() => { const newRemoved = new Set(removedIds); newRemoved.add(s.id); setRemovedIds(newRemoved); }} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                             <X className="w-3 h-3" />
                           </button>
                         </div>
                      ))}
                   </div>
                </div>
              )}
           </InputSection>
        </div>

        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-2xl border border-rose-100 dark:border-rose-900/30 min-h-[600px] flex flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-50 via-pink-50 to-orange-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 opacity-50"></div>
            
            {/* TOOLBAR */}
            <div className="relative z-20 flex justify-between items-center mb-8 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl backdrop-blur-sm">
              <div className="flex gap-1">
                <button 
                  onClick={() => setMode('wheel')}
                  className={`p-2 rounded-xl flex items-center gap-2 transition-all ${mode === 'wheel' ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  <Disc className="w-5 h-5" />
                  <span className="hidden sm:inline">Roda</span>
                </button>
                <button 
                  onClick={() => setMode('box')}
                  className={`p-2 rounded-xl flex items-center gap-2 transition-all ${mode === 'box' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                  <span className="hidden sm:inline">Kotak</span>
                </button>
                <button 
                  onClick={() => setMode('dice')}
                  className={`p-2 rounded-xl flex items-center gap-2 transition-all ${mode === 'dice' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  <Dices className="w-5 h-5" />
                  <span className="hidden sm:inline">Dadu</span>
                </button>
              </div>

              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

            {/* CONTENT AREA */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {mode === 'wheel' && (
                  <motion.div 
                    key="wheel"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full"
                  >
                    <WheelView 
                      activeStudents={activeStudents}
                      isSpinning={isSpinning}
                      rotation={rotation}
                      spin={spin}
                      getFontSize={getFontSize}
                      getWheelBackground={getWheelBackground}
                      hasEnoughData={hasEnoughData}
                    />
                  </motion.div>
                )}
                {mode === 'box' && (
                  <motion.div 
                    key="box"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full"
                  >
                    <BoxView 
                      shuffledStudents={shuffledStudents}
                      onReveal={handleBoxReveal}
                      revealedIndices={revealedIndices}
                    />
                  </motion.div>
                )}
                {mode === 'dice' && (
                  <motion.div 
                    key="dice"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full"
                  >
                    <DiceView 
                      activeStudents={activeStudents}
                      rollDice={rollDice}
                      isRolling={isRolling}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Randomizer;
