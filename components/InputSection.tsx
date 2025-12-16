import React, { useState, useRef } from 'react';
import { Upload, UserPlus, CheckCircle, Download, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { parseTextFile, parseExcelFile, processRawNames, generateStudentListTemplate, ParsedStudent } from '../utils/fileParsers';
import { Student } from '../types';

interface InputSectionProps {
  onStudentsLoaded: (students: Student[]) => void;
  currentCount: number;
  title?: string;
}

const InputSection: React.FC<InputSectionProps> = ({ onStudentsLoaded, currentCount, title }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'file'>('manual');
  
  // State for simple manual input
  const [manualText, setManualText] = useState('');
  
  // State for gender split input
  const [isGenderMode, setIsGenderMode] = useState(false);
  const [maleText, setMaleText] = useState('');
  const [femaleText, setFemaleText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = () => {
    let students: Student[] = [];

    if (isGenderMode) {
      // Process Gender Split Input
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
      
      // Clear inputs slightly differently to show feedback
      setMaleText('');
      setFemaleText('');
    } else {
      // Process Simple Input
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
        alert('Format file tidak didukung. Harap gunakan .txt, .xlsx, atau .csv');
        setIsLoading(false);
        return;
      }

      if (parsedData.length === 0) {
        alert('Tidak ada nama yang ditemukan dalam file.');
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full transition-colors duration-300">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {title || "1. Input Data Siswa"}
        </h2>
        {currentCount > 0 && (
          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {currentCount} Data
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'manual'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'file'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Upload
          </button>
        </div>

        {activeTab === 'manual' ? (
          <div className="space-y-4">
            
            {/* Gender Toggle */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none mb-2"
              onClick={() => setIsGenderMode(!isGenderMode)}
            >
               {isGenderMode ? (
                 <ToggleRight className="w-6 h-6 text-indigo-600" />
               ) : (
                 <ToggleLeft className="w-6 h-6 text-slate-400" />
               )}
               <span className={`text-sm font-medium ${isGenderMode ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
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
                    className="w-full h-48 p-3 border-2 border-blue-100 dark:border-blue-900/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
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
                    className="w-full h-48 p-3 border-2 border-pink-100 dark:border-pink-900/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none font-mono text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder={`Andi\nBudi\nCitra\nDedi...`}
                  className="w-full h-48 p-4 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                />
                <div className="absolute top-2 right-2 text-xs text-slate-400">
                  Satu nama per baris
                </div>
              </div>
            )}

            <button
              onClick={handleManualSubmit}
              disabled={isGenderMode ? (!maleText.trim() && !femaleText.trim()) : !manualText.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Muat Data Manual
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Banner Template */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 flex items-center justify-between">
               <div className="text-xs text-indigo-700 dark:text-indigo-300">
                  <span className="font-bold block mb-0.5">Butuh format data?</span>
                  Unduh template Excel (Nama, Gender, & Kemampuan).
               </div>
               <button 
                 onClick={generateStudentListTemplate}
                 className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors shadow-sm"
               >
                 <Download className="w-3 h-3" /> Unduh Template
               </button>
            </div>

            {/* Upload Area */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                className="hidden"
              />
              {isLoading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              ) : (
                <>
                  <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Klik untuk upload berkas</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">.xlsx, .csv (Support kolom L/P & Kemampuan)</p>
                </>
              )}
            </div>
            <p className="text-[10px] text-center text-slate-400">
               Catatan: Jika kolom gender atau kemampuan kosong, siswa akan dianggap umum/acak.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;