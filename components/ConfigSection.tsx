import React, { useRef } from 'react';
import { Settings, Users, Hash, Type, Upload, List, GitMerge, Scale, Shuffle, Layers, UserCheck } from 'lucide-react';
import { GroupConfig, GroupingMode, NamingType, DistributionStrategy } from '../types';
import { parseTextFile, parseExcelFile } from '../utils/fileParsers';

interface ConfigSectionProps {
  config: GroupConfig;
  setConfig: React.Dispatch<React.SetStateAction<GroupConfig>>;
  totalStudents: number;
  colorTheme?: 'blue' | 'rose' | 'emerald' | 'orange' | 'purple';
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ config, setConfig, totalStudents, colorTheme = 'blue' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Theme Classes
  // NOTE: headerBg uses full opacity or strong gradients
  const themeClasses = {
    blue: {
      headerBg: 'bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 border-b-indigo-200 dark:border-b-indigo-800',
      iconText: 'text-indigo-700 dark:text-indigo-300',
      ring: 'focus:ring-blue-200 dark:focus:ring-blue-900/50 focus:border-blue-500',
      activeTab: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-900/50 dark:text-white dark:ring-indigo-700',
      link: 'text-indigo-600 dark:text-indigo-400'
    },
    rose: {
      headerBg: 'bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 border-b-pink-200 dark:border-b-pink-800',
      iconText: 'text-pink-700 dark:text-pink-300',
      ring: 'focus:ring-rose-200 dark:focus:ring-rose-900/50 focus:border-rose-500',
      activeTab: 'bg-pink-100 text-pink-700 ring-1 ring-pink-300 dark:bg-pink-900/50 dark:text-white dark:ring-pink-700',
      link: 'text-pink-600 dark:text-pink-400'
    },
    emerald: { 
      headerBg: 'bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40 border-b-teal-200 dark:border-b-teal-800',
      iconText: 'text-teal-700 dark:text-teal-300',
      ring: 'focus:ring-emerald-200 dark:focus:ring-emerald-900/50 focus:border-emerald-500',
      activeTab: 'bg-teal-100 text-teal-700 ring-1 ring-teal-300 dark:bg-teal-900/50 dark:text-white dark:ring-teal-700',
      link: 'text-emerald-600 dark:text-emerald-400'
    },
    orange: { 
      headerBg: 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-b-amber-200 dark:border-b-amber-800',
      iconText: 'text-amber-700 dark:text-amber-300',
      ring: 'focus:ring-orange-200 dark:focus:ring-orange-900/50 focus:border-orange-500',
      activeTab: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/50 dark:text-white dark:ring-amber-700',
      link: 'text-orange-600 dark:text-orange-400'
    },
    purple: { 
      headerBg: 'bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 border-b-violet-200 dark:border-b-violet-800',
      iconText: 'text-violet-700 dark:text-violet-300',
      ring: 'focus:ring-purple-200 dark:focus:ring-purple-900/50 focus:border-purple-500',
      activeTab: 'bg-violet-100 text-violet-700 ring-1 ring-violet-300 dark:bg-violet-900/50 dark:text-white dark:ring-violet-700',
      link: 'text-purple-600 dark:text-purple-400'
    },
  }[colorTheme] || {
     headerBg: 'bg-gradient-to-r from-purple-100 to-indigo-100 border-b-purple-200',
     iconText: 'text-purple-700',
     ring: 'focus:ring-indigo-200 focus:border-indigo-500',
     activeTab: 'bg-indigo-100 text-indigo-700',
     link: 'text-indigo-600'
  };

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
    <div className="glass-panel rounded-3xl overflow-hidden h-full transition-all duration-300 hover:shadow-lg shadow-sm border border-slate-200 dark:border-slate-800">
      {/* HEADER BERWARNA */}
      <div className={`p-5 flex items-center justify-between backdrop-blur-sm border-b ${themeClasses.headerBg}`}>
        <h2 className={`text-lg font-bold flex items-center gap-2 font-display ${themeClasses.iconText}`}>
          <div className="p-1.5 bg-white/60 dark:bg-black/20 rounded-lg shadow-sm">
             <Settings className="w-5 h-5" />
          </div>
          2. Pengaturan Kelompok
        </h2>
      </div>

      <div className="p-6 space-y-8">
        
