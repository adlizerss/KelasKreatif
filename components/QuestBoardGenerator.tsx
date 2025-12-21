import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Layout, Swords, Sparkles, Coins, AlertCircle, Map, Upload, Zap, Trophy, Maximize2, X, MonitorPlay, RotateCcw, Palette, Layers, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';

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

const DEFAULT_BOARD_CONFIG: BoardConfig = {
    layout: 'columns',
    cardShape: 'rounded',
    backgroundType: 'gradient', 
    backgroundColor: '#f1f5f9',
    backgroundGradient: GRADIENTS[0].value,
    backgroundImage: null,
};

const QuestBoardGenerator: React.FC = () => {
  const [tiers, setTiers] = useState<QuestTier[]>(DEFAULT_TIERS);
  const [boardConfig, setBoardConfig] = useState<BoardConfig>(DEFAULT_BOARD_CONFIG);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'style' | 'content'>('content');
  const [expandedTierId, setExpandedTierId] = useState<string | null>('tier-1');
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1920, h: typeof window !== 'undefined' ? window.innerHeight : 1080 });
  const [previewScale, setPreviewScale] = useState(0.5);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const bgInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  useLayoutEffect(() => {
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        const scale = containerWidth / 1920;
        setPreviewScale(scale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const newId = Math.random().toString(36).substr(2, 9);
    const newTier: QuestTier = {
      id: newId,
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
    setExpandedTierId(newId); // Auto expand new tier
  };

  const removeTier = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tiers.length <= 1) {
      alert("Minimal harus ada 1 tingkatan.");
      return;
    }
    setTiers(tiers.filter(t => t.id !== id));
    if (expandedTierId === id) setExpandedTierId(null);
  };

  const updateTier = <K extends keyof QuestTier>(id: string, field: K, value: QuestTier[K]) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleResetBoard = () => {
      if(confirm("Reset papan ke pengaturan awal?")) {
        setTiers(JSON.parse(JSON.stringify(DEFAULT_TIERS)));
        setBoardConfig(DEFAULT_BOARD_CONFIG);
        setExpandedTierId('tier-1');
      }
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

  // --- MAIN BOARD RENDERER (Keep logic, just minor tweaks if needed) ---
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
       <div className="absolute inset-0 bg-black/5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.3)_100%)]"></div>

       <div className="relative z-10 mb-12 text-center">
          <div className="inline-block relative">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md rounded-2xl border-2 border-white/20 shadow-2xl"></div>
              <div className="relative z-10 px-20 py-6">
                  <h1 
                    className="text-7xl font-black text-white uppercase tracking-[0.15em] drop-shadow-lg" 
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                      Papan Misi
                  </h1>
              </div>
          </div>
       </div>

       <div className="relative z-10 flex-1 w-full flex flex-row items-center justify-center gap-16 px-8">
          {tiers.map((tier, index) => (
            <div 
               key={tier.id}
               className={`relative flex flex-col bg-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] transition-all flex-shrink-0 ${boardConfig.cardShape === 'rounded' ? 'rounded-[2.5rem]' : 'rounded-3xl'}`}
               style={{ width: '500px', height: '700px', backgroundColor: '#ffffff' }}
            >
               <div className={`absolute inset-0 border border-slate-100 pointer-events-none ${boardConfig.cardShape === 'rounded' ? 'rounded-[2.5rem]' : 'rounded-3xl'}`}></div>

               <div 
                 className={`h-[160px] w-full flex flex-col items-center justify-start pt-8 relative overflow-hidden ${boardConfig.cardShape === 'rounded' ? 'rounded-t-[2.5rem]' : 'rounded-t-3xl'}`}
                 style={{ background: tier.headerMode === 'gradient' ? tier.headerGradient : tier.headerColor }}
               >
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '12px 12px' }}></div>
                  <h2 
                    className="relative z-10 text-5xl font-black uppercase tracking-wider text-center px-4 leading-none"
                    style={{ color: tier.headerTextColor, fontFamily: "'Outfit', sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  >
                    {tier.title}
                  </h2>
               </div>

               <div className="absolute left-1/2 transform -translate-x-1/2 top-[100px] z-20">
                  <div className="w-[120px] h-[120px] bg-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.15)] relative">
                      <div className="absolute inset-1.5 border-2 border-slate-100 rounded-full"></div>
                      <div className="relative z-10 transform scale-110">
                        {tier.iconImage ? (
                            <img src={tier.iconImage} alt="icon" className="w-[70px] h-[70px] object-contain" />
                        ) : (
                            <div className="transform scale-110">{renderDefaultIcon(index)}</div>
                        )}
                      </div>
                  </div>
               </div>

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
                             <div className="bg-yellow-100 p-1.5 rounded-full text-yellow-600"><Sparkles className="w-5 h-5 fill-current" /></div>
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
          Desain papan tugas visual yang menarik untuk ditampilkan di depan kelas.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT PANEL: CONTROLS --- */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* CONTROL CARD */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
              
              {/* TAB NAVIGATION */}
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button 
                   onClick={() => setActiveTab('content')}
                   className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'content' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                   <Layers className="w-4 h-4" /> Isi Misi
                   {activeTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
                </button>
                <button 
                   onClick={() => setActiveTab('style')}
                   className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'style' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                   <Palette className="w-4 h-4" /> Tampilan
                   {activeTab === 'style' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="p-6">
                
                {/* === TAB 1: CONTENT (ACCORDION) === */}
                {activeTab === 'content' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Level ({tiers.length}/3)</span>
                      <div className="flex gap-2">
                         <button onClick={handleResetBoard} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <RotateCcw className="w-3 h-3" /> Reset
                         </button>
                         {tiers.length < 3 && (
                            <button onClick={addTier} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1">
                               <Plus className="w-3 h-3" /> Tambah Level
                            </button>
                         )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                       {tiers.map((tier, index) => {
                         const isExpanded = expandedTierId === tier.id;
                         return (
                           <div key={tier.id} className={`border rounded-xl transition-all duration-300 ${isExpanded ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'}`}>
                              {/* Accordion Header */}
                              <div 
                                 className="flex items-center justify-between p-3 cursor-pointer select-none"
                                 onClick={() => setExpandedTierId(isExpanded ? null : tier.id)}
                              >
                                 <div className="flex items-center gap-3">
                                    <div 
                                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                      style={{ background: tier.headerMode === 'gradient' ? tier.headerGradient : tier.headerColor }}
                                    >
                                       {index + 1}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{tier.title}</span>
                                       <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{tier.questTitle}</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-1">
                                    <button 
                                      onClick={(e) => removeTier(tier.id, e)} 
                                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="p-1.5 text-slate-400">
                                       {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                 </div>
                              </div>

                              {/* Accordion Body */}
                              {isExpanded && (
                                <div className="px-3 pb-4 pt-0 space-y-4 animate-in slide-in-from-top-2">
                                   <div className="h-px bg-indigo-200/50 dark:bg-indigo-800/50 mb-4"></div>
                                   
                                   {/* Header Styling */}
                                   <div className="grid grid-cols-2 gap-4">
                                      <div>
                                         <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Judul Header</label>
                                         <input 
                                            type="text" 
                                            value={tier.title} 
                                            onChange={(e) => updateTier(tier.id, 'title', e.target.value)}
                                            className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                                         />
                                      </div>
                                      <div>
                                         <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Style Header</label>
                                         <div className="flex bg-slate-100 dark:bg-slate-700 rounded p-0.5">
                                            <button onClick={() => updateTier(tier.id, 'headerMode', 'solid')} className={`flex-1 py-1 text-[10px] rounded font-medium ${tier.headerMode === 'solid' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Warna</button>
                                            <button onClick={() => updateTier(tier.id, 'headerMode', 'gradient')} className={`flex-1 py-1 text-[10px] rounded font-medium ${tier.headerMode === 'gradient' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Gradasi</button>
                                         </div>
                                      </div>
                                   </div>

                                   {/* Color Picker */}
                                   <div>
                                       {tier.headerMode === 'solid' ? (
                                          <div className="flex gap-2 items-center">
                                             <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-slate-200">
                                               <input type="color" value={tier.headerColor} onChange={(e) => updateTier(tier.id, 'headerColor', e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                                             </div>
                                             <span className="text-xs font-mono text-slate-500">{tier.headerColor}</span>
                                          </div>
                                       ) : (
                                          <div className="grid grid-cols-4 gap-2">
                                             {GRADIENTS.map((g) => (
                                                <button key={g.name} onClick={() => updateTier(tier.id, 'headerGradient', g.value)} className={`h-6 rounded border ${tier.headerGradient === g.value ? 'border-slate-800 scale-105' : 'border-transparent'}`} style={{ background: g.value }} />
                                             ))}
                                          </div>
                                       )}
                                   </div>

                                   {/* Icon Upload */}
                                   <div>
                                      <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Ikon / Gambar Tengah</label>
                                      <div className="flex items-center gap-3">
                                         <div 
                                           className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer overflow-hidden hover:opacity-80 transition-opacity relative"
                                           onClick={() => fileInputRefs.current[tier.id]?.click()}
                                         >
                                            {tier.iconImage ? (
                                               <img src={tier.iconImage} alt="icon" className="w-full h-full object-cover" />
                                            ) : (
                                               <div className="text-slate-300"><ImageIcon className="w-6 h-6" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 flex items-center justify-center transition-colors">
                                               <Edit2 className="w-4 h-4 text-white opacity-0 hover:opacity-100 drop-shadow-md" />
                                            </div>
                                         </div>
                                         <div className="flex-1">
                                            <button onClick={() => fileInputRefs.current[tier.id]?.click()} className="text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors w-full mb-1">
                                               Upload Gambar
                                            </button>
                                            <p className="text-[10px] text-slate-400">Format: PNG transparan disarankan.</p>
                                            <input type="file" ref={(el) => { fileInputRefs.current[tier.id] = el; }} onChange={(e) => handleIconUpload(tier.id, e)} accept="image/*" className="hidden" />
                                         </div>
                                      </div>
                                   </div>

                                   {/* Content Fields */}
                                   <div className="space-y-3 pt-2">
                                      <div>
                                         <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Judul Tugas</label>
                                         <input type="text" value={tier.questTitle} onChange={(e) => updateTier(tier.id, 'questTitle', e.target.value)} className="w-full text-sm p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
                                      </div>
                                      <div>
                                         <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Deskripsi</label>
                                         <textarea rows={3} value={tier.description} onChange={(e) => updateTier(tier.id, 'description', e.target.value)} className="w-full text-sm p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 resize-none" />
                                      </div>
                                      <div>
                                         <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-500" /> Reward</label>
                                         <input type="text" value={tier.reward} onChange={(e) => updateTier(tier.id, 'reward', e.target.value)} className="w-full text-sm p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
                                      </div>
                                   </div>
                                </div>
                              )}
                           </div>
                         )
                       })}
                    </div>
                  </div>
                )}

                {/* === TAB 2: STYLE === */}
                {activeTab === 'style' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                     
                     {/* Background Config */}
                     <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 block">Background Papan</label>
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-4">
                           {(['solid', 'gradient', 'image'] as const).map(type => (
                              <button key={type} onClick={() => setBoardConfig({ ...boardConfig, backgroundType: type })} className={`flex-1 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${boardConfig.backgroundType === type ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                                 {type === 'image' ? 'Gambar' : type === 'gradient' ? 'Gradasi' : 'Warna'}
                              </button>
                           ))}
                        </div>

                        {boardConfig.backgroundType === 'solid' && (
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-300 shadow-sm relative">
                                 <input type="color" value={boardConfig.backgroundColor} onChange={(e) => setBoardConfig({...boardConfig, backgroundColor: e.target.value})} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                              </div>
                              <span className="text-sm font-mono text-slate-600">{boardConfig.backgroundColor}</span>
                           </div>
                        )}

                        {boardConfig.backgroundType === 'gradient' && (
                           <div className="grid grid-cols-4 gap-3">
                              {GRADIENTS.map((g) => (
                                 <button key={g.name} onClick={() => setBoardConfig({...boardConfig, backgroundGradient: g.value})} className={`w-full h-10 rounded-lg shadow-sm border-2 transition-all ${boardConfig.backgroundGradient === g.value ? 'border-indigo-600 scale-105' : 'border-transparent hover:scale-105'}`} style={{ background: g.value }} title={g.name} />
                              ))}
                           </div>
                        )}

                        {boardConfig.backgroundType === 'image' && (
                           <div>
                              <input type="file" ref={bgInputRef} onChange={handleBoardBgUpload} accept="image/*" className="hidden" />
                              <button onClick={() => bgInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group">
                                 <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <Upload className="w-5 h-5 text-indigo-500" />
                                 </div>
                                 <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{boardConfig.backgroundImage ? 'Ganti Gambar' : 'Upload Gambar'}</span>
                              </button>
                           </div>
                        )}
                     </div>

                     <div className="border-t border-slate-100 dark:border-slate-700"></div>

                     {/* Card Shape */}
                     <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 block">Bentuk Kartu</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button onClick={() => setBoardConfig({...boardConfig, cardShape: 'rounded'})} className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${boardConfig.cardShape === 'rounded' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300'}`}>
                              <div className="w-8 h-8 border-2 border-current rounded-[10px]"></div>
                              <span className="text-xs font-medium">Modern</span>
                           </button>
                           <button onClick={() => setBoardConfig({...boardConfig, cardShape: 'sharp'})} className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${boardConfig.cardShape === 'sharp' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300'}`}>
                              <div className="w-8 h-8 border-2 border-current rounded-md"></div>
                              <span className="text-xs font-medium">Tajam</span>
                           </button>
                        </div>
                     </div>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: PREVIEW & PRESENTATION --- */}
        <div className="xl:col-span-8 space-y-6">
           <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 flex items-center justify-between">
              <div>
                 <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                   <MonitorPlay className="w-5 h-5 text-indigo-600" /> Mode Presentasi
                 </h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400">
                   Klik papan di bawah untuk menampilkannya di layar penuh.
                 </p>
              </div>
           </div>
           
           <div 
             ref={previewContainerRef}
             onClick={() => setIsFullscreen(true)}
             className="w-full aspect-video bg-slate-200 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 relative overflow-hidden cursor-pointer hover:ring-4 hover:ring-indigo-500/30 group transition-all"
           >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 z-50 flex items-center justify-center transition-all">
                  <div className="opacity-0 group-hover:opacity-100 bg-black/70 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                     <Maximize2 className="w-4 h-4" /> Klik untuk Perbesar
                  </div>
              </div>
              <div 
                 className="absolute top-0 left-0 origin-top-left transition-transform duration-0 pointer-events-none"
                 style={{ transform: `scale(${previewScale})`, width: '1920px', height: '1080px' }}
              >
                  {renderBoardContent(boardRef)}
              </div>
           </div>

           <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
              <div className="text-sm text-indigo-800 dark:text-indigo-200">
                <p className="font-bold mb-1">Tips:</p>
                <ul className="list-disc list-inside space-y-1 opacity-90">
                  <li>Gunakan tombol <strong>F11</strong> untuk layar penuh maksimal.</li>
                  <li>Tekan tombol <strong>ESC</strong> untuk kembali mengedit.</li>
                </ul>
              </div>
           </div>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
           <div 
             className="transform-gpu transition-transform duration-300 ease-out"
             style={{ transform: `scale(${Math.min(windowSize.w / 1920, windowSize.h / 1080) * 0.95})` }}
           >
              {renderBoardContent()}
           </div>
           <button onClick={() => setIsFullscreen(false)} className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all group z-50" title="Keluar (Esc)">
             <X className="w-8 h-8 opacity-70 group-hover:opacity-100" />
           </button>
        </div>
      )}
    </div>
  );
};

export default QuestBoardGenerator;