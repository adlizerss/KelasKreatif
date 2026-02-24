import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  Brain, 
  Zap, 
  Heart, 
  Users, 
  Trophy,
  Shuffle,
  Gamepad2,
  Handshake,
  Lightbulb,
  Smile,
  Music
} from 'lucide-react';

interface IceBreakerItem {
  id: string;
  category: 'reflection' | 'connection' | 'energy' | 'mindfulness' | 'challenge';
  title: string;
  description: string;
  instruction: string;
  duration: string;
}

const ICE_BREAKERS: IceBreakerItem[] = [
  // 1. REFLECTION (Refleksi & Makna)
  {
    id: 'ref1',
    category: 'reflection',
    title: 'Kapsul Waktu Mini',
    description: 'Pesan singkat untuk diri sendiri di masa depan.',
    instruction: '1. Minta siswa mengambil secarik kertas kecil.\n2. Tulis satu kalimat penyemangat atau target untuk diri mereka besok pagi.\n3. Simpan di saku atau kotak pensil.\n4. Instruksikan untuk membacanya saat bangun tidur besok.',
    duration: '5-7 Menit'
  },
  {
    id: 'ref2',
    category: 'reflection',
    title: 'Satu Kata Perasaan',
    description: 'Mengekspresikan kondisi emosional saat ini dengan satu kata.',
    instruction: '1. Guru bertanya: "Apa satu kata yang menggambarkan perasaanmu saat ini?".\n2. Tunjuk beberapa siswa secara acak untuk berbagi.\n3. Validasi perasaan mereka (senang, lelah, semangat) tanpa menghakimi.\n4. Ajak kelas untuk saling mendukung.',
    duration: '5 Menit'
  },
  {
    id: 'ref3',
    category: 'reflection',
    title: 'Tiga Hal Bersyukur',
    description: 'Melatih otak untuk fokus pada hal-hal positif.',
    instruction: '1. Minta siswa memejamkan mata sejenak.\n2. Pikirkan 3 hal sederhana yang mereka syukuri hari ini (misal: sarapan enak, cuaca cerah, teman baik).\n3. Minta 2-3 siswa untuk berbagi cerita mereka.\n4. Tutup dengan tepuk tangan apresiasi.',
    duration: '5-8 Menit'
  },
  {
    id: 'ref4',
    category: 'reflection',
    title: 'Pahlawan Hidupku',
    description: 'Mengingat sosok inspiratif untuk membangkitkan motivasi.',
    instruction: '1. Tanya siswa: "Siapa orang yang paling menginspirasimu dan kenapa?".\n2. Berikan waktu 1 menit untuk berpikir.\n3. Minta siswa berbagi dengan teman sebangku (share in pairs).\n4. Panggil beberapa perwakilan untuk cerita ke kelas.',
    duration: '5-10 Menit'
  },
  {
    id: 'ref5',
    category: 'reflection',
    title: 'Grafik Emosi Mingguan',
    description: 'Visualisasi perjalanan emosi selama satu minggu terakhir.',
    instruction: '1. Minta siswa menggambar grafik garis sederhana di kertas.\n2. Sumbu vertikal adalah "Perasaan" (Senang ke Sedih), sumbu horizontal adalah "Hari" (Senin-Jumat).\n3. Minta mereka menandai titik perasaan mereka setiap hari.\n4. Renungkan hari apa yang paling baik dan kenapa.',
    duration: '5-10 Menit'
  },
  {
    id: 'ref6',
    category: 'reflection',
    title: 'Surat Terima Kasih',
    description: 'Menulis apresiasi untuk seseorang di kelas.',
    instruction: '1. Siapkan kertas kecil untuk setiap siswa.\n2. Minta mereka menulis pesan terima kasih singkat untuk salah satu teman di kelas (bisa rahasia atau dengan nama).\n3. Kumpulkan dan bagikan, atau minta mereka memberikan langsung.\n4. Rasakan energi positif yang terbentuk.',
    duration: '5-10 Menit'
  },

  // 2. CONNECTION (Koneksi & Sosial)
  {
    id: 'con1',
    category: 'connection',
    title: 'Lingkaran Kebaikan',
    description: 'Saling memberikan energi positif dan apresiasi antar teman.',
    instruction: '1. Siswa berhadap-hadapan dengan teman sebangku atau belakangnya.\n2. Ucapkan kalimat: "Terima kasih karena sudah..." (isi sendiri).\n3. Contoh: "...sudah meminjamkan pulpen", "...sudah menjadi pendengar baik".\n4. Lakukan bergantian.',
    duration: '5 Menit'
  },
  {
    id: 'con2',
    category: 'connection',
    title: 'Kesamaan Tersembunyi',
    description: 'Mencari persamaan unik dengan teman yang jarang berinteraksi.',
    instruction: '1. Minta siswa mencari pasangan yang BUKAN teman dekatnya.\n2. Beri waktu 2 menit untuk mencari 3 kesamaan unik (selain sekolah/seragam).\n3. Contoh: "Sama-sama suka durian", "Sama-sama punya kucing oren".\n4. Tanya siapa yang menemukan kesamaan paling aneh.',
    duration: '5-8 Menit'
  },
  {
    id: 'con3',
    category: 'connection',
    title: 'Wawancara Kilat',
    description: 'Mengenal sisi lain teman sekelas dengan cepat.',
    instruction: '1. Berikan topik: "Kalau kamu punya uang 1 Miliar, apa yang pertama dibeli?".\n2. Siswa punya 1 menit untuk bertanya ke sebanyak mungkin teman.\n3. Kumpulkan jawaban-jawaban paling menarik di akhir.',
    duration: '5-10 Menit'
  },
  {
    id: 'con4',
    category: 'connection',
    title: 'Manusia Bingo',
    description: 'Bergerak mencari teman yang memenuhi kriteria.',
    instruction: '1. Guru sebutkan kriteria: "Cari teman yang lahir di bulan yang sama!".\n2. Siswa harus bergerak dan berkumpul dengan kelompok tersebut.\n3. Ulangi dengan kriteria lain: "Suka pedas vs manis", "Tim bubur diaduk vs tidak".',
    duration: '5-10 Menit'
  },
  {
    id: 'con5',
    category: 'connection',
    title: 'Dua Kebenaran Satu Kebohongan',
    description: 'Menebak fakta unik tentang teman.',
    instruction: '1. Minta siswa memikirkan 3 pernyataan tentang diri mereka (2 fakta, 1 bohong).\n2. Berkeliling dan sampaikan ke teman lain.\n3. Teman harus menebak mana yang bohong.\n4. Lakukan beberapa putaran dengan teman berbeda.',
    duration: '5-10 Menit'
  },
  {
    id: 'con6',
    category: 'connection',
    title: 'Barisan Ulang Tahun',
    description: 'Komunikasi non-verbal untuk mengurutkan barisan.',
    instruction: '1. Minta seluruh kelas berdiri.\n2. Tantangan: Berbaris urut berdasarkan tanggal dan bulan lahir (Januari - Desember).\n3. ATURAN: Dilarang berbicara sama sekali! Gunakan isyarat tangan.\n4. Cek urutannya setelah selesai.',
    duration: '5-10 Menit'
  },

  // 3. ENERGY (Energi & Gerak)
  {
    id: 'en1',
    category: 'energy',
    title: 'Hujan Jempol',
    description: 'Simulasi suara hujan untuk menyatukan fokus dan energi.',
    instruction: '1. Minta kelas hening.\n2. Gesekkan jempol & telunjuk (gerimis).\n3. Tepuk satu jari (hujan rintik).\n4. Tepuk tangan penuh (hujan deras).\n5. Hentakkan kaki (badai).\n6. Turunkan intensitas perlahan hingga sunyi kembali.',
    duration: '5 Menit'
  },
  {
    id: 'en2',
    category: 'energy',
    title: 'Senam Otak: Kiri Kanan',
    description: 'Mengaktifkan kedua belahan otak dengan gerakan tangan.',
    instruction: '1. Tangan kanan bentuk pistol (jempol & telunjuk), tangan kiri bentuk "V" (telunjuk & tengah).\n2. Dalam hitungan ketiga, tukar posisi tangan secara serentak.\n3. Lakukan berulang semakin cepat.\n4. Siapa yang jarinya "keseleo"?',
    duration: '5 Menit'
  },
  {
    id: 'en3',
    category: 'energy',
    title: 'Bos Berkata (Simon Says)',
    description: 'Melatih fokus pendengaran dan refleks motorik.',
    instruction: '1. Instruksi hanya dilakukan jika diawali "Bos Berkata...".\n2. Contoh: "Bos berkata pegang hidung" (Lakukan).\n3. "Pegang telinga!" (Jangan lakukan).\n4. Yang salah harus memberikan tepuk tangan semangat untuk kelas.',
    duration: '5-8 Menit'
  },
  {
    id: 'en4',
    category: 'energy',
    title: 'Tebak Gaya',
    description: 'Menyampaikan pesan melalui gerakan tubuh tanpa suara.',
    instruction: '1. Tunjuk satu siswa ke depan, berikan satu kata (misal: "Kangguru").\n2. Siswa tersebut harus memperagakan tanpa suara.\n3. Seluruh kelas menebak.\n4. Yang benar boleh maju menggantikan.',
    duration: '5-10 Menit'
  },
  {
    id: 'en5',
    category: 'energy',
    title: 'Tepuk Nyamuk',
    description: 'Melatih refleks dan konsentrasi.',
    instruction: '1. Siswa merentangkan tangan ke samping (seolah sayap).\n2. Tangan kanan di atas tangan kiri teman sebelah (telapak terbuka).\n3. Saat guru bilang "TEPUK!", tangan kanan harus menepuk tangan kiri teman sebelah, sementara tangan kiri harus menghindar.\n4. Lakukan bergantian.',
    duration: '5 Menit'
  },
  {
    id: 'en6',
    category: 'energy',
    title: 'Ikuti Pemimpin',
    description: 'Gerakan meniru untuk sinkronisasi kelas.',
    instruction: '1. Pilih satu "detektif" yang keluar ruangan sebentar.\n2. Tunjuk satu "pemimpin" di kelas. Semua siswa harus meniru gerakan pemimpin (tepuk tangan, garuk kepala, dll).\n3. Detektif masuk dan harus menebak siapa pemimpinnya.\n4. Pemimpin harus ganti gerakan diam-diam.',
    duration: '5-10 Menit'
  },

  // 4. MINDFULNESS (Fokus & Tenang)
  {
    id: 'mind1',
    category: 'mindfulness',
    title: 'Teknik 4-7-8',
    description: 'Latihan pernapasan untuk meredakan stres dan meningkatkan fokus.',
    instruction: '1. Duduk tegak, bahu rileks.\n2. Tarik napas lewat hidung (4 detik).\n3. Tahan napas (7 detik).\n4. Hembuskan lewat mulut perlahan (8 detik).\n5. Ulangi 3-5 kali siklus ini sampai terasa tenang.',
    duration: '5 Menit'
  },
  {
    id: 'mind2',
    category: 'mindfulness',
    title: 'Grounding 5 Indra',
    description: 'Teknik "mendarat" untuk mengatasi kecemasan atau pikiran buyar.',
    instruction: '1. Sebutkan 5 benda yang bisa dilihat.\n2. 4 benda yang bisa disentuh (tekstur baju, meja).\n3. 3 suara yang bisa didengar (AC, burung, napas).\n4. 2 bau yang bisa dicium.\n5. 1 hal yang disyukuri.',
    duration: '5 Menit'
  },
  {
    id: 'mind3',
    category: 'mindfulness',
    title: 'Visualisasi Sukses',
    description: 'Membangun kepercayaan diri melalui imajinasi positif.',
    instruction: '1. Minta siswa pejamkan mata.\n2. Pandu mereka membayangkan diri mereka sedang mengerjakan ujian/tugas dengan lancar.\n3. Bayangkan perasaan lega dan bangga setelah selesai.\n4. Buka mata dan bawa perasaan positif itu ke dunia nyata.',
    duration: '5 Menit'
  },
  {
    id: 'mind4',
    category: 'mindfulness',
    title: 'Mendengar Bunyi',
    description: 'Melatih fokus pendengaran tingkat tinggi.',
    instruction: '1. Minta hening total.\n2. Bunyikan lonceng/ketuk gelas sekali.\n3. Minta siswa mengangkat tangan HANYA saat mereka benar-benar tidak mendengar suaranya lagi (suara habis).\n4. Ulangi beberapa kali untuk melatih kesabaran.',
    duration: '5 Menit'
  },
  {
    id: 'mind5',
    category: 'mindfulness',
    title: 'Observasi Objek',
    description: 'Melatih atensi penuh pada satu titik.',
    instruction: '1. Minta siswa memegang satu benda (pulpen/penghapus).\n2. Amati benda itu selama 1 menit penuh: warnanya, goresannya, teksturnya.\n3. Minta mereka menutup mata dan membayangkan benda itu sedetail mungkin.\n4. Buka mata dan cek apa yang terlewat.',
    duration: '5 Menit'
  },
  {
    id: 'mind6',
    category: 'mindfulness',
    title: 'Body Scan Sederhana',
    description: 'Relaksasi otot untuk mengurangi ketegangan fisik.',
    instruction: '1. Duduk nyaman, kaki menapak lantai.\n2. Fokus ke jari kaki, tegangkan sebentar, lalu lemaskan.\n3. Pindah ke betis, paha, perut, bahu, hingga wajah.\n4. Rasakan perbedaan antara tegang dan rileks.',
    duration: '5-8 Menit'
  },

  // 5. CHALLENGE (Tantangan Seru)
  {
    id: 'chal1',
    category: 'challenge',
    title: 'Detektif Logika',
    description: 'Memecahkan kasus sederhana dengan berpikir kritis.',
    instruction: '1. Kasus: "Seorang pria terjebak di ruangan tanpa pintu/jendela. Hanya ada meja dan gergaji. Bagaimana dia keluar?".\n2. Biarkan siswa berdiskusi.\n3. Jawaban: "Gergaji meja jadi dua bagian. Dua bagian digabung jadi satu (lubang). Dia keluar lewat lubang." (Jawaban lateral/kreatif).',
    duration: '5-8 Menit'
  },
  {
    id: 'chal2',
    category: 'challenge',
    title: 'Sambung Cerita Aneh',
    description: 'Melatih kreativitas dan adaptabilitas cepat.',
    instruction: '1. Guru mulai: "Tiba-tiba, seekor dinosaurus masuk kelas...".\n2. Tunjuk siswa acak untuk lanjut 1 kalimat.\n3. Cerita harus nyambung tapi boleh seaneh mungkin.\n4. Lakukan cepat agar adrenalin terpacu.',
    duration: '5-10 Menit'
  },
  {
    id: 'chal3',
    category: 'challenge',
    title: 'Tebak Tokoh',
    description: 'Permainan "Ya/Tidak" untuk menebak figur terkenal.',
    instruction: '1. Satu siswa maju, tempel kertas bertuliskan nama tokoh di punggungnya (dia tidak tahu).\n2. Dia boleh tanya ke kelas: "Apakah aku manusia?", "Apakah aku hidup?".\n3. Kelas hanya boleh jawab "Ya", "Tidak", atau "Bisa jadi".',
    duration: '5-10 Menit'
  },
  {
    id: 'chal4',
    category: 'challenge',
    title: 'Menara Sepatu',
    description: 'Tantangan kerjasama tim membangun struktur.',
    instruction: '1. Bagi kelas jadi beberapa kelompok.\n2. Tantang mereka membuat "menara" tertinggi menggunakan sepatu/tas mereka dalam 2 menit.\n3. Ajarkan tentang pondasi yang kuat dan kerjasama.',
    duration: '5-10 Menit'
  },
  {
    id: 'chal5',
    category: 'challenge',
    title: 'Tebak Gambar Punggung',
    description: 'Komunikasi visual berantai.',
    instruction: '1. Buat barisan ke belakang (seperti kereta).\n2. Orang paling belakang menggambar bentuk sederhana (segitiga/rumah) di punggung teman depannya dengan jari.\n3. Estafet sampai depan.\n4. Orang paling depan menggambar di papan tulis. Bandingkan hasilnya!',
    duration: '5-10 Menit'
  },
  {
    id: 'chal6',
    category: 'challenge',
    title: 'Menghitung Bersama',
    description: 'Melatih kepekaan kelompok tanpa komando.',
    instruction: '1. Minta kelas hening.\n2. Tugas: Menghitung 1 sampai 20 secara acak.\n3. Siapa saja boleh sebut angka selanjutnya, TAPI jika ada 2 orang bicara bersamaan, harus ulang dari 1.\n4. Tidak boleh janjian urutan.',
    duration: '5-10 Menit'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Semua', icon: Gamepad2, color: 'bg-slate-500' },
  { id: 'reflection', label: 'Refleksi', icon: Heart, color: 'bg-rose-500' },
  { id: 'connection', label: 'Koneksi', icon: Users, color: 'bg-blue-500' },
  { id: 'energy', label: 'Energi', icon: Zap, color: 'bg-amber-500' },
  { id: 'mindfulness', label: 'Fokus', icon: Brain, color: 'bg-emerald-500' },
  { id: 'challenge', label: 'Tantangan', icon: Trophy, color: 'bg-purple-500' },
];

const IceBreaker: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentIceBreaker, setCurrentIceBreaker] = useState<IceBreakerItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const filteredItems = selectedCategory === 'all' 
    ? ICE_BREAKERS 
    : ICE_BREAKERS.filter(item => item.category === selectedCategory);

  const pickRandom = () => {
    setIsSpinning(true);
    // Simulate a "spin" effect
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredItems.length);
      setCurrentIceBreaker(filteredItems[randomIndex]);
      setIsSpinning(false);
    }, 800);
  };

  useEffect(() => {
    // Pick initial random one
    if (!currentIceBreaker && filteredItems.length > 0) {
      setCurrentIceBreaker(filteredItems[Math.floor(Math.random() * filteredItems.length)]);
    }
  }, [filteredItems, currentIceBreaker]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight font-display">
          Penyegar & Inspirasi
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Koleksi aktivitas bermakna untuk membangun koneksi, fokus, dan semangat kelas. 
          Lebih dari sekadar permainan, ini adalah momen untuk tumbuh bersama.
        </p>
      </div>

      {/* Category Selection */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIceBreaker(null); // Reset to pick new from category
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                isActive 
                  ? `${cat.color} text-white border-transparent shadow-lg scale-105` 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-bold">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {currentIceBreaker && !isSpinning ? (
            <motion.div
              key={currentIceBreaker.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 dark:shadow-none border border-white/50 dark:border-white/5 overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl text-white shadow-lg ${CATEGORIES.find(c => c.id === currentIceBreaker.category)?.color}`}>
                      {React.createElement(CATEGORIES.find(c => c.id === currentIceBreaker.category)?.icon || Sparkles, { className: "w-8 h-8" })}
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1 block">
                        {CATEGORIES.find(c => c.id === currentIceBreaker.category)?.label}
                      </span>
                      <h3 className="text-3xl font-black text-slate-800 dark:text-white font-display leading-tight">
                        {currentIceBreaker.title}
                      </h3>
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-700/50 px-5 py-2.5 rounded-xl flex items-center gap-2 self-start md:self-center border border-slate-200 dark:border-slate-600">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{currentIceBreaker.duration}</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-800 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles className="w-24 h-24 text-indigo-500" />
                    </div>
                    <p className="text-xl md:text-2xl font-medium text-indigo-900 dark:text-indigo-100 leading-relaxed italic relative z-10">
                      "{currentIceBreaker.description}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                      <ChevronRight className="w-4 h-4" /> Panduan Guru
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                      <p className="text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-line text-lg">
                        {currentIceBreaker.instruction}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-center">
                  <button
                    onClick={pickRandom}
                    className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-200 dark:shadow-none hover:-translate-y-1 active:scale-95 text-lg"
                  >
                    <Shuffle className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    ACAK
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center bg-white/50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <RotateCcw className="w-16 h-16 text-indigo-500/50" />
              </motion.div>
              <p className="text-slate-400 font-bold text-lg">Memilih inspirasi terbaik...</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Impact Indicators */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 dark:text-white mb-1">Koneksi Emosional</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Membangun rasa aman dan saling percaya antar siswa, fondasi utama pembelajaran efektif.</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 dark:text-white mb-1">Kesiapan Mental</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Teknik mindfulness membantu transisi otak dari mode 'istirahat' ke mode 'fokus belajar'.</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 dark:text-white mb-1">Budaya Positif</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Menciptakan kebiasaan saling menghargai dan mendengarkan dalam lingkungan kelas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IceBreaker;