        {/* 1. Mode & Value */}
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Hash className="w-3 h-3" /> Metode Pembagian
          </label>
          <div className="flex bg-slate-100/80 dark:bg-slate-900/50 p-1 rounded-xl mb-4">
             <button
               onClick={() => handleModeChange(GroupingMode.BY_COUNT)}
               className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${config.mode === GroupingMode.BY_COUNT ? `shadow-sm ${themeClasses.activeTab}` : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
             >
               Jumlah Kelompok
             </button>
             <button
               onClick={() => handleModeChange(GroupingMode.BY_SIZE)}
               className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${config.mode === GroupingMode.BY_SIZE ? `shadow-sm ${themeClasses.activeTab}` : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
             >
               Siswa per Kelompok
             </button>
          </div>

          <div className="relative group">
             <input
               type="number"
               min="1"
               value={config.value === 0 ? '' : config.value}
               onChange={handleValueChange}
               placeholder={config.mode === GroupingMode.BY_COUNT ? "Mau berapa kelompok?" : "Mau berapa siswa per kelompok?"}
               className={`w-full p-4 pl-12 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 bg-white/70 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 transition-all outline-none font-bold text-lg ${themeClasses.ring}`}
             />
             <div className="absolute left-4 top-4 text-slate-400 group-hover:text-indigo-500 transition-colors">
               {config.mode === GroupingMode.BY_COUNT ? <Layers className="w-6 h-6" /> : <Users className="w-6 h-6" />}
             </div>
             {getEstimation() && (
               <p className={`text-xs mt-2 font-bold flex items-center gap-1 animate-in fade-in ml-1 ${themeClasses.iconText}`}>
                 <Scale className="w-3 h-3" /> Estimasi: {getEstimation()}
               </p>
             )}
          </div>
        </div>

        {/* 2. Strategy */}
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <GitMerge className="w-3 h-3" /> Strategi Distribusi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <button
               onClick={() => handleStrategyChange(DistributionStrategy.RANDOM)}
               className={`p-4 rounded-2xl border text-left transition-all ${config.strategy === DistributionStrategy.RANDOM ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
             >
               <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                 <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600"><Shuffle className="w-4 h-4" /></div>
                 Acak Total
               </div>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pl-[38px]">Murni acak tanpa aturan khusus.</p>
             </button>

             <button
               onClick={() => handleStrategyChange(DistributionStrategy.GENDER_BALANCE)}
               className={`p-4 rounded-2xl border text-left transition-all ${config.strategy === DistributionStrategy.GENDER_BALANCE ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 ring-1 ring-pink-500' : 'border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
             >
               <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                 <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-900/50 text-pink-600"><Scale className="w-4 h-4" /></div>
                 Seimbang Gender
               </div>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pl-[38px]">Laki-laki & Perempuan dibagi rata.</p>
             </button>

             <button
               onClick={() => handleStrategyChange(DistributionStrategy.ABILITY_HETEROGENEOUS)}
               className={`p-4 rounded-2xl border text-left transition-all ${config.strategy === DistributionStrategy.ABILITY_HETEROGENEOUS ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
             >
               <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                 <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600"><UserCheck className="w-4 h-4" /></div>
                 Heterogen (Skill)
               </div>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pl-[38px]">Campur Mahir & Dasar dalam 1 tim.</p>
             </button>

             <button
               onClick={() => handleStrategyChange(DistributionStrategy.GENDER_AND_ABILITY_HETEROGENEOUS)}
               className={`p-4 rounded-2xl border text-left transition-all ${config.strategy === DistributionStrategy.GENDER_AND_ABILITY_HETEROGENEOUS ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500' : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
             >
               <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                 <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/50 text-orange-600"><Layers className="w-4 h-4" /></div>
                 Super Mix
               </div>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pl-[38px]">Keseimbangan gender & skill sekaligus.</p>
             </button>
          </div>
        </div>

        {/* 3. Naming */}
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Type className="w-3 h-3" /> Penamaan Kelompok
          </label>
          
          <div className="flex gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.namingType === 'auto' ? 'border-indigo-600' : 'border-slate-300'}`}>
                {config.namingType === 'auto' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
              </div>
              <input 
                type="radio" 
                checked={config.namingType === 'auto'}
                onChange={() => setConfig({...config, namingType: 'auto'})}
                className="hidden"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Otomatis (Pola)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.namingType === 'custom' ? 'border-indigo-600' : 'border-slate-300'}`}>
                {config.namingType === 'custom' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
              </div>
              <input 
                type="radio" 
                checked={config.namingType === 'custom'}
                onChange={() => setConfig({...config, namingType: 'custom'})}
                className="hidden"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Kustom (Manual)</span>
            </label>
          </div>

          {config.namingType === 'auto' ? (
             <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase">Pola Nama</label>
               <input 
                 type="text"
                 value={config.namingPattern}
                 onChange={(e) => setConfig({...config, namingPattern: e.target.value})}
                 placeholder="Contoh: Kelompok, Tim, Squad (Default: Kelompok)"
                 className="w-full p-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
               />
               <p className="text-[10px] text-slate-400 mt-2">Output: "Kelompok 1", "Kelompok 2", dst.</p>
             </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Masukkan 1 nama per baris</span>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className={`text-xs flex items-center gap-1 hover:underline font-bold ${themeClasses.link}`}
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
                className={`w-full h-32 p-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-4 resize-none bg-white/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono transition-all outline-none ${themeClasses.ring}`}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ConfigSection;