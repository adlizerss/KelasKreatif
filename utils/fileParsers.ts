import * as XLSX from 'xlsx';
import { Student, BulkCertificateData, CertificateGrade, CertificateThemeColor } from '../types';
import { robustSaveAs } from './exporters';

export interface ParsedStudent {
  name: string;
  gender?: 'M' | 'F';
  proficiency?: number;
  proficiencyLabel?: string;
}

// Helper to map string to proficiency score safely
const mapProficiency = (input: string): { score: number, label: string } | undefined => {
  const normalized = input.trim().toUpperCase();
  
  // Helper untuk mengecek kata utuh (Word Boundary check manual)
  // Mencegah "DASAR" terdeteksi sebagai "A" karena mengandung huruf A
  const hasWord = (word: string) => {
     // Cek exact match
     if (normalized === word) return true;
     // Cek awal/akhir/tengah dengan spasi atau tanda baca umum
     const regex = new RegExp(`(^|\\s|\\(|\\)|\\/|\\-)${word}($|\\s|\\(|\\)|\\/|\\-)`);
     return regex.test(normalized);
  };

  // --- LEVEL 4: MAHIR / ADVANCED ---
  if (
    normalized.includes('MAHIR') || 
    normalized.includes('ADVANCED') || 
    normalized.includes('SANGAT BAIK') || 
    hasWord('A') || 
    hasWord('4')
  ) {
    return { score: 4, label: 'Mahir' };
  }

  // --- LEVEL 3: CAKAP / PROFICIENT ---
  if (
    normalized.includes('CAKAP') || 
    normalized.includes('PROFICIENT') || 
    (normalized.includes('BAIK') && !normalized.includes('SANGAT')) || // Hindari SANGAT BAIK
    hasWord('B') || 
    hasWord('3')
  ) {
    return { score: 3, label: 'Cakap' };
  }

  // --- LEVEL 2: DASAR / BERKEMBANG ---
  if (
    normalized.includes('BERKEMBANG') || 
    normalized.includes('DEVELOPING') || 
    normalized.includes('CUKUP') || 
    normalized.includes('DASAR') || 
    normalized.includes('BASIC') ||
    hasWord('C') || 
    hasWord('2')
  ) {
    return { score: 2, label: 'Dasar' };
  }

  // --- LEVEL 1: INTERVENSI / PERLU BIMBINGAN ---
  if (
    normalized.includes('INTERVENSI') || 
    normalized.includes('BUTUH') || 
    normalized.includes('KURANG') || 
    normalized.includes('AWAL') || 
    normalized.includes('BIMBINGAN') ||
    hasWord('D') || 
    hasWord('E') || // Kadang E juga dipakai
    hasWord('1')
  ) {
    return { score: 1, label: 'Perlu Intervensi' };
  }

  return undefined;
};

export const parseTextFile = async (file: File): Promise<ParsedStudent[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
        // Text file assumes just names, no gender/proficiency
        const parsed: ParsedStudent[] = lines.map(name => ({ name }));
        resolve(parsed);
      } else {
        resolve([]);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const parseExcelFile = async (file: File): Promise<ParsedStudent[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Use header: 1 to get array of arrays (Row-based)
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        const students: ParsedStudent[] = [];

        jsonData.forEach((row, index) => {
          // Skip header row
          if (index === 0 && typeof row[0] === 'string' && (row[0].toLowerCase().includes('nama') || row[0].toLowerCase().includes('name'))) {
            return;
          }

          if (row.length > 0 && row[0]) {
            const name = String(row[0]).trim();
            if (!name) return;

            // 1. Gender (Column B)
            let gender: 'M' | 'F' | undefined = undefined;
            if (row[1]) {
              const rawGender = String(row[1]).trim().toUpperCase();
              if (['L', 'M', 'LAKI', 'LAKI-LAKI', 'MALE', 'MAN', 'PRIA'].includes(rawGender)) {
                gender = 'M';
              } else if (['P', 'F', 'PEREMPUAN', 'FEMALE', 'WOMAN', 'WANITA'].includes(rawGender)) {
                gender = 'F';
              }
            }

            // 2. Proficiency (Column C)
            let proficiency: number | undefined = undefined;
            let proficiencyLabel: string | undefined = undefined;
            if (row[2]) {
              const rawProf = String(row[2]);
              const mapped = mapProficiency(rawProf);
              if (mapped) {
                proficiency = mapped.score;
                proficiencyLabel = mapped.label;
              }
            }

            students.push({ name, gender, proficiency, proficiencyLabel });
          }
        });
        resolve(students);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsBinaryString(file);
  });
};

