import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { CertificateData, BulkCertificateData, CertificateGrade, CertificateThemeColor } from '../types';
import { AWARD_AREAS, generateCertificateMessage } from '../utils/certificateHelpers';
import { parseCertificateExcel, generateSampleCertificateExcel } from '../utils/fileParsers';
import { robustSaveAs } from '../utils/exporters';
import { Award, Crown, Star, ThumbsUp, Download, Printer, Users, FileSpreadsheet, CheckCircle, ChevronLeft, ChevronRight, Package, Palette, Check, Type, Sparkles, Share2, Copy, RotateCcw, Edit3 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

// Mapping Styles with Rich Gradients
const COLOR_THEMES: Record<CertificateThemeColor, { gradient: string; text: string; ring: string; iconBg: string; shadow: string }> = {
  emerald: { 
    gradient: 'from-emerald-400 via-emerald-500 to-teal-700', 
    text: 'text-emerald-700', 
    ring: 'ring-emerald-100',
    iconBg: 'bg-emerald-50',
    shadow: 'shadow-emerald-500/30'
  },
  blue: { 
    gradient: 'from-blue-400 via-indigo-500 to-indigo-700', 
    text: 'text-indigo-700',
    ring: 'ring-blue-100',
    iconBg: 'bg-blue-50',
    shadow: 'shadow-blue-500/30'
  },
  yellow: { 
    gradient: 'from-yellow-300 via-amber-400 to-orange-600', 
    text: 'text-amber-700',
    ring: 'ring-yellow-100',
    iconBg: 'bg-yellow-50',
    shadow: 'shadow-amber-500/30'
  },
  purple: { 
    gradient: 'from-fuchsia-400 via-purple-500 to-violet-800', 
    text: 'text-purple-700',
    ring: 'ring-purple-100',
    iconBg: 'bg-purple-50',
    shadow: 'shadow-purple-500/30'
  },
  pink: { 
    gradient: 'from-pink-400 via-rose-500 to-rose-700', 
    text: 'text-rose-700',
    ring: 'ring-pink-100',
    iconBg: 'bg-pink-50',
    shadow: 'shadow-pink-500/30'
  },
  red: { 
    gradient: 'from-red-400 via-red-500 to-rose-800', 
    text: 'text-red-800',
    ring: 'ring-red-100',
    iconBg: 'bg-red-50',
    shadow: 'shadow-red-500/30'
  },
  orange: { 
    gradient: 'from-orange-400 via-orange-500 to-red-600', 
    text: 'text-orange-800',
    ring: 'ring-orange-100',
    iconBg: 'bg-orange-50',
    shadow: 'shadow-orange-500/30'
  },
  cyan: { 
    gradient: 'from-cyan-400 via-cyan-500 to-blue-700', 
    text: 'text-cyan-800',
    ring: 'ring-cyan-100',
    iconBg: 'bg-cyan-50',
    shadow: 'shadow-cyan-500/30'
  },
  slate: { 
    gradient: 'from-slate-400 via-slate-600 to-slate-800', 
    text: 'text-slate-800',
    ring: 'ring-slate-100',
    iconBg: 'bg-slate-50',
    shadow: 'shadow-slate-500/30'
  },
};

const DEFAULT_SINGLE_DATA: CertificateData = {
    grade: 'B',
    themeColor: 'emerald',
    gradeDisplay: 'Baik',
    studentName: '',
    studentClass: '',
    awardArea: 'Partisipasi Aktif',
    specificQuote: '',
    teacherName: '',
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    generatedMessage: '',
};

const CertificateGenerator: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  
  // Single Mode State
  const [data, setData] = useState<CertificateData>(DEFAULT_SINGLE_DATA);

  // Bulk Mode State
  const [bulkData, setBulkData] = useState<BulkCertificateData[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0); // Track which student is being previewed
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, type: '' });
  const [previewScale, setPreviewScale] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const certificateRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-update message when dependencies change (Single Mode & Rendering Logic)
  useEffect(() => {
    const msg = generateCertificateMessage(
      data.grade,
      data.studentName,
      data.awardArea,
      data.specificQuote
    );
    setData(prev => ({ ...prev, generatedMessage: msg }));
  }, [data.grade, data.studentName, data.awardArea, data.specificQuote]);

  // Sync Preview with Bulk Data Index
  useEffect(() => {
    if (mode === 'bulk' && bulkData.length > 0) {
      const item = bulkData[previewIndex];
      setData(prev => ({
        ...prev,
        grade: item.grade,
        themeColor: item.themeColor || (item.grade === 'S' ? 'yellow' : item.grade === 'A' ? 'blue' : 'emerald'),
        gradeDisplay: item.gradeDisplay || (item.grade === 'S' ? 'Luar Biasa' : item.grade === 'A' ? 'Sangat Baik' : 'Baik'),
        studentName: item.studentName,
        studentClass: item.studentClass,
        awardArea: item.awardArea,
        specificQuote: item.specificQuote,
        teacherName: item.teacherName || prev.teacherName,
        date: item.date || prev.date,
      }));
    }
  }, [previewIndex, bulkData, mode]);

  // Handle Resize for Certificate Preview
  useLayoutEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        // Padding adjustment (approx 48px padding total)
        const availableWidth = containerWidth - 48; 
        
        // Card width is 400px.
        const scale = Math.min(1, availableWidth / 400);
        setPreviewScale(scale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReset = () => {
    if (mode === 'single') {
        setData(DEFAULT_SINGLE_DATA);
    } else {
        setBulkData([]);
        setPreviewIndex(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChange = (field: keyof CertificateData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleGradeChange = (grade: CertificateGrade) => {
    // When changing grade, reset to default color and text for that grade
    let defaultColor: CertificateThemeColor = 'emerald';
    let defaultText = 'Baik';

    if (grade === 'A') {
        defaultColor = 'blue';
        defaultText = 'Sangat Baik';
    }
    if (grade === 'S') {
        defaultColor = 'yellow';
        defaultText = 'Luar Biasa';
    }

    setData(prev => ({ ...prev, grade, themeColor: defaultColor, gradeDisplay: defaultText }));
  };

  const handleColorChange = (color: CertificateThemeColor) => {
    setData(prev => ({ ...prev, themeColor: color }));
  };

  // --- BULK HANDLERS ---
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseCertificateExcel(file);
      if (parsedData.length === 0) {
        alert("Tidak ada data valid yang ditemukan dalam file.");
        return;
      }
      setBulkData(parsedData);
      setPreviewIndex(0); 
    } catch (error) {
      console.error(error);
      alert("Gagal membaca file Excel. Pastikan format sesuai template.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePrevPreview = () => {
    setPreviewIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPreview = () => {
    setPreviewIndex(prev => (prev < bulkData.length - 1 ? prev + 1 : prev));
  };

  // --- EXPORT HELPER ---
  const captureHighQuality = async (
      element: HTMLElement, 
      mimeType: string = 'image/png', 
      quality: number = 1.0
  ): Promise<string> => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.position = 'fixed';
    clone.style.top = '-10000px';
    clone.style.left = '-10000px';
    clone.style.zIndex = '-9999';
    clone.style.width = '400px'; 
    clone.style.height = '640px';

    document.body.appendChild(clone);

    try {
      await document.fonts.ready;
      const canvas = await html2canvas(clone, { 
        scale: 2.5, 
        useCORS: true,
        backgroundColor: null,
        logging: false,
        width: 400,
        height: 640,
        windowWidth: 400,
        windowHeight: 640
      });
      return canvas.toDataURL(mimeType, quality);
    } catch (error) {
      console.error("Capture failed:", error);
      throw error;
    } finally {
      document.body.removeChild(clone);
    }
  };

  // --- BULK PROCESSING LOGIC ---
  const processBulkItems = async (
    onItemProcessed: (imgData: string, item: BulkCertificateData, index: number) => Promise<void>,
    mimeType: string = 'image/png',
    quality: number = 1.0
  ) => {
    if (bulkData.length === 0 || !certificateRef.current) return;
    const originalIndex = previewIndex;
    try {
      for (let i = 0; i < bulkData.length; i++) {
        const item = bulkData[i];
        setData(prev => ({
          ...prev,
          grade: item.grade,
          themeColor: item.themeColor || (item.grade === 'S' ? 'yellow' : item.grade === 'A' ? 'blue' : 'emerald'),
          gradeDisplay: item.gradeDisplay || (item.grade === 'S' ? 'Luar Biasa' : item.grade === 'A' ? 'Sangat Baik' : 'Baik'),
          studentName: item.studentName,
          studentClass: item.studentClass,
          awardArea: item.awardArea,
          specificQuote: item.specificQuote,
          teacherName: item.teacherName || prev.teacherName,
          date: item.date || prev.date,
        }));
        await new Promise(resolve => setTimeout(resolve, 150));
        if (certificateRef.current) {
            const imgData = await captureHighQuality(certificateRef.current, mimeType, quality);
            await onItemProcessed(imgData, item, i);
        }
        setBulkProgress(prev => ({ ...prev, current: i + 1 }));
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setPreviewIndex(originalIndex);
      const item = bulkData[originalIndex];
      if (item) {
        setData(prev => ({
          ...prev,
          grade: item.grade,
          themeColor: item.themeColor || (item.grade === 'S' ? 'yellow' : item.grade === 'A' ? 'blue' : 'emerald'),
          gradeDisplay: item.gradeDisplay || (item.grade === 'S' ? 'Luar Biasa' : item.grade === 'A' ? 'Sangat Baik' : 'Baik'),
          studentName: item.studentName,
        }));
      }
    }
  };

  const processBulkPDF = async () => {
    setIsProcessingBulk(true);
    setBulkProgress({ current: 0, total: bulkData.length, type: 'PDF' });
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = 100; 
      const imgHeight = 160; 
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      await processBulkItems(async (imgData, item, index) => {
        if (index > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      }, 'image/jpeg', 0.85);

      pdf.save('KartuSertifikat-Batch.pdf');
    } catch (error) {
      alert("Gagal memproses PDF.");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const processBulkZIP = async () => {
    setIsProcessingBulk(true);
    setBulkProgress({ current: 0, total: bulkData.length, type: 'ZIP' });
    try {
      const zip = new JSZip();
      const folder = zip.folder("Sertifikat_PNG");
      await processBulkItems(async (imgData, item, index) => {
        const base64Data = imgData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
        const safeName = item.studentName.replace(/[^a-zA-Z0-9 ]/g, '_').trim();
        const fileName = `KartuSertifikat-${safeName || 'Siswa'}-${index + 1}.png`;
        folder?.file(fileName, base64Data, { base64: true });
      }, 'image/png', 1.0);
      const content = await zip.generateAsync({ type: "blob" });
      robustSaveAs(content, 'KartuSertifikat-Batch.zip');
    } catch (error) {
      console.error(error);
      alert("Gagal memproses ZIP.");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // --- SINGLE DOWNLOAD HANDLERS ---
  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    try {
      const image = await captureHighQuality(certificateRef.current, 'image/png');
      const a = document.createElement("a");
      a.href = image;
      a.download = `KartuSertifikat-${data.studentName || 'Siswa'}.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 100);
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh gambar.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    try {
      const imgData = await captureHighQuality(certificateRef.current, 'image/jpeg', 0.85);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = 100; 
      const imgHeight = 160; 
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      pdf.save(`KartuSertifikat-${data.studentName || 'Siswa'}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareToWhatsApp = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await captureHighQuality(certificateRef.current, 'image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `KartuSertifikat-${data.studentName || 'siswa'}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Sertifikat Prestasi',
          text: `Selamat kepada ${data.studentName} atas pencapaiannya!`,
        });
      } else {
        try {
          const clipboardItem = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([clipboardItem]);
          alert("Gambar telah disalin ke Clipboard! \n\nSilakan buka WhatsApp Web dan tekan Paste (Ctrl+V) di chat.");
        } catch (clipErr) {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `KartuSertifikat-${data.studentName || 'Siswa'}.png`;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => document.body.removeChild(link), 100);
          alert("Perangkat ini tidak mendukung share otomatis. Gambar telah diunduh, silakan kirim manual ke WhatsApp.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses gambar untuk dibagikan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentGradeConfig = {
    B: { icon: ThumbsUp, label: 'Certificate of Excellence' },
    A: { icon: Star, label: 'Certificate of Achievement' },
    S: { icon: Crown, label: 'Certificate of Mastery' }
  }[data.grade];

  const themeStyle = COLOR_THEMES[data.themeColor];
  const ThemeIcon = currentGradeConfig.icon;
  
  // Logic to show reset button
  const showReset = mode === 'single' 
    ? (data.studentName || data.studentClass || data.specificQuote || data.teacherName) 
    : (bulkData.length > 0);
  
  // Detect if current award area is custom (not in standard list, or explicitly "Lainnya")
  const standardOptions = AWARD_AREAS.filter(a => a !== 'Lainnya');
  const isCustomAward = !standardOptions.includes(data.awardArea);

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Generator Kartu Prestasi</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Buat kartu ucapan digital atau ID card penghargaan. Mendukung input manual dan upload Excel massal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Mode Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'single' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" /> Manual / Single
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'bulk' ? 'bg-white dark:bg-slate-600 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" /> Massal (Excel)
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
               <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 {mode === 'single' ? <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                 {mode === 'single' ? '1. Data Penghargaan' : '1. Upload Data Massal'}
               </h3>
               {showReset && (
                   <button 
                     onClick={handleReset} 
                     className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded transition-colors"
                   >
                     <RotateCcw className="w-3 h-3" /> Reset
                   </button>
               )}
            </div>
            
            <div className="p-6 space-y-4">
              
              {mode === 'single' ? (
                /* --- SINGLE MODE FORM --- */
                <>
                  {/* Grade Selection */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Tingkat Penghargaan (Grade)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleGradeChange('B')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                          data.grade === 'B' 
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span className="text-xs font-bold">Baik</span>
                      </button>
                      <button
                        onClick={() => handleGradeChange('A')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                          data.grade === 'A' 
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Star className="w-5 h-5" />
                        <span className="text-xs font-bold">Sangat Baik</span>
                      </button>
                      <button
                        onClick={() => handleGradeChange('S')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                          data.grade === 'S' 
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-yellow-200 dark:hover:border-yellow-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Crown className="w-5 h-5" />
                        <span className="text-xs font-bold">Luar Biasa</span>
                      </button>
                    </div>
                  </div>

                   {/* Custom Grade Text Input */}
                   <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1 mb-1">
                        <Type className="w-3 h-3" /> Teks / Judul Grade
                      </label>
                      <input 
                        type="text" 
                        value={data.gradeDisplay}
                        onChange={(e) => handleChange('gradeDisplay', e.target.value)}
                        placeholder="Contoh: Baik, 100, A+, TOP"
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">Teks ini yang akan tampil besar di kartu.</p>
                   </div>

                  {/* Color Palette Picker */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1">
                      <Palette className="w-3 h-3" /> Tema Warna (Gradasi)
                    </label>
                    <div className="flex flex-wrap gap-2">
                       {(Object.keys(COLOR_THEMES) as CertificateThemeColor[]).map((c) => {
                         const style = COLOR_THEMES[c];
                         const isSelected = data.themeColor === c;
                         return (
                           <button
                             key={c}
                             onClick={() => handleColorChange(c)}
                             className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm bg-gradient-to-br ${style.gradient} ${isSelected ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                             title={c.charAt(0).toUpperCase() + c.slice(1)}
                           >
                              {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />}
                           </button>
                         )
                       })}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Nama Siswa</label>
                      <input 
                        type="text" 
                        value={data.studentName}
                        onChange={(e) => handleChange('studentName', e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full mt-1 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Kelas / Jurusan (Opsional)</label>
                      <input 
                        type="text" 
                        value={data.studentClass}
                        onChange={(e) => handleChange('studentClass', e.target.value)}
                        placeholder="Contoh: XII IPA 1"
                        className="w-full mt-1 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Award Details */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Area Penghargaan</label>
                      <div className="space-y-2 mt-1">
                         <select 
                            value={isCustomAward ? 'Lainnya' : data.awardArea}
                            onChange={(e) => {
                               const val = e.target.value;
                               if (val === 'Lainnya') {
                                  // Switch to custom mode, clear value to prompt typing
                                  handleChange('awardArea', '');
                               } else {
                                  handleChange('awardArea', val);
                               }
                            }}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                         >
                            {standardOptions.map(area => (
                              <option key={area} value={area}>{area}</option>
                            ))}
                            <option value="Lainnya">Kustom / Lainnya...</option>
                         </select>

                         {/* Custom Input Field - Only shows if 'Lainnya' is selected or custom value exists */}
                         {isCustomAward && (
                           <div className="animate-in fade-in slide-in-from-top-1">
                              <div className="relative">
                                 <Edit3 className="absolute left-3 top-2.5 w-4 h-4 text-indigo-500" />
                                 <input 
                                   type="text"
                                   value={data.awardArea === 'Lainnya' ? '' : data.awardArea}
                                   onChange={(e) => handleChange('awardArea', e.target.value)}
                                   placeholder="Ketik judul penghargaan..."
                                   autoFocus
                                   className="w-full pl-9 p-2 border border-indigo-300 dark:border-indigo-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 text-slate-900 dark:text-slate-100 transition-colors text-sm"
                                 />
                              </div>
                           </div>
                         )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Kutipan / Alasan Spesifik</label>
                      <textarea 
                        value={data.specificQuote}
                        onChange={(e) => handleChange('specificQuote', e.target.value)}
                        placeholder="Contoh: berhasil memecahkan soal tersulit..."
                        rows={3}
                        className="w-full mt-1 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                      />
                      <p className="text-xs text-slate-400 mt-1">Pesan akan dibuat otomatis berdasarkan input ini.</p>
                    </div>
                  </div>

                  {/* Signer */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Nama Guru</label>
                        <input 
                          type="text" 
                          value={data.teacherName}
                          onChange={(e) => handleChange('teacherName', e.target.value)}
                          placeholder="Bpk. Guru"
                          className="w-full mt-1 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Tanggal</label>
                        <input 
                          type="text" 
                          value={data.date}
                          onChange={(e) => handleChange('date', e.target.value)}
                          className="w-full mt-1 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* --- BULK MODE FORM --- */
                <div className="space-y-6">
                  {/* Step 1: Download Template */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-2">Langkah 1: Siapkan Data</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-3">
                      Unduh template Excel. Isi data siswa dan gunakan <strong>kode angka</strong> pada kolom "Warna (1-9)".
                    </p>
                    
                    {/* Legend Table */}
                    <div className="bg-white dark:bg-slate-900/50 p-2 rounded border border-indigo-100 dark:border-indigo-800 mb-3 text-[10px] grid grid-cols-3 gap-1 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 1 = Hijau (Std)</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 2 = Biru (Star)</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 3 = Kuning (Crown)</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> 4 = Ungu</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"></span> 5 = Pink</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> 6 = Merah</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> 7 = Oranye</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> 8 = Cyan</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500"></span> 9 = Abu-abu</div>
                    </div>

                    <button 
                      onClick={generateSampleCertificateExcel}
                      className="text-xs font-semibold bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-2 w-full justify-center"
                    >
                      <Download className="w-3 h-3" /> Unduh Template Excel
                    </button>
                  </div>

                  {/* Step 2: Upload */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Langkah 2: Upload Excel</h4>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleBulkUpload}
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/20 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/40"
                    />
                    {bulkData.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-sm flex items-center gap-2 animate-in fade-in">
                        <CheckCircle className="w-4 h-4" />
                        {bulkData.length} data siswa berhasil dimuat.
                      </div>
                    )}
                  </div>

                  {/* Step 3: Global Settings */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                     <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Langkah 3: Pengaturan Global</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Data ini akan digunakan jika kolom di Excel kosong.</p>
                     <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          value={data.teacherName}
                          onChange={(e) => handleChange('teacherName', e.target.value)}
                          placeholder="Nama Guru Default"
                          className="p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                        />
                        <input 
                          type="text" 
                          value={data.date}
                          onChange={(e) => handleChange('date', e.target.value)}
                          placeholder="Tanggal Default"
                          className="p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                        />
                     </div>
                  </div>
                </div>
              )}

            </div>
          </div>
          
          {/* Action Buttons */}
          {mode === 'single' ? (
            <div className="space-y-3">
              <button
                  onClick={handleShareToWhatsApp}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 shadow-md transition-colors"
                  title="Share to WhatsApp"
                >
                  <Share2 className="w-5 h-5" />
                  Bagikan ke WhatsApp
                </button>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadImage}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Simpan PNG
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  PDF (A4)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={processBulkPDF}
                  disabled={isProcessingBulk || bulkData.length === 0}
                  className="flex items-center justify-center gap-2 py-3 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm disabled:opacity-50 transition-all text-sm"
                >
                  <Printer className="w-4 h-4" />
                  PDF (All)
                </button>
                <button
                  onClick={processBulkZIP}
                  disabled={isProcessingBulk || bulkData.length === 0}
                  className="flex items-center justify-center gap-2 py-3 px-3 bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md disabled:opacity-50 transition-all text-sm"
                >
                  <Package className="w-4 h-4" />
                  ZIP (PNGs)
                </button>
              </div>

              {isProcessingBulk && (
                <div className="animate-in fade-in">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                     <span>Processing {bulkProgress.type}...</span>
                     <span>{bulkProgress.current} / {bulkProgress.total}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Preview */}
        <div className="lg:col-span-7 flex justify-center pb-8">
           <div 
              ref={previewContainerRef}
              className="bg-slate-200/50 dark:bg-slate-900/50 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 w-full flex flex-col items-center min-h-[500px] sm:min-h-[700px] overflow-hidden transition-colors"
           >
              
              {/* Preview Label & Pagination */}
              <div className="w-full flex items-center justify-between mb-4 px-2 sm:px-4 max-w-[400px]">
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {mode === 'single' ? 'Preview' : `Preview (${bulkData.length})`}
                </div>
                
                {mode === 'bulk' && bulkData.length > 0 && (
                  <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-300 dark:border-slate-700 p-1">
                    <button 
                      onClick={handlePrevPreview}
                      disabled={previewIndex === 0 || isProcessingBulk}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-mono font-bold w-12 text-center text-slate-700 dark:text-slate-200">
                      {previewIndex + 1} / {bulkData.length}
                    </span>
                    <button 
                      onClick={handleNextPreview}
                      disabled={previewIndex === bulkData.length - 1 || isProcessingBulk}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* === MASTER LAYOUT START === */}
              {/* Responsive Container: Scale down on mobile, full size on larger screens */}
              <div className="relative w-full flex justify-center flex-1 items-center">
                  <div 
                    className="origin-top transition-transform duration-300"
                    style={{ transform: `scale(${previewScale})` }}
                  >
                      <div 
                        ref={certificateRef}
                        className="w-[400px] h-[640px] relative shadow-2xl overflow-hidden flex-shrink-0 flex flex-col select-none bg-white"
                        style={{ fontFamily: "'Outfit', sans-serif" }} 
                      >
                          {/* Top Section: Gradient Header (30% height) */}
                          <div className={`w-full h-[180px] bg-gradient-to-br ${themeStyle.gradient} relative p-6 flex flex-col justify-between overflow-hidden`}>
                              {/* Decorative Circles - Fixed for export (removed blur) */}
                              <div className="absolute top-[-30px] left-[-30px] w-40 h-40 bg-white opacity-10 rounded-full pointer-events-none"></div>
                              <div className="absolute bottom-[-30px] right-[-20px] w-32 h-32 bg-black opacity-5 rounded-full pointer-events-none"></div>

                              {/* Header Text */}
                              <div className="flex justify-between items-start z-10 relative">
                                 <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none drop-shadow-sm">
                                    {data.gradeDisplay}
                                 </h1>
                                 <div className="text-right text-white/90">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5">Certificate</p>
                                    <p className="text-[8px] uppercase tracking-wider opacity-80">of Appreciation</p>
                                 </div>
                              </div>
                          </div>

                          {/* Middle Section: Floating Icon */}
                          <div className="relative -mt-12 flex justify-center z-20">
                             <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-lg">
                                <div className={`w-full h-full rounded-full ${themeStyle.iconBg} flex items-center justify-center border border-slate-100`}>
                                   <ThemeIcon className={`w-10 h-10 ${themeStyle.text}`} strokeWidth={1.5} />
                                </div>
                             </div>
                          </div>

                          {/* Bottom Section: Content */}
                          <div className="flex-1 px-8 pt-4 pb-8 flex flex-col items-center text-center">
                              
                              {/* Decorative Lines - ROUNDED & VISIBLE */}
                              <div className="flex items-center gap-2 mb-6 opacity-40">
                                 <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${themeStyle.gradient}`}></div>
                                 <div className={`h-1.5 w-2 rounded-full bg-slate-300`}></div>
                                 <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${themeStyle.gradient}`}></div>
                              </div>

                              {/* Name & Class */}
                              <h2 className="text-3xl font-black text-slate-800 leading-tight mb-2">
                                 {data.studentName || "Nama Siswa"}
                              </h2>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-8">
                                 {data.studentClass || "Kelas"}
                              </p>

                              {/* Award Area (Pill) - FIXED ALIGNMENT FOR EXPORT */}
                              {/* Removed background color and padding to prevent misalignment issues */}
                              <div className="mb-4 flex justify-center items-center">
                                 <h3 className={`text-sm font-bold uppercase tracking-widest ${themeStyle.text} leading-none mt-[1px]`}>
                                    {data.awardArea}
                                 </h3>
                              </div>

                              {/* Quote */}
                              <div className="flex-1 flex items-center justify-center">
                                <p className="text-sm text-slate-500 italic font-medium leading-relaxed">
                                   "{data.generatedMessage}"
                                </p>
                              </div>

                              {/* Footer: Date & Signature - Stacked Vertically Centered */}
                              <div className="w-full mt-auto flex flex-col items-center gap-2 pb-2">
                                 {/* Date Section: Label TOP, Value BOTTOM */}
                                 <div className="flex flex-col items-center mb-4">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Tanggal</p>
                                    <p className="text-sm font-bold text-slate-800">{data.date}</p>
                                 </div>
                                 
                                 {/* Teacher Section: Label TOP, Name BOTTOM */}
                                 <div className="flex flex-col items-center w-72 relative pt-2">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Guru Kelas</p>
                                    <div className="w-full text-center">
                                       <p className="text-sm font-bold text-slate-800">{data.teacherName || "Nama Guru"}</p>
                                    </div>
                                 </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              {/* === MASTER LAYOUT END === */}

           </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;