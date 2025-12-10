import React, { useState, useEffect } from 'react';
import { Users, Disc, Award, Sun, Moon, Clock, Map } from 'lucide-react';
import GroupGenerator from './components/GroupGenerator';
import SpinWheel from './components/SpinWheel';
import CertificateGenerator from './components/CertificateGenerator';
import TimeKeeper from './components/TimeKeeper';
import QuestBoardGenerator from './components/QuestBoardGenerator';

type AppMode = 'grouper' | 'wheel' | 'certificate' | 'timekeeper' | 'quest';
type Theme = 'light' | 'dark';

// Definisi Gaya Tema untuk Header
const THEME_STYLES: Record<AppMode, { gradient: string; text: string; icon: React.ElementType }> = {
  grouper: { 
    gradient: 'from-indigo-600 to-blue-600', 
    text: 'text-indigo-600',
    icon: Users 
  },
  wheel: { 
    gradient: 'from-pink-500 to-rose-500', 
    text: 'text-pink-600',
    icon: Disc 
  },
  certificate: { 
    gradient: 'from-emerald-500 to-teal-600', 
    text: 'text-emerald-600',
    icon: Award 
  },
  timekeeper: { 
    gradient: 'from-orange-500 to-amber-500', 
    text: 'text-orange-600',
    icon: Clock 
  },
  quest: { 
    gradient: 'from-purple-600 to-violet-600', 
    text: 'text-purple-600',
    icon: Map 
  },
};

// Custom Logo Component based on User Sketch
const CustomLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Kiri Atas - Oren */}
    <rect x="3.5" y="4.5" width="3" height="8" rx="1.5" transform="rotate(-45 5 8.5)" fill="#f97316" />
    
    {/* Kanan Atas - Merah */}
    <rect x="17.5" y="4.5" width="3" height="8" rx="1.5" transform="rotate(45 19 8.5)" fill="#ef4444" />
    
    {/* Kiri Bawah - Ungu */}
    <rect x="3.5" y="11.5" width="3" height="8" rx="1.5" transform="rotate(45 5 15.5)" fill="#a855f7" />
    
    {/* Kanan Bawah - Hijau */}
    <rect x="17.5" y="11.5" width="3" height="8" rx="1.5" transform="rotate(-45 19 15.5)" fill="#22c55e" />

    {/* Tengah - Biru (Digambar terakhir agar di layer paling atas) */}
    <rect x="10" y="3" width="4" height="18" rx="2" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
  </svg>
);

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

  const navItems = [
    { id: 'grouper', label: 'Kelompok', icon: Users, themeText: 'text-indigo-600' },
    { id: 'wheel', label: 'Roda', icon: Disc, themeText: 'text-pink-600' },
    { id: 'certificate', label: 'Sertifikat', icon: Award, themeText: 'text-emerald-600' },
    { id: 'timekeeper', label: 'Waktu', icon: Clock, themeText: 'text-orange-600' },
    { id: 'quest', label: 'Misi', icon: Map, themeText: 'text-purple-600' },
  ];

  const currentTheme = THEME_STYLES[mode];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans transition-colors duration-300">
      {/* Header dengan Dynamic Gradient */}
      <header 
        className={`bg-gradient-to-r ${currentTheme.gradient} sticky top-0 z-30 shadow-lg transition-all duration-500 ease-in-out`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between pt-3 pb-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
          
          {/* Top Row on Mobile: Logo + Theme Toggle */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-white shadow-sm transition-transform duration-300 transform hover:scale-105">
                 <CustomLogo className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                KromaKeys <span className="font-normal text-white/60 hidden sm:inline">|</span> <span className="text-white/90 font-medium text-sm sm:text-base hidden sm:inline">
                  {navItems.find(i => i.id === mode)?.label}
                </span>
              </h1>
            </div>

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-white/80 hover:bg-white/20 transition-colors sm:hidden"
              title={theme === 'light' ? 'Aktifkan Mode Gelap' : 'Aktifkan Mode Terang'}
            >
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Navigation Section */}
          <div className="flex items-center w-full sm:w-auto">
            {/* Mobile: Grid 5 Columns. Desktop: Flex Row */}
            <nav className="grid grid-cols-5 gap-2 w-full sm:flex sm:gap-2 sm:w-auto">
              {navItems.map((item) => {
                 const isActive = mode === item.id;
                 const Icon = item.icon;
                 
                 return (
                   <button
                    key={item.id}
                    onClick={() => setMode(item.id as AppMode)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 sm:px-3 sm:py-2 rounded-xl sm:rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? `bg-white ${item.themeText} shadow-md scale-105` 
                        : 'text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-6 h-6 sm:w-4 sm:h-4 ${isActive && item.id === 'wheel' ? 'spin-slow' : ''}`} />
                    <span className="text-[10px] sm:text-sm sm:inline font-bold sm:font-medium hidden xs:inline">{item.label}</span>
                  </button>
                 );
              })}
            </nav>

            <div className="w-px h-6 bg-white/20 mx-3 hidden sm:block"></div>

            {/* Desktop Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-white/80 hover:bg-white/20 transition-colors hidden sm:block"
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
         mode === 'certificate' ? <CertificateGenerator /> :
         mode === 'timekeeper' ? <TimeKeeper /> :
         <QuestBoardGenerator />}
      </main>
    </div>
  );
}

export default App;