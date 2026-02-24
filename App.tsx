import React, { useState, useEffect } from 'react';
import { Users, Disc, Award, Sun, Moon, Clock, Gamepad2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GroupGenerator from './components/GroupGenerator';
import SpinWheel from './components/SpinWheel';
import CertificateGenerator from './components/CertificateGenerator';
import TimeKeeper from './components/TimeKeeper';
import IceBreaker from './components/IceBreaker';

type AppMode = 'grouper' | 'wheel' | 'certificate' | 'timekeeper' | 'icebreaker';
type Theme = 'light' | 'dark';

// --- THEME CONFIGURATION ---
const THEMES: Record<AppMode, {
  label: string;
  icon: React.ElementType;
  bgGradient: string; 
  blob1: string;
  blob2: string;
  blob3: string;
  accentText: string;
  sidebarActive: string;
  colorTheme: 'blue' | 'rose' | 'emerald' | 'orange' | 'purple';
  headerGradientClass: string; // New field for robust header transitions
  headerBorderClass: string;
  headerShadowClass: string;
}> = {
  grouper: {
    label: 'Kelompok',
    icon: Users,
    bgGradient: 'from-blue-100 via-indigo-50 to-white dark:from-slate-950 dark:via-blue-950/40 dark:to-slate-950',
    blob1: 'bg-blue-500', 
    blob2: 'bg-indigo-500',
    blob3: 'bg-cyan-400',
    accentText: 'text-blue-700 dark:text-blue-400',
    sidebarActive: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-blue-200 dark:shadow-blue-900/20',
    colorTheme: 'blue',
    headerGradientClass: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    headerBorderClass: 'border-blue-500/50',
    headerShadowClass: 'shadow-blue-900/20'
  },
  wheel: {
    label: 'Roda',
    icon: Disc,
    bgGradient: 'from-rose-100 via-pink-50 to-white dark:from-slate-950 dark:via-rose-950/40 dark:to-slate-950',
    blob1: 'bg-rose-500',
    blob2: 'bg-pink-500',
    blob3: 'bg-orange-400',
    accentText: 'text-rose-700 dark:text-rose-400',
    sidebarActive: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 shadow-rose-200 dark:shadow-rose-900/20',
    colorTheme: 'rose',
    headerGradientClass: 'bg-gradient-to-r from-rose-600 to-pink-600',
    headerBorderClass: 'border-rose-500/50',
    headerShadowClass: 'shadow-rose-900/20'
  },
  certificate: {
    label: 'Sertifikat',
    icon: Award,
    bgGradient: 'from-emerald-100 via-teal-50 to-white dark:from-slate-950 dark:via-emerald-950/40 dark:to-slate-950',
    blob1: 'bg-emerald-500',
    blob2: 'bg-teal-500',
    blob3: 'bg-lime-400',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    sidebarActive: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 shadow-emerald-200 dark:shadow-emerald-900/20',
    colorTheme: 'emerald',
    headerGradientClass: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    headerBorderClass: 'border-emerald-500/50',
    headerShadowClass: 'shadow-emerald-900/20'
  },
  timekeeper: {
    label: 'Waktu',
    icon: Clock,
    bgGradient: 'from-orange-100 via-amber-50 to-white dark:from-slate-950 dark:via-orange-950/40 dark:to-slate-950',
    blob1: 'bg-orange-500',
    blob2: 'bg-amber-500',
    blob3: 'bg-yellow-400',
    accentText: 'text-orange-700 dark:text-orange-400',
    sidebarActive: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 shadow-orange-200 dark:shadow-orange-900/20',
    colorTheme: 'orange',
    headerGradientClass: 'bg-gradient-to-r from-orange-600 to-amber-600',
    headerBorderClass: 'border-orange-500/50',
    headerShadowClass: 'shadow-orange-900/20'
  },
  icebreaker: {
    label: 'Penyegar',
    icon: Gamepad2,
    bgGradient: 'from-purple-100 via-violet-50 to-white dark:from-slate-950 dark:via-purple-950/40 dark:to-slate-950',
    blob1: 'bg-purple-500',
    blob2: 'bg-violet-500',
    blob3: 'bg-fuchsia-400',
    accentText: 'text-purple-700 dark:text-purple-400',
    sidebarActive: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 shadow-purple-200 dark:shadow-purple-900/20',
    colorTheme: 'purple',
    headerGradientClass: 'bg-gradient-to-r from-purple-600 to-violet-600',
    headerBorderClass: 'border-purple-500/50',
    headerShadowClass: 'shadow-purple-900/20'
  },
};

const NAV_KEYS = Object.keys(THEMES) as AppMode[];

// Custom Logo Component
const CustomLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3.5" y="4.5" width="3" height="8" rx="1.5" transform="rotate(-45 5 8.5)" fill="#f97316" />
    <rect x="17.5" y="4.5" width="3" height="8" rx="1.5" transform="rotate(45 19 8.5)" fill="#ef4444" />
    <rect x="3.5" y="11.5" width="3" height="8" rx="1.5" transform="rotate(45 5 15.5)" fill="#a855f7" />
    <rect x="17.5" y="11.5" width="3" height="8" rx="1.5" transform="rotate(-45 19 15.5)" fill="#22c55e" />
    <rect x="10" y="3" width="4" height="18" rx="2" fill="#3b82f6" />
  </svg>
);

