import React, { useState } from 'react';
import { Student, GroupConfig, GroupingMode, GroupResult, DistributionStrategy } from '../types';
import InputSection from './InputSection';
import ConfigSection from './ConfigSection';
import ResultsSection from './ResultsSection';
import { generateGroups } from '../utils/randomizer';
import { Shuffle, RotateCcw, X, Trash2 } from 'lucide-react';

const GroupGenerator: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  // Tambahan state untuk menghapus siswa individu seperti di SpinWheel
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  
  const [config, setConfig] = useState<GroupConfig>({
    mode: GroupingMode.BY_COUNT,
    value: 0,
    strategy: DistributionStrategy.RANDOM,
    namingPattern: '',
    namingType: 'auto',
    customNames: [],
  });
  const [groups, setGroups] = useState<GroupResult[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  // Filter siswa yang aktif (tidak dihapus manual)
  const activeStudents = students.filter(s => !removedIds.has(s.id));

  const handleStudentsLoaded = (newStudents: Student[]) => {
    setStudents(newStudents);
    setRemovedIds(new Set()); // Reset filter hapus saat data baru masuk
    setIsGenerated(false); // Reset hasil jika data berubah
  };

  const handleReset = () => {
    setStudents([]);
    setRemovedIds(new Set());
    setGroups([]);
    setIsGenerated(false);
  };

  const handleRemoveStudent = (id: string) => {
    const newRemoved = new Set(removedIds);
    newRemoved.add(id);
    setRemovedIds(newRemoved);
    // Jika data berubah, sebaiknya hasil generate sebelumnya di-reset atau dibiarkan (pilihan UX).
    // Disini kita reset agar konsisten.
    setIsGenerated(false);
  };

  const handleGenerate = () => {
    if (activeStudents.length === 0) {
      alert("Mohon masukkan data siswa terlebih dahulu.");
      return;
    }
    if (config.value <= 0) {
      alert("Mohon masukkan jumlah kelompok atau ukuran kelompok yang valid.");
      return;
    }

    // Gunakan activeStudents, bukan students mentah
    const newGroups = generateGroups(activeStudents, config.mode, config.value, config.strategy, config.namingPattern, config.customNames, config.namingType);
    setGroups(newGroups);
    setIsGenerated(true);
    
    // Smooth scroll to results
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Intro Text */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Buat Kelompok Belajar</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Unggah daftar siswa atau ketik manual, tentukan aturan pembagian, dan biarkan sistem mengacaknya secara adil untuk Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Step 1: Input */}
        <InputSection 
          onStudentsLoaded={handleStudentsLoaded} 
          currentCount={activeStudents.length}
          title="1. Input Data Siswa"
        >
           {/* DAFTAR NAMA SISWA (Feature Ported from SpinWheel) */}
           {activeStudents.length > 0 && (
             <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">
                   <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                     Nama Tersedia ({activeStudents.length})
                   </h3>
                   <button 
                     onClick={handleReset} 
                     className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded transition-colors"
                   >
                     <RotateCcw className="w-3 h-3" /> Reset Data
                   </button>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                   {activeStudents.map((s, i) => (
                      <div key={s.id} className="text-sm px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-md flex justify-between items-center group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <span className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-300">
                          <span className="text-slate-400 font-mono text-xs w-5 text-right">{i + 1}.</span>
                          <span className="truncate">{s.name}</span>
                          {/* Optional Badges for Gender/Ability preview */}
                          {s.gender && (
                             <span className={`text-[9px] px-1 rounded font-bold ${s.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                               {s.gender}
                             </span>
                          )}
                          {s.proficiencyLabel && (
                             <span className="text-[9px] px-1 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded">
                               {s.proficiencyLabel}
                             </span>
                          )}
                        </span>
                        <button 
                           onClick={() => handleRemoveStudent(s.id)}
                           className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                           title="Hapus nama ini"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </InputSection>

        {/* Step 2: Config */}
        <div className="flex flex-col gap-6">
          <ConfigSection 
            config={config} 
            setConfig={setConfig} 
            totalStudents={activeStudents.length} 
          />

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={activeStudents.length < 2 || config.value <= 0}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
              activeStudents.length >= 2 && config.value > 0
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:translate-y-[-2px]'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <Shuffle className="w-6 h-6" />
            Acak dan Bagi Kelompok
          </button>
        </div>
      </div>

      {/* Step 3: Results */}
      {isGenerated && (
         <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
           <ResultsSection groups={groups} />
         </div>
      )}
    </div>
  );
};

export default GroupGenerator;