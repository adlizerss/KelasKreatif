import React, { useState, useRef } from 'react';
import { Upload, UserPlus, CheckCircle, Download, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { parseTextFile, parseExcelFile, processRawNames, generateStudentListTemplate, ParsedStudent } from '../utils/fileParsers';
import { Student } from '../types';

interface InputSectionProps {
  onStudentsLoaded: (students: Student[]) => void;
  currentCount: number;
  title?: string;
  children?: React.ReactNode;
  colorTheme?: 'blue' | 'rose' | 'emerald' | 'orange' | 'purple';
}

const InputSection: React.FC<InputSectionProps> = ({ onStudentsLoaded, currentCount, title, children, colorTheme = 'blue' }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'file'>('manual');
  
  // State for simple manual input
  const [manualText, setManualText] = useState('');
  
  // State for gender split input
  const [isGenderMode, setIsGenderMode] = useState(false);
  const [maleText, setMaleText] = useState('');
  const [femaleText, setFemaleText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Theme Classes
  // NOTE: headerBg uses full opacity or strong gradients
  const themeClasses = {
    blue: {
      headerBg: 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border-b-blue-200 dark:border-b-blue-800',
      iconText: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-white/50 dark:bg-black/20 text-blue-700 dark:text-blue-300',
      tabActive: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/50 dark:text-white dark:ring-blue-700',
      button: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20',
      ring: 'focus:ring-blue-200 dark:focus:ring-blue-900/50 focus:border-blue-500',
      border: 'border-blue-200 dark:border-blue-800'
    },
    rose: {
      headerBg: 'bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 border-b-rose-200 dark:border-b-rose-800',
      iconText: 'text-rose-700 dark:text-rose-300',
      badge: 'bg-white/50 dark:bg-black/20 text-rose-700 dark:text-rose-300',
      tabActive: 'bg-rose-100 text-rose-700 ring-1 ring-rose-300 dark:bg-rose-900/50 dark:text-white dark:ring-rose-700',
      button: 'from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-rose-500/20',
      ring: 'focus:ring-rose-200 dark:focus:ring-rose-900/50 focus:border-rose-500',
      border: 'border-rose-200 dark:border-rose-800'
    },
    emerald: { 
      headerBg: 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border-b-emerald-200 dark:border-b-emerald-800',
      iconText: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-white/50 dark:bg-black/20 text-emerald-700 dark:text-emerald-300',
      tabActive: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/50 dark:text-white dark:ring-emerald-700',
      button: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20', 
      ring: 'focus:ring-emerald-200 focus:border-emerald-500', 
      border: 'border-emerald-200 dark:border-emerald-800' 
    },
    orange: { 
      headerBg: 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 border-b-orange-200 dark:border-b-orange-800',
      iconText: 'text-orange-700 dark:text-orange-300',
      badge: 'bg-white/50 dark:bg-black/20 text-orange-700 dark:text-orange-300',
      tabActive: 'bg-orange-100 text-orange-700 ring-1 ring-orange-300 dark:bg-orange-900/50 dark:text-white dark:ring-orange-700',
      button: 'from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-500/20', 
      ring: 'focus:ring-orange-200 focus:border-orange-500', 
      border: 'border-orange-200 dark:border-orange-800' 
    },
    purple: { 
      headerBg: 'bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 border-b-purple-200 dark:border-b-purple-800',
      iconText: 'text-purple-700 dark:text-purple-300',
      badge: 'bg-white/50 dark:bg-black/20 text-purple-700 dark:text-purple-300',
      tabActive: 'bg-purple-100 text-purple-700 ring-1 ring-purple-300 dark:bg-purple-900/50 dark:text-white dark:ring-purple-700',
      button: 'from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-purple-500/20', 
      ring: 'focus:ring-purple-200 focus:border-purple-500', 
      border: 'border-purple-200 dark:border-purple-800' 
    },
  }[colorTheme] || {
     // Default Blue
     headerBg: 'bg-gradient-to-r from-blue-100 to-indigo-100 border-b-blue-200',
     iconText: 'text-blue-700',
     badge: 'bg-white/50 text-blue-700',
     tabActive: 'bg-blue-100 text-blue-700',
     button: 'from-blue-600 to-indigo-600 shadow-blue-500/20',
     ring: 'focus:ring-blue-200 focus:border-blue-500',
     border: 'border-blue-200'
  };

  const handleManualSubmit = () => {
    let students: Student[] = [];

    if (isGenderMode) {
      const males = maleText.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0).map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        gender: 'M' as const
      }));

      const females = femaleText.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0).map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        gender: 'F' as const
      }));

      students = [...males, ...females];
      setMaleText('');
      setFemaleText('');
    } else {
      if (!manualText.trim()) return;
      const names = manualText.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0);
      students = processRawNames(names);
      setManualText(''); 
    }

    if (students.length > 0) {
      onStudentsLoaded(students);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      let parsedData: ParsedStudent[] = [];
      if (file.name.endsWith('.txt')) {
        parsedData = await parseTextFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        parsedData = await parseExcelFile(file);
      } else {
        alert('Format file tidak didukung.');
        setIsLoading(false);
        return;
      }

      if (parsedData.length === 0) {
        alert('Tidak ada nama yang ditemukan.');
      } else {
        const students = processRawNames(parsedData);
        onStudentsLoaded(students);
      }
    } catch (error) {
      console.error(error);
      alert('Gagal membaca file.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`glass-panel rounded-3xl overflow-hidden h-full transition-all duration-300 hover:shadow-lg shadow-sm border ${themeClasses.border}`}>
      {/* HEADER BERWARNA */}
      <div className={`p-5 flex items-center justify-between backdrop-blur-sm border-b ${themeClasses.headerBg}`}>
        <h2 className={`text-lg font-bold flex items-center gap-2 font-display ${themeClasses.iconText}`}>
          <div className="p-1.5 bg-white/60 dark:bg-black/20 rounded-lg shadow-sm">
             <UserPlus className="w-5 h-5" />
          </div>
          {title || "1. Input Data Siswa"}
        </h2>
        {currentCount > 0 && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-white/20 ${themeClasses.badge}`}>
            <CheckCircle className="w-3 h-3" />
            {currentCount} Data
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex bg-slate-100/80 dark:bg-slate-900/50 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === 'manual'
                ? `shadow-sm ${themeClasses.tabActive}`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === 'file'
                ? `shadow-sm ${themeClasses.tabActive}`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Upload Excel
          </button>
        </div>

        {activeTab === 'manual' ? (
          <div className="space-y-4">
            
            <div 
              className="flex items-center gap-3 cursor-pointer select-none mb-2"
              onClick={() => setIsGenderMode(!isGenderMode)}
            >
               {isGenderMode ? (
                 <ToggleRight className={`w-6 h-6 ${themeClasses.iconText}`} /> 
               ) : (
                 <ToggleLeft className="w-6 h-6 text-slate-400" />
               )}
               <span className={`text-sm font-medium ${isGenderMode ? `${themeClasses.iconText} font-bold` : 'text-slate-600 dark:text-slate-400'}`}>
                 Mode Bagi Rata Gender (L/P)
               </span>
            </div>

            {isGenderMode ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
                     <Users className="w-3 h-3" /> Laki-laki
                   </label>
                   <textarea
                    value={maleText}
                    onChange={(e) => setMaleText(e.target.value)}
                    placeholder={`Budi\nJoko\n...`}
                    className={`w-full h-48 p-3 border-2 rounded-xl focus:ring-4 resize-none font-mono text-sm bg-white/70 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 transition-all outline-none ${themeClasses.border} ${themeClasses.ring}`}
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase flex items-center gap-1">
                     <Users className="w-3 h-3" /> Perempuan
                   </label>
                   <textarea
                    value={femaleText}
                    onChange={(e) => setFemaleText(e.target.value)}
                    placeholder={`Siti\nAni\n...`}
                    className={`w-full h-48 p-3 border-2 rounded-xl focus:ring-4 resize-none font-mono text-sm bg-white/70 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 transition-all outline-none ${themeClasses.border} ${themeClasses.ring}`}
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder={`Andi\nBudi\nCitra\nDedi...`}
                  className={`w-full h-48 p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 resize-none font-mono text-sm bg-white/70 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 transition-all outline-none ${themeClasses.ring}`}
                />
                <div className="absolute top-2 right-2 text-[10px] text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-md backdrop-blur-sm">
                  1 nama/baris
                </div>
              </div>
            )}

            <button
              onClick={handleManualSubmit}
              disabled={isGenderMode ? (!maleText.trim() && !femaleText.trim()) : !manualText.trim()}
              className={`w-full py-3 bg-gradient-to-r text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed ${themeClasses.button}`}
            >
              Muat Data Manual
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`border rounded-xl p-4 flex items-center justify-between ${themeClasses.border} bg-white/40 dark:bg-slate-900/20`}>
               <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold block mb-0.5 text-sm">Butuh format data?</span>
                  Unduh template Excel (Nama, Gender, & Kemampuan).
               </div>
               <button 
                 onClick={generateStudentListTemplate}
                 className={`flex items-center gap-1.5 bg-white dark:bg-slate-800 border px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:scale-105 ${themeClasses.border} ${themeClasses.iconText}`}
               >
                 <Download className="w-3 h-3" /> Template
               </button>
            </div>

            <div 
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 bg-slate-50/50 dark:bg-slate-900/30 transition-all cursor-pointer group border-slate-300 dark:border-slate-600 hover:border-current hover:bg-white/50 dark:hover:bg-slate-800/50 ${themeClasses.iconText}`} 
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                className="hidden"
              />
              {isLoading ? (
                <div className={`animate-spin rounded-full h-10 w-10 border-b-2 border-current`}></div>
              ) : (
                <>
                  <div className={`w-16 h-16 bg-white dark:bg-slate-800 shadow-md rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform ${themeClasses.iconText} bg-opacity-90`}>
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Klik untuk upload berkas</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">.xlsx, .csv (Support kolom L/P & Kemampuan)</p>
                </>
              )}
            </div>
          </div>
        )}

        {children && (
           <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in">
             {children}
           </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;