export const parseCertificateExcel = async (file: File): Promise<BulkCertificateData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
        
        // Mapping angka ke warna
        const colorMap: CertificateThemeColor[] = [
          'emerald', // 1
          'blue',    // 2
          'yellow',  // 3
          'purple',  // 4
          'pink',    // 5
          'red',     // 6
          'orange',  // 7
          'cyan',    // 8
          'slate'    // 9
        ];

        const certificates: BulkCertificateData[] = jsonData.map((row, index) => {
          
          // Parse Color: Support angka (1-9) atau string lama
          let themeColor: CertificateThemeColor = 'emerald';
          const rawColor = row['Warna'] || row['Color'] || row['Warna (1-9)'];

          if (rawColor) {
            // Jika input angka
            const numColor = parseInt(String(rawColor));
            if (!isNaN(numColor) && numColor >= 1 && numColor <= 9) {
               themeColor = colorMap[numColor - 1];
            } 
            // Fallback jika input string manual (legacy support)
            else if (typeof rawColor === 'string') {
               const lowerColor = rawColor.toLowerCase() as CertificateThemeColor;
               if (colorMap.includes(lowerColor)) {
                 themeColor = lowerColor;
               }
            }
          }

          let grade: CertificateGrade = 'B';
          if (['yellow', 'orange'].includes(themeColor)) {
            grade = 'S';
          } else if (['blue', 'purple', 'pink', 'cyan'].includes(themeColor)) {
            grade = 'A';
          } else {
            grade = 'B';
          }

          if (row['Grade']) {
             const manualGrade = row['Grade'].toUpperCase();
             if (['A', 'B', 'S'].includes(manualGrade)) grade = manualGrade as CertificateGrade;
          }

          let gradeDisplay = row['Teks Grade'] || row['Display'] || row['Judul'] || '';
          if (!gradeDisplay) {
            if (grade === 'S') gradeDisplay = 'Luar Biasa';
            else if (grade === 'A') gradeDisplay = 'Sangat Baik';
            else gradeDisplay = 'Baik';
          }

          return {
            id: `cert-${index}`,
            studentName: row['Nama Siswa'] || row['Nama'] || row['Name'] || '',
            studentClass: row['Kelas'] || row['Class'] || '',
            grade: grade, 
            themeColor: themeColor,
            gradeDisplay: gradeDisplay,
            awardArea: row['Area Penghargaan'] || row['Area'] || 'Partisipasi Aktif',
            specificQuote: row['Kutipan Khusus'] || row['Quote'] || '',
            teacherName: row['Nama Guru'] || row['Guru'] || '',
            date: row['Tanggal'] || row['Date'] || '',
          };
        }).filter(item => item.studentName.length > 0); 

        resolve(certificates);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsBinaryString(file);
  });
};

export const generateSampleCertificateExcel = () => {
  const ws = XLSX.utils.json_to_sheet([
    {
      "Nama Siswa": "Budi Santoso",
      "Kelas": "XII IPA 1",
      "Warna (1-9)": 1,
      "Teks Grade": "Baik",
      "Area Penghargaan": "Partisipasi Aktif",
      "Kutipan Khusus": "Selalu hadir tepat waktu",
      "Nama Guru": "Bpk. Joko",
      "Tanggal": "20 Oktober 2023"
    },
  ]);

  ws['!cols'] = [
    { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Sertifikat");
  
  // Convert to binary array for Blob creation (Mobile Friendly)
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  robustSaveAs(blob, "Template_Sertifikat.xlsx");
};

export const generateStudentListTemplate = () => {
  // Updated template with clearer instructions for Gender and Proficiency
  const ws = XLSX.utils.json_to_sheet([
    { "Nama Siswa": "Andi Pratama", "Jenis Kelamin (L/P)": "L", "Kemampuan (Mahir/Cakap/Dasar/Intervensi)": "Mahir" },
    { "Nama Siswa": "Siti Aminah", "Jenis Kelamin (L/P)": "P", "Kemampuan (Mahir/Cakap/Dasar/Intervensi)": "Cakap" },
    { "Nama Siswa": "Budi Santoso", "Jenis Kelamin (L/P)": "L", "Kemampuan (Mahir/Cakap/Dasar/Intervensi)": "Dasar" },
    { "Nama Siswa": "Dewi Sartika", "Jenis Kelamin (L/P)": "P", "Kemampuan (Mahir/Cakap/Dasar/Intervensi)": "Intervensi" },
  ]);
  
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 40 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Daftar Siswa");
  
  // Convert to binary array for Blob creation (Mobile Friendly)
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  robustSaveAs(blob, "Template_Daftar_Siswa_Lengkap.xlsx");
};

export const processRawNames = (inputs: (string | ParsedStudent)[]): Student[] => {
  return inputs.map((item) => {
    const name = typeof item === 'string' ? item : item.name;
    const gender = typeof item === 'string' ? undefined : item.gender;
    const proficiency = typeof item === 'string' ? undefined : item.proficiency;
    const proficiencyLabel = typeof item === 'string' ? undefined : item.proficiencyLabel;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      gender: gender,
      proficiency: proficiency,
      proficiencyLabel: proficiencyLabel
    };
  });
};