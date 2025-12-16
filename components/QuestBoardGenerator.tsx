import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Layout, Swords, Sparkles, Coins, AlertCircle, Map, Upload, Zap, Trophy, Maximize2, X, MonitorPlay } from 'lucide-react';

// --- Types ---

interface QuestTier {
  id: string;
  title: string;
  headerMode: 'solid' | 'gradient';
  headerColor: string;
  headerGradient: string; // CSS Linear Gradient string
  headerTextColor: string;
  questTitle: string;
  description: string;
  reward: string;
  iconImage: string | null; // Data URL
}

interface BoardConfig {
  layout: 'columns' | 'cards'; 
  cardShape: 'rounded' | 'sharp';
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundColor: string;
  backgroundGradient: string; // CSS Linear Gradient string
  backgroundImage: string | null;
}

// Modern Gradients Presets
const GRADIENTS = [
  { name: 'Ocean', value: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { name: 'Berry', value: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)' }, // Minty
  { name: 'Purple', value: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)' },
  { name: 'Night', value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Royal', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
];

const DEFAULT_TIERS: QuestTier[] = [
  {
    id: 'tier-1',
    title: 'Level 1',
    headerMode: 'solid',
    headerColor: '#10b981',
    headerGradient: GRADIENTS[6].value,
    headerTextColor: '#ffffff',
    questTitle: 'Misi Pemula',
    description: 'Kerjakan LKS halaman 5 nomor 1-10 dengan rapi di buku tulis.',
    reward: '10 Poin',
    iconImage: null
  },
  {
    id: 'tier-2',
    title: 'Level 2',
    headerMode: 'solid',
    headerColor: '#3b82f6',
    headerGradient: GRADIENTS[0].value,
    headerTextColor: '#ffffff',
    questTitle: 'Tantangan Reguler',
    description: 'Buat peta konsep (mind map) warna-warni dari materi Bab 3.',
    reward: '25 Poin',
    iconImage: null
  },
  {
    id: 'tier-3',
    title: 'Level 3',
    headerMode: 'solid',
    headerColor: '#ef4444',
    headerGradient: GRADIENTS[3].value,
    headerTextColor: '#ffffff',
    questTitle: 'Master Project',
    description: 'Analisis studi kasus terkini dan buat video presentasi pendek 1 menit.',
    reward: '50 Poin',
    iconImage: null
  }
];

const QuestBoardGenerator: React.FC = () => {
  const [tiers, setTiers] = useState<QuestTier[]>(DEFAULT_TIERS);
  const [boardConfig, setBoardConfig] = useState<BoardConfig>({
    layout: 'columns',
    cardShape: 'rounded',
    backgroundType: 'gradient', // Default to gradient for better aesthetics
    backgroundColor: '#f1f5f9',
    backgroundGradient: GRADIENTS[0].value,
    backgroundImage: null,
  });
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1920, h: typeof window !== 'undefined' ? window.innerHeight : 1080 });
  const [previewScale, setPreviewScale] = useState(0.5);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const bgInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  // Handle Resize for Fullscreen Scaling AND Preview Scaling
  useLayoutEffect(() => {
    const handleResize = () => {
      // Fullscreen logic
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });

      // Preview Scaling Logic
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        // Board is 1920px wide. Calculate ratio.
        const scale = containerWidth / 1920;
        setPreviewScale(scale);
      }
    };
    
    // Initial Call
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Run once on mount and then on resize

  // Handle Esc key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);


  // --- Logic ---

  const addTier = () => {
    if (tiers.length >= 3) return;
    const newTier: QuestTier = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Level',
      headerMode: 'solid',
      headerColor: '#6366f1',
      headerGradient: GRADIENTS[7].value,
      headerTextColor: '#ffffff',
      questTitle: 'Judul Tugas',
      description: 'Deskripsi tugas baru...',
      reward: '0 XP',
      iconImage: null
    };
    setTiers([...tiers, newTier]);
  };

  const removeTier = (id: string) => {
    if (tiers.length <= 1) {
      alert("Minimal harus ada 1 tingkatan.");
      return;
    }
    setTiers(tiers.filter(t => t.id !== id));
  };

  const updateTier = <K extends keyof QuestTier>(id: string, field: K, value: QuestTier[K]) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleIconUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTier(id, 'iconImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBoardBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBoardConfig(prev => ({ 
          ...prev, 
          backgroundType: 'image',
          backgroundImage: reader.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderDefaultIcon = (index: number) => {
    const i = index % 3;
    if (i === 0) return <Zap className="w-12 h-12 text-emerald-500 fill-emerald-100" strokeWidth={1.5} />;
    if (i === 1) return <Swords className="w-12 h-12 text-blue-500 fill-blue-100" strokeWidth={1.5} />;
    return <Trophy className="w-12 h-12 text-rose-500 fill-rose-100" strokeWidth={1.5} />;
  };

  // --- MAIN BOARD RENDERER ---
  const renderBoardContent = (ref?: React.RefObject<HTMLDivElement | null>) => (
    <div 
      ref={ref}
      className="w-[1920px] h-[1080px] relative flex flex-col p-16 overflow-hidden bg-white shadow-2xl"
      style={{ 
          background: boardConfig.backgroundType === 'image' && boardConfig.backgroundImage 
            ? `url(${boardConfig.backgroundImage})` 
            : boardConfig.backgroundType === 'gradient'
              ? boardConfig.backgroundGradient
              : boardConfig.backgroundColor,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: "'Inter', sans-serif"
      }}
    >
       {/* 1. Texture Overlays */}
       <div className="absolute inset-0 bg-black/5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.3)_100%)]"></div>

       {/* Board Header - FRAMED STYLE */}
       <div className="relative z-10 mb-12 text-center">
          <div className="inline-block relative">
              {/* Frame Background */}
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md rounded-2xl border-2 border-white/20 shadow-2xl"></div>
              
              <div className="relative z-10 px-20 py-6">
                  <h1 
                    className="text-7xl font-black text-white uppercase tracking-[0.15em] drop-shadow-lg" 
                    style={{ 
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                      Papan Misi
                  </h1>
              </div>
          </div>
       </div>

       {/* Dynamic Layout - LOCKED GRID */}
       <div className="relative z-10 flex-1 w-full flex flex-row items-center justify-center gap-16 px-8">
          {tiers.map((tier, index) => (
            <div 
               key={tier.id}
               className={`
                 relative flex flex-col bg-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] transition-all flex-shrink-0
                 ${boardConfig.cardShape === 'rounded' ? 'rounded-[2.5rem]' : 'rounded-3xl'}
               `}
               style={{
                 width: '500px', // Fixed Width Lock
                 height: '700px', // Fixed Height Lock
                 backgroundColor: '#ffffff'
               }}
            >
               {/* Card Inner Border */}
               <div className={`absolute inset-0 border border-slate-100 pointer-events-none ${boardConfig.cardShape === 'rounded' ? 'rounded-[2.5rem]' : 'rounded-3xl'}`}></div>

               {/* Header Section */}
               <div 
                 className={`
                   h-[160px] w-full flex flex-col items-center justify-start pt-8 relative overflow-hidden
                   ${boardConfig.cardShape === 'rounded' ? 'rounded-t-[2.5rem]' : 'rounded-t-3xl'}
                 `}
                 style={{ 
                   background: tier.headerMode === 'gradient' ? tier.headerGradient : tier.headerColor 
                 }}
               >
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '12px 12px' }}></div>
                  <h2 
                    className="relative z-10 text-5xl font-black uppercase tracking-wider text-center px-4 leading-none"
                    style={{ 
                      color: tier.headerTextColor, 
                      fontFamily: "'Outfit', sans-serif",
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {tier.title}
                  </h2>
               </div>

               {/* Floating Icon Circle */}
               <div className="absolute left-1/2 transform -translate-x-1/2 top-[100px] z-20">
                  <div 
                      className="w-[120px] h-[120px] bg-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.15)] relative"
                  >
                      <div className="absolute inset-1.5 border-2 border-slate-100 rounded-full"></div>
                      <div className="relative z-10 transform scale-110">
                        {tier.iconImage ? (
                            <img src={tier.iconImage} alt="icon" className="w-[70px] h-[70px] object-contain" />
                        ) : (
                            <div className="transform scale-110">
                                {renderDefaultIcon(index)}
                            </div>
                        )}
                      </div>
                  </div>
               </div>

               {/* Body Section */}
               <div className="flex-1 pt-20 pb-10 px-10 flex flex-col items-center text-center">
                  <h3 className="text-3xl font-extrabold text-slate-800 mb-6 leading-tight w-full font-display tracking-tight">
                      {tier.questTitle}
                  </h3>
                  <div className="w-full flex-1 flex flex-col justify-start items-center">
                     <p className="text-2xl text-slate-600 font-medium leading-relaxed">
                       {tier.description}
                     </p>
                  </div>
                  {tier.reward && (
                    <div className="mt-auto pt-4 w-full">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm group">
                          <span className="text-slate-400 font-bold uppercase text-sm tracking-widest">Reward</span>
                          <div className="flex items-center gap-2">
                             <span className="text-3xl font-black text-slate-800 font-display tracking-tight">{tier.reward}</span>
                             <div className="bg-yellow-100 p-1.5 rounded-full text-yellow-600">
                                <Sparkles className="w-5 h-5 fill-current" />
                             </div>
                          </div>
                        </div>
                    </div>
                  )}
               </div>
            </div>
          ))}
       </div>

    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Papan Misi Kelas</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Buat papan misi visual modern. Tampilkan di proyektor untuk dilihat seluruh siswa.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT PANEL: CONTROLS --- */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* 1. Board Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
               <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 <Layout className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                 Pengaturan Papan
               </h3>
             </div>
             <div className="p-4 space-y-4">
                {/* Background Settings */}
                <div>
                   <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-2 block">Background Papan</label>
                   
                   {/* Tab Switcher */}
                   <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-3">
                      {(['solid', 'gradient', 'image'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setBoardConfig({ ...boardConfig, backgroundType: type })}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${boardConfig.backgroundType === type ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                          {type === 'image' ? 'Gambar' : type === 'gradient' ? 'Gradasi' : 'Warna'}
                        </button>
                      ))}
                   </div>

                   {/* Controls based on Type */}
                   {boardConfig.backgroundType === 'solid' && (
                      <div className="flex items-center gap-3 animate-in fade-in">
                          <input 
                            type="color" 
                            value={boardConfig.backgroundColor} 
                            onChange={(e) => setBoardConfig({...boardConfig, backgroundColor: e.target.value})}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <span className="text-sm font-mono text-slate-600 dark:text-slate-400 uppercase">{boardConfig.backgroundColor}</span>
                      </div>
                   )}

                   {boardConfig.backgroundType === 'gradient' && (
                      <div className="grid grid-cols-4 gap-2 animate-in fade-in">
                        {GRADIENTS.map((g) => (
                          <button
                            key={g.name}
                            onClick={() => setBoardConfig({...boardConfig, backgroundGradient: g.value})}
                            className={`w-full h-8 rounded-md shadow-sm border-2 ${boardConfig.backgroundGradient === g.value ? 'border-indigo-600 scale-110' : 'border-transparent hover:scale-105'} transition-all`}
                            style={{ background: g.value }}
                            title={g.name}
                          />
                        ))}
                      </div>
                   )}

                   {boardConfig.backgroundType === 'image' && (
                      <div className="animate-in fade-in">
                          <input 
                               type="file" 
                               ref={bgInputRef}
                               onChange={handleBoardBgUpload}
                               accept="image/*"
                               className="hidden"
                          />
                          <button 
                               onClick={() => bgInputRef.current?.click()}
                               className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                          >
                               <Upload className="w-5 h-5" />
                               {boardConfig.backgroundImage ? 'Ganti Gambar' : 'Upload Gambar'}
                          </button>
                      </div>
                   )}
                </div>

                {/* Card Shape */}
                <div>
                   <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-2 block">Bentuk Sudut Kartu</label>
                   <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={boardConfig.cardShape === 'rounded'} onChange={() => setBoardConfig({...boardConfig, cardShape: 'rounded'})} className="text-indigo-600" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Modern (Membulat)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={boardConfig.cardShape === 'sharp'} onChange={() => setBoardConfig({...boardConfig, cardShape: 'sharp'})} className="text-indigo-600" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Teknikal (Tajam)</span>
                      </label>
                   </div>
                </div>
             </div>
          </div>

          {/* 2. Tier Management */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Swords className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Daftar Misi ({tiers.length}/3)
                </h3>
                {tiers.length < 3 && (
                  <button onClick={addTier} className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Tambah
                  </button>
                )}
             </div>
             
             <div className="space-y-4">
                {tiers.map((tier, index) => (
                  <div key={tier.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 animate-in slide-in-from-left-2">
                     {/* Header Config */}
                     <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-400 uppercase">Kartu {index + 1}</span>
                        <button onClick={() => removeTier(tier.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Hapus Tingkat">
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>

                     <div className="space-y-3">
                        {/* Title */}
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Nama Tingkat (Header)</label>
                          <input 
                            type="text" 
                            value={tier.title} 
                            onChange={(e) => updateTier(tier.id, 'title', e.target.value)}
                            className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                          />
                        </div>

                        {/* Header Appearance */}
                        <div>
                           <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Gaya Header</label>
                              <div className="flex bg-slate-100 dark:bg-slate-700 rounded p-0.5">
                                <button 
                                  onClick={() => updateTier(tier.id, 'headerMode', 'solid')}
                                  className={`px-2 py-0.5 text-[10px] rounded ${tier.headerMode === 'solid' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                                >Warna</button>
                                <button 
                                  onClick={() => updateTier(tier.id, 'headerMode', 'gradient')}
                                  className={`px-2 py-0.5 text-[10px] rounded ${tier.headerMode === 'gradient' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                                >Gradasi</button>
                              </div>
                           </div>
                           
                           {tier.headerMode === 'solid' ? (
                             <div className="flex items-center gap-2">
                                <input 
                                  type="color" 
                                  value={tier.headerColor} 
                                  onChange={(e) => updateTier(tier.id, 'headerColor', e.target.value)}
                                  className="w-8 h-8 rounded cursor-pointer p-0 border-0"
                                />
                                <div className="flex-1">
                                   <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Warna Teks</label>
                                   <input 
                                    type="color" 
                                    value={tier.headerTextColor} 
                                    onChange={(e) => updateTier(tier.id, 'headerTextColor', e.target.value)}
                                    className="w-6 h-6 rounded cursor-pointer p-0 border-0"
                                   />
                                </div>
                             </div>
                           ) : (
                              <div className="grid grid-cols-4 gap-2 mb-2">
                                {GRADIENTS.map((g) => (
                                  <button
                                    key={g.name}
                                    onClick={() => updateTier(tier.id, 'headerGradient', g.value)}
                                    className={`w-full h-6 rounded border ${tier.headerGradient === g.value ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'}`}
                                    style={{ background: g.value }}
                                  />
                                ))}
                              </div>
                           )}
                        </div>

                        <div className="flex flex-col justify-end">
                              <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Ikon Tengah (Wajib)</label>
                              <button 
                                onClick={() => fileInputRefs.current[tier.id]?.click()}
                                className="w-full flex items-center justify-center gap-2 py-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                              >
                                {tier.iconImage ? <ImageIcon className="w-3 h-3 text-green-500" /> : <ImageIcon className="w-3 h-3" />}
                                {tier.iconImage ? 'Ganti' : 'Upload'}
                              </button>
                              <input 
                                type="file" 
                                ref={(el) => { fileInputRefs.current[tier.id] = el; }}
                                onChange={(e) => handleIconUpload(tier.id, e)}
                                accept="image/png, image/jpeg"
                                className="hidden"
                              />
                        </div>

                        {/* Content */}
                        <div>
                           <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Judul Misi</label>
                           <input 
                              type="text" 
                              value={tier.questTitle} 
                              onChange={(e) => updateTier(tier.id, 'questTitle', e.target.value)}
                              className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div>
                           <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">Deskripsi / Perintah</label>
                           <textarea 
                              rows={2}
                              value={tier.description} 
                              onChange={(e) => updateTier(tier.id, 'description', e.target.value)}
                              className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none"
                            />
                        </div>
                        <div>
                           <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-500" /> Reward (Badge Bawah)</label>
                           <input 
                              type="text" 
                              value={tier.reward} 
                              onChange={(e) => updateTier(tier.id, 'reward', e.target.value)}
                              placeholder="e.g. 10 Poin"
                              className="w-full text-sm p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

        </div>

        {/* --- RIGHT PANEL: PREVIEW & PRESENTATION --- */}
        <div className="xl:col-span-8 space-y-6">
           
           <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                <MonitorPlay className="w-5 h-5 text-indigo-600" /> Mode Presentasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klik papan di bawah untuk menampilkannya di layar penuh (proyektor).
              </p>
           </div>
           
           {/* RESPONSIVE PREVIEW CONTAINER */}
           {/* We use aspect-video to force a 16:9 ratio box. The content inside scales to fit. */}
           <div 
             ref={previewContainerRef}
             onClick={() => setIsFullscreen(true)}
             className="w-full aspect-video bg-slate-200 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 relative overflow-hidden cursor-pointer hover:ring-4 hover:ring-indigo-500/30 group transition-all"
           >
              {/* Overlay Hint */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 z-50 flex items-center justify-center transition-all">
                  <div className="opacity-0 group-hover:opacity-100 bg-black/70 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                     <Maximize2 className="w-4 h-4" /> Klik untuk Perbesar
                  </div>
              </div>

              {/* Scaled Board */}
              <div 
                 className="absolute top-0 left-0 origin-top-left transition-transform duration-0 pointer-events-none"
                 style={{ 
                   transform: `scale(${previewScale})`,
                   width: '1920px',
                   height: '1080px'
                 }}
              >
                  {renderBoardContent(boardRef)}
              </div>
           </div>

           <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
              <div className="text-sm text-indigo-800 dark:text-indigo-200">
                <p className="font-bold mb-1">Tips Presentasi:</p>
                <ul className="list-disc list-inside space-y-1 opacity-90">
                  <li>Gunakan tombol <strong>F11</strong> di browser Anda setelah masuk mode Fullscreen untuk tampilan maksimal.</li>
                  <li>Tekan tombol <strong>ESC</strong> untuk kembali ke mode edit.</li>
                </ul>
              </div>
           </div>

        </div>
      </div>

      {/* === FULLSCREEN OVERLAY === */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
           {/* Auto-scaling Container */}
           <div 
             className="transform-gpu transition-transform duration-300 ease-out"
             style={{ 
               transform: `scale(${Math.min(windowSize.w / 1920, windowSize.h / 1080) * 0.95})` 
             }}
           >
              {renderBoardContent()}
           </div>

           {/* Floating Close Button */}
           <button 
             onClick={() => setIsFullscreen(false)}
             className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all group z-50"
             title="Keluar (Esc)"
           >
             <X className="w-8 h-8 opacity-70 group-hover:opacity-100" />
           </button>

           <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/30 text-sm font-mono bg-black/50 px-3 py-1 rounded-full pointer-events-none">
             Tekan ESC untuk keluar
           </div>
        </div>
      )}

    </div>
  );
};

export default QuestBoardGenerator;