import React, { useState, useEffect } from 'react';
import { Users, Disc, Award, Sun, Moon } from 'lucide-react';
import GroupGenerator from './components/GroupGenerator';
import SpinWheel from './components/SpinWheel';
import CertificateGenerator from './components/CertificateGenerator';

type AppMode = 'grouper' | 'wheel' | 'certificate';
type Theme = 'light' | 'dark';

function App() {
  const [mode, setMode] = useState<AppMode>('grouper');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check local storage
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      // Default to Light mode if no preference is stored
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white transition-colors duration-300 ${
              mode === 'grouper' ? 'bg-indigo-600' : 
              mode === 'wheel' ? 'bg-pink-600' : 'bg-emerald-600'
            }`}>
              {mode === 'grouper' ? <Users className="w-5 h-5" /> : 
               mode === 'wheel' ? <Disc className="w-5 h-5 spin-slow" /> :
               <Award className="w-5 h-5" />}
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:block">
              KelasKreatif <span className="font-normal text-slate-400">|</span> <span className="text-slate-600 dark:text-slate-400 font-medium">
                {mode === 'grouper' ? 'Pengacak Kelompok' : 
                 mode === 'wheel' ? 'Spin Wheel' : 'Sertifikat'}
              </span>
            </h1>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight sm:hidden">
              KelasKreatif
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setMode('grouper')}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === 'grouper' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Bagi Kelompok"
              >
                <Users className="w-4 h-4" />
                <span className="hidden md:inline">Kelompok</span>
              </button>
              <button
                onClick={() => setMode('wheel')}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === 'wheel' 
                    ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-slate-900' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Spin Wheel"
              >
                <Disc className="w-4 h-4" />
                <span className="hidden md:inline">Wheel</span>
              </button>
              <button
                onClick={() => setMode('certificate')}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === 'certificate' 
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Sertifikat"
              >
                <Award className="w-4 h-4" />
                <span className="hidden md:inline">Sertifikat</span>
              </button>
            </nav>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block"></div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'light' ? 'Aktifkan Mode Gelap' : 'Aktifkan Mode Terang'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
        {mode === 'grouper' ? <GroupGenerator /> : 
         mode === 'wheel' ? <SpinWheel /> : 
         <CertificateGenerator />}
      </main>
    </div>
  );
}

export default App;