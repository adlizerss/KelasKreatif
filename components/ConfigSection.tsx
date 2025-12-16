import React, { useRef } from 'react';
import { Settings, Users, Hash, Type, Upload, List, GitMerge, Scale, Shuffle, Layers, UserCheck } from 'lucide-react';
import { GroupConfig, GroupingMode, NamingType, DistributionStrategy } from '../types';
import { parseTextFile, parseExcelFile } from '../utils/fileParsers';

interface ConfigSectionProps {
  config: GroupConfig;
  setConfig: React.Dispatch<React.SetStateAction<GroupConfig>>;
  totalStudents: number;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ config, setConfig, totalStudents }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (mode: GroupingMode) => {
    setConfig({ ...config, mode });
  };

  const handleStrategyChange = (strategy: DistributionStrategy) => {
    setConfig({ ...config, strategy });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setConfig({ ...config, value: isNaN(val) ? 0 : val });
  };

  // FIX: Do not filter empty lines here to allow typing newlines comfortably
  const handleCustomNamesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const names = val.split(/\r?\n/); 
    setConfig({ ...config, customNames: names });
  };

  const handleUploadNames = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let names: string[] = [];
      if (file.name.endsWith('.txt')) {
        const parsed = await parseTextFile(file);
        names = parsed.map(p => p.name);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        const parsed = await parseExcelFile(file);
        names = parsed.map(p => p.name);
      }
      
      if (names.length > 0) {
        setConfig({ ...config, customNames: names });
      } else {
        alert("File kosong atau format tidak sesuai.");
      }
    } catch (error) {
      console.error(error);
      alert("Gagal membaca file nama kelompok.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Helper to calculate estimated result
  const getEstimation = () => {
    if (totalStudents === 0 || config.value <= 0) return null;
    
    if (config.mode === GroupingMode.BY_COUNT) {
      const size = Math.floor(totalStudents / config.value);
      const remainder = totalStudents % config.value;
      return `${config.value} Kelompok (±${size}${remainder > 0 ? '-' + (size + 1) : ''} orang/kelompok)`;
    } else {
      const count = Math.ceil(totalStudents / config.value);
      return `±${count} Kelompok (${config.value} orang/kelompok)`;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full transition-colors duration-300">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          2. Pengaturan Kelompok
        </h2>
      </div>

      <div className="p-6 space-y-8">
        
        {/* 1. Mode & Value */}
        <div>
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" /> Metode Pembagian
          </label>
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-4">
             <button
               onClick={() => handleModeChange(GroupingMode.BY_COUNT)}
               className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${config.mode === GroupingMode.BY_COUNT ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
             >
               Jumlah Kelompok
             </button>
             <button
               onClick={() => handleModeChange(GroupingMode.BY_SIZE)}
               className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${config.mode === GroupingMode.BY_SIZE ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
             >
               Jumlah Siswa per Kelompok
             </button>
          </div>

          <div className="relative">
             <input
               type="number"
               min="1"
               value={config.value === 0 ? '' : config.value}
               onChange={handleValueChange}
               placeholder={config.mode === GroupingMode.BY_COUNT ? "Mau berapa kelompok?" : "Mau berapa siswa per kelompok?"}
               className="w-full p-3 pl-12 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
             />
             <div className="absolute left-4 top-3.5 text-slate-400">
               {config.mode === GroupingMode.BY_COUNT ? <Layers className="w-5 h-5" /> : <Users className="w-5 h-5" />}
             </div>
             {getEstimation() && (
               <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium flex items-center gap-1 animate-in fade-in">
                 <Scale className="w-3 h-3" /> Estimasi: {getEstimation()}
               </p>
             )}
          </div>
        </div>

        {/* 2. Strategy */}
        <div>
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 flex items-center gap-2">
            <GitMerge className="w-4 h-4" /> Strategi Distribusi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <button
               onClick={() => handleStrategyChange(DistributionStrategy.RANDOM)}
               className={`p-3 rounded-lg border text-left transition-all ${config.strategy === DistributionStrategy.RANDOM ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'}`}
             >
               <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">
                 <Shuffle className="w-4 h-4 text-purple-500" /> Acak Total
               </div>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Murni acak tanpa aturan khusus.</p>
             </button>

             <button
               onClick={() => handleStrategyChange(DistributionStrategy.GENDER_BALANCE)}
               className={`p-3 rounded-lg border text-left transition-all ${config.strategy === DistributionStrategy.GENDER_BALANCE ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'}`}
             >
               <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">
                 <Scale className="w-4 h-4 text-pink-500" /> Seimbang Gender
               </div>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Laki-laki & Perempuan dibagi rata.</p>
             </button>

             <button
               onClick={() => handleStrategyChange(DistributionStrategy.ABILITY_HETEROGENEOUS)}
               className={`p-3 rounded-lg border text-left transition-all ${config.strategy === DistributionStrategy.ABILITY_HETEROGENEOUS ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'}`}
             >
               <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">
                 <UserCheck className="w-4 h-4 text-green-500" /> Heterogen (Kemampuan)
               </div>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Campur Mahir, Cakap, & Dasar dalam 1 tim.</p>
             </button>

             <button
               onClick={() => handleStrategyChange(DistributionStrategy.GENDER_AND_ABILITY_HETEROGENEOUS)}
               className={`p-3 rounded-lg border text-left transition-all ${config.strategy === DistributionStrategy.GENDER_AND_ABILITY_HETEROGENEOUS ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'}`}
             >
               <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">
                 <Layers className="w-4 h-4 text-orange-500" /> Super Mix (Gender + Skill)
               </div>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Keseimbangan gender & kemampuan sekaligus.</p>
             </button>
          </div>
        </div>

        {/* 3. Naming */}
        <div>
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 flex items-center gap-2">
            <Type className="w-4 h-4" /> Penamaan Kelompok
          </label>
          
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={config.namingType === 'auto'}
                onChange={() => setConfig({...config, namingType: 'auto'})}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Otomatis (Pola)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={config.namingType === 'custom'}
                onChange={() => setConfig({...config, namingType: 'custom'})}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Kustom (Manual)</span>
            </label>
          </div>

          {config.namingType === 'auto' ? (
             <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
               <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Pola Nama</label>
               <input 
                 type="text"
                 value={config.namingPattern}
                 onChange={(e) => setConfig({...config, namingPattern: e.target.value})}
                 placeholder="Contoh: Kelompok, Tim, Squad (Default: Kelompok)"
                 className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
               />
               <p className="text-[10px] text-slate-400 mt-1">Output: "Kelompok 1", "Kelompok 2", dst.</p>
             </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-500 dark:text-slate-400">Masukkan 1 nama per baris</span>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                 >
                   <Upload className="w-3 h-3" /> Upload .txt/.xlsx
                 </button>
                 <input 
                   type="file"
                   ref={fileInputRef}
                   onChange={handleUploadNames}
                   className="hidden"
                   accept=".txt,.csv,.xlsx"
                 />
              </div>
              <textarea
                value={config.customNames.join('\n')}
                onChange={handleCustomNamesChange}
                placeholder={`Harimau\nSinga\nElang\nHiu...`}
                className="w-full h-32 p-3 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono transition-colors"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ConfigSection;