function App() {
  const [mode, setMode] = useState<AppMode>('grouper');
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Get active configuration based on selected mode
  const activeTheme = THEMES[mode];

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
    const timer = setTimeout(() => setIsLoading(false), 2000); 
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleExit = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari EduTools?")) {
      try {
        window.close();
        setTimeout(() => { if (!window.closed) alert("Silakan tutup tab browser Anda untuk keluar."); }, 300);
      } catch (e) { alert("Silakan tutup tab browser Anda untuk keluar."); }
    }
  };

  const mobileIconClass = 'text-white/90 hover:bg-white/20 hover:text-white';

  return (
    <>
      {/* --- FLUID BACKGROUND SYSTEM --- */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-slate-50 dark:bg-slate-950 pointer-events-none transition-colors duration-500">
         
         {/* Base Gradient Layer */}
         <motion.div 
            initial={false}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 ease-in-out ${activeTheme.bgGradient}`}
         />

         {/* Animated Blob 1 (Top Left - Primary) - Increased Opacity */}
         <motion.div 
            animate={{ 
               x: [0, 50, -50, 0],
               y: [0, -50, 50, 0],
               scale: [1, 1.2, 0.9, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[90px] opacity-40 dark:opacity-20 dark:mix-blend-screen transition-colors duration-1000 ${activeTheme.blob1}`}
         />

         {/* Animated Blob 2 (Top Right - Secondary) */}
         <motion.div 
            animate={{ 
               x: [0, -60, 40, 0],
               y: [0, 40, -60, 0],
               scale: [1, 1.1, 0.8, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
            className={`absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[90px] opacity-40 dark:opacity-20 dark:mix-blend-screen transition-colors duration-1000 ${activeTheme.blob2}`}
         />

         {/* Animated Blob 3 (Bottom Center - Accent) */}
         <motion.div 
            animate={{ 
               x: [0, 70, -30, 0],
               y: [0, -30, 20, 0],
               scale: [1, 1.3, 1, 1],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
            className={`absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 dark:opacity-20 dark:mix-blend-screen transition-colors duration-1000 ${activeTheme.blob3}`}
         />
      </div>

      {/* --- SPLASH SCREEN --- */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* GEOMETRIC GRID PATTERN */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-20"
              style={{
                  backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)`,
                  backgroundSize: '32px 32px',
                  maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
              }}
            />

            {/* FLOATING GEOMETRIC SHAPES */}
            {/* Circle */}
            <motion.div 
               animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: 360 }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-[25%] left-[25%] w-16 h-16 rounded-full border-4 border-indigo-200/40 dark:border-indigo-800/40 z-0"
            />
            {/* Square */}
            <motion.div 
               animate={{ y: [0, 30, 0], rotate: [0, 45, 0] }}
               transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-[25%] right-[20%] w-20 h-20 border-4 border-purple-200/40 dark:border-purple-800/40 z-0"
            />
            {/* Triangle (CSS) */}
            <motion.div 
               animate={{ y: [0, -15, 0], x: [0, -10, 0], rotate: -15 }}
               transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
               className="absolute top-[30%] right-[30%] w-0 h-0 z-0"
               style={{
                  borderLeft: '20px solid transparent',
                  borderRight: '20px solid transparent',
                  borderBottom: '35px solid rgba(249, 115, 22, 0.15)' // Orange tinted
               }}
            />
            {/* Cross */}
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute bottom-[20%] left-[15%] text-emerald-200/30 dark:text-emerald-800/30 z-0 font-black text-6xl"
            >
               +
            </motion.div>

            
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center relative z-10"
            >
              <div className="w-24 h-24 mb-6 relative">
                 <CustomLogo className="w-full h-full relative z-10" />
              </div>
              <motion.h1 
                className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display mb-2"
              >
                EduTools
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden relative z-10">
        
        {/* --- SIDEBAR (DESKTOP) --- */}
        <nav className="hidden md:flex flex-col w-24 lg:w-64 h-full glass-panel border-r border-white/40 dark:border-white/10 z-50 py-6 px-3 lg:px-4 justify-between transition-all duration-300">
           
           {/* Logo Area */}
           <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-3 lg:px-2 mb-8">
              <div className="p-2 bg-white rounded-xl shadow-sm shadow-indigo-100 dark:shadow-none shrink-0">
                 <CustomLogo className="w-8 h-8" />
              </div>
              <span className="font-display font-bold text-xl text-slate-800 dark:text-white hidden lg:block tracking-tight">EduTools</span>
           </div>

           {/* Menu Items */}
           <div className="flex-1 flex flex-col gap-2 w-full">
              {NAV_KEYS.map((key) => {
                 const item = THEMES[key];
                 const isActive = mode === key;
                 const Icon = item.icon;
                 
                 return (
                   <button
                     key={key}
                     onClick={() => setMode(key)}
                     className={`relative group flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 rounded-2xl transition-all duration-300 ${
                       isActive 
                         ? `shadow-lg ${item.sidebarActive}` // Stronger active state
                         : 'hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'
                     }`}
                   >
                     {/* Active Indicator Bar */}
                     {isActive && (
                        <motion.div 
                           layoutId="activeTab"
                           className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full hidden lg:block ${item.blob1.replace('bg-', 'bg-')}`} 
                        />
                     )}
                     
                     <Icon 
                        className={`w-6 h-6 transition-colors duration-300 ${
                           isActive ? '' : 'group-hover:text-slate-700 dark:group-hover:text-slate-200'
                        } ${isActive && key === 'wheel' ? 'spin-slow' : ''}`} 
                     />
                     <span className={`hidden lg:block font-medium text-sm ${isActive ? 'font-bold' : ''}`}>
                        {item.label}
                     </span>
                   </button>
                 );
              })}
           </div>

           {/* Bottom Actions */}
           <div className="flex flex-col gap-2 mt-auto">
              <button onClick={toggleTheme} className="p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-500 hover:text-indigo-600 transition-colors flex items-center justify-center lg:justify-start gap-3">
                 {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                 <span className="hidden lg:inline text-sm font-medium">Mode {theme === 'light' ? 'Gelap' : 'Terang'}</span>
              </button>
              <button onClick={handleExit} className="p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 transition-colors flex items-center justify-center lg:justify-start gap-3">
                 <LogOut className="w-5 h-5" />
                 <span className="hidden lg:inline text-sm font-medium">Keluar</span>
              </button>
           </div>
        </nav>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 relative h-full overflow-y-auto no-scrollbar scroll-smooth">
           {/* Mobile Header (Updated for Fluid Gradient Transitions) */}
           <div className="md:hidden sticky top-0 z-40 overflow-hidden shadow-lg transition-all duration-500">
              {/* Stacked Gradient Layers for Cross-fading */}
              {NAV_KEYS.map((key) => {
                 const t = THEMES[key];
                 return (
                    <div 
                      key={key}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${t.headerGradientClass} border-b ${t.headerBorderClass} ${t.headerShadowClass}`}
                      style={{ opacity: mode === key ? 1 : 0 }}
                    />
                 );
              })}
              
              {/* Header Content (Z-10 to stay above gradients) */}
              <div className="relative z-10 px-4 py-3 flex items-center justify-between backdrop-blur-[1px]">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      <CustomLogo className="w-6 h-6" />
                   </div>
                   <h1 className="font-display font-bold text-lg text-white tracking-tight drop-shadow-sm">EduTools</h1>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${mobileIconClass}`}>
                      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                   </button>
                   <button onClick={handleExit} className={`p-2 rounded-lg transition-colors ${mobileIconClass}`}>
                      <LogOut className="w-5 h-5" />
                   </button>
                </div>
              </div>
           </div>

           {/* Content Wrapper */}
           <div className="p-4 md:p-8 lg:p-12 pb-24 md:pb-8 max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                 <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                 >
                    {mode === 'grouper' && <GroupGenerator themeColor={activeTheme.colorTheme} />}
                    {mode === 'wheel' && <SpinWheel />}
                    {mode === 'certificate' && <CertificateGenerator />}
                    {mode === 'timekeeper' && <TimeKeeper />}
                    {mode === 'icebreaker' && <IceBreaker />}
                 </motion.div>
              </AnimatePresence>
           </div>
        </main>

        {/* --- BOTTOM NAV (MOBILE) --- */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
           <nav className="glass-panel rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-2 flex justify-between items-center">
              {NAV_KEYS.map((key) => {
                 const item = THEMES[key];
                 const isActive = mode === key;
                 const Icon = item.icon;
                 
                 return (
                    <button
                       key={key}
                       onClick={() => setMode(key)}
                       className={`relative flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                         isActive ? `text-slate-900 dark:text-white ${item.accentText} font-bold` : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                       }`}
                    >
                       {isActive && (
                          <motion.div 
                             layoutId="mobileActive"
                             className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm z-[-1]" 
                          />
                       )}
                       <Icon className={`w-6 h-6 mb-0.5 ${isActive ? '' : ''} ${isActive && key === 'wheel' ? 'spin-slow' : ''}`} />
                       <span className={`text-[10px] font-medium leading-none ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{item.label}</span>
                    </button>
                 );
              })}
           </nav>
        </div>

      </div>
    </>
  );
}

export default App;