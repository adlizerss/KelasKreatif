import React, { useState } from 'react';
import { Student } from '../types';
import InputSection from './InputSection';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, Play, Trophy, X, ChevronRight } from 'lucide-react';

// Palet warna yang lebih cerah dan kontras untuk Roda
const WHEEL_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#96CEB4', // Green
  '#FFEEAD', // Cream Yellow (Text needs to be dark)
  '#D4A5A5', // Pinkish
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#F1C40F', // Yellow
  '#E67E22', // Orange
  '#2ECC71', // Emerald
];

const SpinWheel: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Student | null>(null);
  
  // Set untuk menyimpan ID siswa yang sudah menang dan dihapus
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const activeStudents = students.filter(s => !removedIds.has(s.id));
  const hasEnoughData = activeStudents.length > 1;

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

  const spin = () => {
    if (isSpinning || !hasEnoughData) return;

    setIsSpinning(true);
    setWinner(null);

    // Kalkulasi putaran
    // Minimal 5x putaran penuh (1800 derajat) + variasi acak
    const randomExtra = Math.floor(Math.random() * 360);
    const totalSpin = 1800 + randomExtra; 
    const newRotation = rotation + totalSpin;

    setRotation(newRotation);

    // Durasi animasi CSS harus match dengan timeout ini (4s)
    setTimeout(() => {
      setIsSpinning(false);
      calculateWinner(newRotation);
    }, 4000);
  };

  const calculateWinner = (finalRotation: number) => {
    const normalizedRotation = finalRotation % 360;
    
    // Pointer ada di posisi jam 12 (Posisi Atas).
    // SVG Roda diputar -90 derajat secara statis, sehingga Index 0 mulai dari Jam 12.
    // Ketika Roda berputar Clockwise (rotasi positif), Index 0 bergerak ke kanan (Jam 1, 2, dst).
    // Pointer statis di Jam 12.
    // Maka, posisi pointer relatif terhadap roda bergerak Counter-Clockwise (Mundur dari Index 0).
    // Rumus: viewAngle = (360 - rotation) % 360.
    
    const viewAngle = (360 - (normalizedRotation % 360)) % 360;
    
    const segmentAngle = 360 / activeStudents.length;
    const winningIndex = Math.floor(viewAngle / segmentAngle);
    
    const winnerStudent = activeStudents[winningIndex % activeStudents.length];
    setWinner(winnerStudent);
  };

  const removeWinner = () => {
    if (winner) {
      const newRemoved = new Set(removedIds);
      newRemoved.add(winner.id);
      setRemovedIds(newRemoved);
      setWinner(null);
    }
  };

  // Helper untuk membuat path SVG Pie Slice
  const getCoordinatesForPercent = (percent: number, radius: number) => {
    const x = Math.cos(2 * Math.PI * percent) * radius;
    const y = Math.sin(2 * Math.PI * percent) * radius;
    return [x, y];
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {/* Judul Halaman */}
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
          <div className="bg-slate-900 rounded-3xl p-6 lg:p-12 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[500px]">
            
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            {/* Container Roda */}
            <div className="relative z-10 scale-95 sm:scale-100">
              
              {/* Pointer (Jarum Penunjuk) - Fixed at Top */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30 drop-shadow-xl">
                 <div className="w-12 h-14 bg-red-500 clip-arrow shadow-lg relative flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-700 rounded-full mt-[-10px]"></div>
                 </div>
              </div>
              
              {/* Style untuk bentuk Arrow CSS */}
              <style>{`
                .clip-arrow {
                  clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
                }
              `}</style>

              {/* Roda Putar */}
              <div 
                className="relative w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] sm:w-[450px] sm:h-[450px] rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-8 border-slate-700 bg-slate-800"
              >
                 <div 
                    className="w-full h-full rounded-full overflow-hidden transition-transform ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transitionDuration: isSpinning ? '4s' : '0s'
                    }}
                 >
                    {activeStudents.length > 0 ? (
                      <svg viewBox="-100 -100 200 200" className="w-full h-full transform -rotate-90"> 
                        {/* -rotate-90 agar index 0 mulai dari jam 12 (karena SVG mulai dari jam 3) */}
                         {activeStudents.map((student, index) => {
                           const count = activeStudents.length;
                           const sliceAngle = 1 / count; // percent of circle
                           const startAngle = index * sliceAngle;
                           const endAngle = (index + 1) * sliceAngle;
                           
                           // Kalkulasi koordinat path
                           const [startX, startY] = getCoordinatesForPercent(startAngle, 100);
                           const [endX, endY] = getCoordinatesForPercent(endAngle, 100);
                           
                           const largeArcFlag = sliceAngle > 0.5 ? 1 : 0;
                           const pathData = `M 0 0 L ${startX} ${startY} A 100 100 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

                           // Kalkulasi rotasi teks
                           // Sudut tengah segmen (dalam range 0-1)
                           const midAnglePercent = startAngle + (sliceAngle / 2);
                           // Konversi ke derajat (0-360)
                           const rotateAngle = midAnglePercent * 360; 

                           // Warna Text: Hitam jika background terang, Putih jika gelap
                           const bgColor = WHEEL_COLORS[index % WHEEL_COLORS.length];
                           const isLightBg = ['#FFEEAD', '#F1C40F', '#96CEB4'].includes(bgColor); // Simple check
                           const textColor = isLightBg ? '#1e293b' : 'white';

                           return (
                             <g key={student.id}>
                               <path 
                                 d={pathData} 
                                 fill={bgColor} 
                                 stroke="rgba(0,0,0,0.1)" 
                                 strokeWidth="0.5" 
                               />
                               {/* Group Text Transform */}
                               <g transform={`rotate(${rotateAngle})`}>
                                  <text
                                    x="60" 
                                    y="2" 
                                    fill={textColor}
                                    fontSize={count > 24 ? "3.5" : count > 12 ? "4.5" : "6"}
                                    fontWeight="700"
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
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 font-medium p-8 text-center">
                        <span className="text-white/20 text-lg">Input Data untuk Memulai</span>
                      </div>
                    )}
                 </div>

                 {/* Center Hub (Poros Tengah) */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-20 flex items-center justify-center border-4 border-slate-200">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-inner">
                      <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-md" />
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
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
                }`}
              >
                 <span className="relative z-10 flex items-center gap-2">
                   {isSpinning ? 'MEMUTAR...' : 'PUTAR SEKARANG'}
                   {!isSpinning && <Play className="w-5 h-5 fill-current" />}
                 </span>
                 {/* Glow Effect */}
                 {!isSpinning && hasEnoughData && (
                   <div className="absolute inset-0 rounded-full bg-white opacity-20 group-hover:animate-pulse"></div>
                 )}
              </button>
              
              {!hasEnoughData && (
                 <p className="text-slate-400 text-sm bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, rotateX: -20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden text-center relative border-4 border-white dark:border-slate-700 ring-4 ring-indigo-500/30"
            >
              <div className="bg-gradient-to-b from-indigo-500 to-purple-600 p-8 relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-[-20px] left-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-[-10px] right-[-10px] w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                   <motion.div 
                     initial={{ scale: 0, rotate: -180 }}
                     animate={{ scale: 1, rotate: 0 }}
                     transition={{ delay: 0.2, type: "spring" }}
                     className="mx-auto w-24 h-24 bg-white text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-xl"
                   >
                      <Trophy className="w-12 h-12" />
                   </motion.div>
                   <h3 className="text-indigo-100 font-bold uppercase tracking-wider text-sm mb-1">Terpilih:</h3>
                   <h2 className="text-3xl font-black text-white leading-tight drop-shadow-md break-words">
                     {winner.name}
                   </h2>
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