import React, { useRef, useState } from 'react';
import { Settings, Users, Hash, Type, Upload, List } from 'lucide-react';
import { GroupConfig, GroupingMode, NamingType } from '../types';
import { parseTextFile, parseExcelFile } from '../utils/fileParsers';

interface ConfigSectionProps {
  config: GroupConfig;
  setConfig: (config: GroupConfig) => void;
  totalStudents: number;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ config, setConfig, totalStudents }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleModeChange = (mode: GroupingMode) => {
    setConfig({ ...config, mode });
  };

  const handleNamingTypeChange = (type: NamingType) => {
    setConfig({ ...config, namingType: type });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setConfig({ ...config, value: val });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, namingPattern: e.target.value });
  };

  const handleCustomNamesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const names = text.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0);
    setConfig({ ...config, customNames: names });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      let names: string[] = [];
      if (file.name.endsWith('.txt')) {
        names = await parseTextFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        names = await parseExcelFile(file);
      } else {
        alert('Format file tidak didukung. Harap gunakan .txt, .xlsx, atau .csv');
        return;
      }

      if (names.length > 0) {
        setConfig({ ...config, customNames: names });
      } else {
        alert('Tidak ada nama kelompok ditemukan dalam file.');
      }
    } catch (error) {
      console.error(error);
      alert('Gagal membaca file.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const applyCustomCount = () => {
    if (config.customNames.length > 0) {
      setConfig({ ...config, mode: GroupingMode.BY_COUNT, value: config.customNames.length });
    }
  };

  const estimatedGroups = config.mode === GroupingMode.BY_COUNT 
    ? (config.value > 0 ? config.value : 0)
    : (config.value > 0 ? Math.ceil(totalStudents / config.value) : 0);

  const estimatedSize = config.mode === GroupingMode.BY_SIZE
    ? (config.value > 0 ? config.value : 0)
    : (config.value > 0 && totalStudents > 0 ? Math.floor(totalStudents / config.value) + (totalStudents % config.value > 0 ? "+" : "") : 0);


  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          2. Kustomisasi Kelompok
        </h2>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Mode Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Metode Pembagian</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${config.mode === GroupingMode.BY_COUNT ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
              <input
                type="radio"
                name="groupingMode"
                className="sr-only"
                checked={config.mode === GroupingMode.BY_COUNT}
                onChange={() => handleModeChange(GroupingMode.BY_COUNT)}
              />
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${config.mode === GroupingMode.BY_COUNT ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Jumlah Kelompok</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Tentukan total kelompok</div>
                </div>
              </div>
            </label>

            <label className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${config.mode === GroupingMode.BY_SIZE ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
              <input
                type="radio"
                name="groupingMode"
                className="sr-only"
                checked={config.mode === GroupingMode.BY_SIZE}
                onChange={() => handleModeChange(GroupingMode.BY_SIZE)}
              />
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${config.mode === GroupingMode.BY_SIZE ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Ukuran Kelompok</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Tentukan anggota per kelompok</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Numeric Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
              {config.mode === GroupingMode.BY_COUNT ? 'Target Jumlah Kelompok' : 'Target Anggota per Kelompok'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={config.value || ''}
                onChange={handleValueChange}
                placeholder="0"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-10 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
              />
              <div className="absolute left-3 top-3.5 text-slate-400">
                {config.mode === GroupingMode.BY_COUNT ? <Hash className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
            </div>
            {totalStudents > 0 && config.value > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Estimasi: <span className="font-semibold">{estimatedGroups} Kelompok</span> 
                {config.mode === GroupingMode.BY_COUNT ? ` (~${estimatedSize} siswa/kelompok)` : ''}
              </p>
            )}
          </div>

          {/* Naming Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Penamaan Kelompok</label>
              <div className="flex bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg">
                <button
                  onClick={() => handleNamingTypeChange('auto')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${config.namingType === 'auto' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  Otomatis
                </button>
                <button
                  onClick={() => handleNamingTypeChange('custom')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${config.namingType === 'custom' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  Kustom
                </button>
              </div>
            </div>

            {config.namingType === 'auto' ? (
              <div className="relative">
                 <input
                    type="text"
                    value={config.namingPattern}
                    onChange={handleNameChange}
                    placeholder="Contoh: Kelompok, Tim, Squad"
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-10 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                  />
                  <div className="absolute left-3 top-3.5 text-slate-400">
                    <Type className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Preview: {config.namingPattern || 'Kelompok'} 1, {config.namingPattern || 'Kelompok'} 2...
                  </p>
              </div>
            ) : (
              <div className="space-y-2">
                 <div className="relative">
                   <textarea
                     value={config.customNames.join('\n')}
                     onChange={handleCustomNamesChange}
                     placeholder={`Harimau\nElang\nHiu\n...`}
                     className="w-full p-3 h-32 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-10 resize-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                   />
                   <div className="absolute left-3 top-3.5 text-slate-400">
                     <List className="w-5 h-5" />
                   </div>
                   <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleFileUpload}
                     accept=".txt,.csv,.xlsx"
                     className="hidden"
                   />
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="absolute right-2 top-2 p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                     title="Upload nama kelompok dari file"
                   >
                     {isLoading ? <span className="animate-spin block">↻</span> : <Upload className="w-4 h-4" />}
                   </button>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500 dark:text-slate-400">{config.customNames.length} nama disiapkan.</span>
                   {config.customNames.length > 0 && config.mode !== GroupingMode.BY_COUNT && (
                      <button onClick={applyCustomCount} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        Gunakan jumlah ini ({config.customNames.length})
                      </button>
                   )}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigSection;