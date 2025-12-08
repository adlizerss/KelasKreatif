import React, { useState } from 'react';
import { Student, GroupConfig, GroupingMode, GroupResult } from '../types';
import InputSection from './InputSection';
import ConfigSection from './ConfigSection';
import ResultsSection from './ResultsSection';
import { generateGroups } from '../utils/randomizer';
import { Shuffle } from 'lucide-react';

const GroupGenerator: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [config, setConfig] = useState<GroupConfig>({
    mode: GroupingMode.BY_COUNT,
    value: 0,
    namingPattern: '',
    namingType: 'auto',
    customNames: [],
  });
  const [groups, setGroups] = useState<GroupResult[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleStudentsLoaded = (newStudents: Student[]) => {
    setStudents(newStudents);
    setIsGenerated(false); // Reset results when data changes
  };

  const handleGenerate = () => {
    if (students.length === 0) {
      alert("Mohon masukkan data siswa terlebih dahulu.");
      return;
    }
    if (config.value <= 0) {
      alert("Mohon masukkan jumlah kelompok atau ukuran kelompok yang valid.");
      return;
    }

    const newGroups = generateGroups(students, config.mode, config.value, config.namingPattern, config.customNames, config.namingType);
    setGroups(newGroups);
    setIsGenerated(true);
    
    // Smooth scroll to results
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Intro Text */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Buat Kelompok Belajar</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Unggah daftar siswa atau ketik manual, tentukan aturan pembagian, dan biarkan sistem mengacaknya secara adil untuk Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Input */}
        <InputSection 
          onStudentsLoaded={handleStudentsLoaded} 
          currentCount={students.length}
          title="1. Input Data Siswa"
        />

        {/* Step 2: Config */}
        <div className="flex flex-col gap-6">
          <ConfigSection 
            config={config} 
            setConfig={setConfig} 
            totalStudents={students.length} 
          />

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={students.length === 0 || config.value <= 0}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
              students.length > 0 && config.value > 0
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