import React, { useState, useRef, useEffect } from 'react';
import { CertificateData, BulkCertificateData, CertificateGrade, CertificateThemeColor } from '../types';
import { AWARD_AREAS, generateCertificateMessage } from '../utils/certificateHelpers';
import { parseCertificateExcel, generateSampleCertificateExcel } from '../utils/fileParsers';
import { Award, Crown, Star, ThumbsUp, Download, Printer, Users, FileSpreadsheet, CheckCircle, ChevronLeft, ChevronRight, Package, Palette, Check, Type } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

// Mapping Styles for all available colors
const COLOR_THEMES: Record<CertificateThemeColor, { primary: string; light: string; border: string; text: string; accent: string }> = {
  emerald: { primary: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-600', text: 'text-emerald-900', accent: 'text-emerald-600' },
  blue:    { primary: 'bg-blue-600',    light: 'bg-blue-50',    border: 'border-blue-600',    text: 'text-blue-900',    accent: 'text-blue-600' },
  yellow:  { primary: 'bg-yellow-500',  light: 'bg-yellow-50',  border: 'border-yellow-500',  text: 'text-yellow-900',  accent: 'text-yellow-600' },
  purple:  { primary: 'bg-purple-600',  light: 'bg-purple-50',  border: 'border-purple-600',  text: 'text-purple-900',  accent: 'text-purple-600' },
  pink:    { primary: 'bg-pink-600',    light: 'bg-pink-50',    border: 'border-pink-600',    text: 'text-pink-900',    accent: 'text-pink-600' },
  red:     { primary: 'bg-red-600',     light: 'bg-red-50',     border: 'border-red-600',     text: 'text-red-900',     accent: 'text-red-600' },
  orange:  { primary: 'bg-orange-500',  light: 'bg-orange-50',  border: 'border-orange-500',  text: 'text-orange-900',  accent: 'text-orange-600' },
  cyan:    { primary: 'bg-cyan-600',    light: 'bg-cyan-50',    border: 'border-cyan-600',    text: 'text-cyan-900',    accent: 'text-cyan-600' },
  slate:   { primary: 'bg-slate-700',   light: 'bg-slate-100',  border: 'border-slate-700',   text: 'text-slate-900',   accent: 'text-slate-700' },
};

const CertificateGenerator: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  
  // Single Mode State
  const [data, setData] = useState<CertificateData>({
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
  });

  // Bulk Mode State
  const [bulkData, setBulkData] = useState<BulkCertificateData[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0); // Track which student is being previewed
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, type: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const certificateRef = useRef<HTMLDivElement>(null);
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
      setPreviewIndex(0); // Reset to first
      
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

  // --- BULK PROCESSING LOGIC (Reused for PDF and ZIP) ---
  const processBulkItems = async (
    onItemProcessed: (imgData: string, item: BulkCertificateData, index: number) => Promise<void>
  ) => {
    if (bulkData.length === 0 || !certificateRef.current) return;
    
    // Simpan index saat ini untuk dikembalikan nanti
    const originalIndex = previewIndex;
    
    try {
      await document.fonts.ready;

      // Loop through all students
      for (let i = 0; i < bulkData.length; i++) {
        const item = bulkData[i];
        
        // 1. Update State to Render UI (Manual override of preview logic)
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

        // 2. WAIT for React to Render the DOM
        await new Promise(resolve => setTimeout(resolve, 150));

        // 3. Capture Image
        const canvas = await html2canvas(certificateRef.current, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: null,
          width: 400,
          height: 640,
          windowWidth: 400,
          windowHeight: 640,
        });
        const imgData = canvas.toDataURL('image/png');

        // 4. Callback to handler (PDF adder or ZIP adder)
        await onItemProcessed(imgData, item, i);

        // Update Progress
        setBulkProgress(prev => ({ ...prev, current: i + 1 }));
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      // Restore view to original index or 0
      setPreviewIndex(originalIndex);
      // Force refresh preview data
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
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      });

      pdf.save(`Bulk-Sertifikat-${new Date().toISOString().slice(0,10)}.pdf`);
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
        // Remove "data:image/png;base64," header
        const base64Data = imgData.replace(/^data:image\/(png|jpg);base64,/, "");
        const fileName = `${index + 1}_${item.studentName.replace(/[^a-zA-Z0-9]/g, '_')}_${item.grade}.png`;
        folder?.file(fileName, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `Sertifikat-Bundle-${new Date().toISOString().slice(0,10)}.zip`;
      link.click();

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
      await document.fonts.ready;
      
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        scrollX: 0,
        scrollY: 0,
        width: 400,
        height: 640,
        windowWidth: 400,
        windowHeight: 640,
      }); 
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Kartu-${data.studentName || 'Siswa'}-${data.grade}.png`;
      link.click();
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
      await document.fonts.ready;

      const canvas = await html2canvas(certificateRef.current, { 
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        scrollX: 0,
        scrollY: 0,
        width: 400,
        height: 640,
        windowWidth: 400,
        windowHeight: 640,
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = 100; 
      const imgHeight = 160; 
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`Kartu-${data.studentName || 'Siswa'}-${data.grade}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- GRADE & THEME LOGIC ---
  const currentGradeConfig = {
    B: { icon: ThumbsUp, label: 'Good Job!' },
    A: { icon: Star, label: 'Excellent!' },
    S: { icon: Crown, label: 'Legendary!' }
  }[data.grade];

  const currentThemeStyles = COLOR_THEMES[data.themeColor];
  const ThemeIcon = currentGradeConfig.icon;

  // Constants for fixed layout
  const HEADER_HEIGHT_PX = 220;

  // Dynamic Font Size for Grade Display (e.g. "Luar Biasa" needs smaller font than "A")
  const getGradeFontSize = (text: string) => {
    if (text.length <= 2) return 'text-[140px]'; // For "A", "A+", "10"
    if (text.length <= 5) return 'text-[80px]';  // For "Baik", "Great"
    if (text.length <= 10) return 'text-[50px]'; // For "Luar Biasa" (now wraps)
    return 'text-[45px]'; // For very long text
  };

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
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
               <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 {mode === 'single' ? <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                 {mode === 'single' ? '1. Data Penghargaan' : '1. Upload Data Massal'}
               </h3>
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
                      <p className="text-[10px] text-slate-400 mt-0.5">Teks ini yang akan tampil besar di pojok kiri atas kartu.</p>
                   </div>

                  {/* Color Palette Picker */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1">
                      <Palette className="w-3 h-3" /> Tema Warna
                    </label>
                    <div className="flex flex-wrap gap-2">
                       {(Object.keys(COLOR_THEMES) as CertificateThemeColor[]).map((c) => {
                         const style = COLOR_THEMES[c];
                         const isSelected = data.themeColor === c;
                         return (
                           <button
                             key={c}
                             onClick={() => handleColorChange(c)}
                             className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${style.primary} ${isSelected ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                             title={c.charAt(0).toUpperCase() + c.slice(1)}
                           >
                              {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
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
                      <select 
                        value={data.awardArea}
                        onChange={(e) => handleChange('awardArea', e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
                      >
                        {AWARD_AREAS.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
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
                      accept=".xlsx"
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
           <div className="bg-slate-200/50 dark:bg-slate-900/50 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 w-full flex flex-col items-center min-h-[500px] sm:min-h-[700px] overflow-hidden transition-colors">
              
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
              <div className="relative w-full flex justify-center">
                  <div className="transform scale-[0.7] xs:scale-[0.8] sm:scale-100 origin-top transition-transform duration-300">
                      <div 
                        ref={certificateRef}
                        className="w-[400px] h-[640px] bg-white relative shadow-2xl overflow-hidden flex-shrink-0 flex flex-col select-none"
                        style={{ fontFamily: "'Outfit', sans-serif" }} 
                      >
                          {/* Decorative Border Frame (Outer) */}
                          <div className={`absolute inset-0 border-[8px] ${currentThemeStyles.border} opacity-20 pointer-events-none z-10 box-border`}></div>
                          {/* Hand-drawn style Inner Border */}
                          <div className="absolute inset-3 border-2 border-slate-800 rounded-sm opacity-80 pointer-events-none z-10 box-border"></div>

                          {/* Watermark Icon */}
                          <div className="absolute bottom-0 right-0 opacity-[0.05] z-0 pointer-events-none">
                            <ThemeIcon size={400} />
                          </div>

                          {/* 1. TOP SECTION (Fixed PX) */}
                          <div 
                            className={`${currentThemeStyles.primary} relative w-full`}
                            style={{ height: `${HEADER_HEIGHT_PX}px` }}
                          >
                              
                              {/* Grade Letter */}
                              <div className="absolute top-8 left-8 max-w-[50%]">
                                <span className={`block text-left text-white font-display font-extrabold opacity-90 drop-shadow-md tracking-tighter leading-[1.1] break-words ${getGradeFontSize(data.gradeDisplay)}`}>
                                  {data.gradeDisplay}
                                </span>
                              </div>

                              {/* Header Info */}
                              <div className="absolute top-14 right-8 text-right text-white">
                                <div className="flex flex-col items-end gap-1 opacity-90">
                                  <div className="h-1.5 w-10 bg-white/60 rounded-full mb-1"></div>
                                  <h1 className="text-xl font-extrabold uppercase tracking-widest font-display leading-tight">
                                    Sertifikat<br/>Apresiasi
                                  </h1>
                                  <h2 className="text-sm font-medium tracking-wide opacity-90 mt-0.5">
                                    {currentGradeConfig.label}
                                  </h2>
                                </div>
                              </div>
                          </div>

                          {/* 2. CENTER ICON (Absolute Positioned) */}
                          <div 
                            className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                            style={{ top: `${HEADER_HEIGHT_PX}px` }}
                          >
                            <div className={`w-36 h-36 rounded-full bg-white border-[6px] ${currentThemeStyles.border} shadow-lg flex items-center justify-center`}>
                                <ThemeIcon className={`w-20 h-20 ${currentThemeStyles.accent}`} strokeWidth={1.5} />
                            </div>
                          </div>

                          {/* 3. BODY SECTION (Absolute positioning to fill rest) */}
                          <div className="absolute top-[220px] bottom-0 left-0 right-0 bg-white flex flex-col items-center text-center pt-20 px-6">
                              
                              {/* Name & Class Container */}
                              <div className="w-full flex flex-col items-center">
                                <h2 className={`text-3xl font-display font-extrabold text-slate-800 mb-1 break-words leading-tight w-full`}>
                                  {data.studentName || "Nama Siswa"}
                                </h2>
                                <p className="text-slate-500 font-bold text-lg tracking-wide uppercase">
                                  {data.studentClass || "Kelas"}
                                </p>
                              </div>

                              {/* Separator Pill */}
                              <div className="w-12 h-1.5 bg-slate-200 rounded-full my-5 flex-shrink-0"></div>

                              {/* Award & Quote Container */}
                              <div className="w-full mb-auto flex flex-col items-center">
                                <h3 className={`text-sm font-black ${currentThemeStyles.accent} uppercase tracking-widest mb-3 font-display`}>
                                    {data.awardArea}
                                </h3>
                                <div className="w-full px-2 max-h-[100px] overflow-hidden flex items-center justify-center">
                                    <p className="text-slate-600 text-sm font-semibold leading-relaxed opacity-80">
                                      "{data.generatedMessage}"
                                    </p>
                                </div>
                              </div>

                              {/* Footer (Absolute at bottom) */}
                              <div className="absolute bottom-10 w-full px-12 flex flex-col gap-5">
                                  
                                  {/* Tanggal */}
                                  <div className="w-full">
                                    <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-[0.2em] mb-1.5">Tanggal</p>
                                    <div className="w-full border-b-[3px] border-slate-800 pb-1.5 text-sm font-bold text-slate-800 font-display">
                                      {data.date}
                                    </div>
                                  </div>

                                  {/* Guru */}
                                  <div className="w-full">
                                    <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-[0.2em] mb-1.5">Guru</p>
                                    <div className="w-full border-b-[3px] border-slate-800 pb-1.5 text-sm font-bold text-slate-800 font-display">
                                      {data.teacherName || "Nama Guru"}
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