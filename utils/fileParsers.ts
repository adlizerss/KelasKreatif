import * as XLSX from 'xlsx';
import { Student, BulkCertificateData, CertificateGrade, CertificateThemeColor } from '../types';

export const parseTextFile = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
        resolve(lines);
      } else {
        resolve([]);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const parseExcelFile = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to array of arrays, assuming first column is names
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        const names: string[] = [];
        jsonData.forEach((row) => {
          if (row.length > 0 && row[0]) {
            const name = String(row[0]).trim();
            if (name) names.push(name);
          }
        });
        resolve(names);
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

          // Otomatis tentukan Icon/Internal Grade berdasarkan warna
          // Kuning/Orange -> Crown (S)
          // Biru/Ungu/Pink/Cyan -> Star (A)
          // Hijau/Merah/Abu -> ThumbsUp (B)
          let grade: CertificateGrade = 'B';
          if (['yellow', 'orange'].includes(themeColor)) {
            grade = 'S';
          } else if (['blue', 'purple', 'pink', 'cyan'].includes(themeColor)) {
            grade = 'A';
          } else {
            grade = 'B';
          }

          // Override jika user masih memaksa kolom Grade (Legacy support)
          if (row['Grade']) {
             const manualGrade = row['Grade'].toUpperCase();
             if (['A', 'B', 'S'].includes(manualGrade)) grade = manualGrade as CertificateGrade;
          }

          // Parse Custom Grade Display (Huruf/Teks)
          let gradeDisplay = row['Teks Grade'] || row['Display'] || row['Judul'] || '';
          if (!gradeDisplay) {
            // Default text jika kosong
            if (grade === 'S') gradeDisplay = 'Luar Biasa';
            else if (grade === 'A') gradeDisplay = 'Sangat Baik';
            else gradeDisplay = 'Baik';
          }

          return {
            id: `cert-${index}`,
            studentName: row['Nama Siswa'] || row['Nama'] || row['Name'] || '',
            studentClass: row['Kelas'] || row['Class'] || '',
            grade: grade, // Internal logic for Icon
            themeColor: themeColor,
            gradeDisplay: gradeDisplay, // Visual Text
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
    {
      "Nama Siswa": "Siti Aminah",
      "Kelas": "XII IPA 2",
      "Warna (1-9)": 4,
      "Teks Grade": "Sangat Baik",
      "Area Penghargaan": "Matematika Terbaik",
      "Kutipan Khusus": "Mendapat nilai sempurna",
      "Nama Guru": "Bpk. Joko",
      "Tanggal": "20 Oktober 2023"
    },
    {
      "Nama Siswa": "Doni Kurnia",
      "Kelas": "XII IPS 1",
      "Warna (1-9)": 3,
      "Teks Grade": "Luar Biasa",
      "Area Penghargaan": "Seni & Kreativitas",
      "Kutipan Khusus": "Juara 1 lomba poster",
      "Nama Guru": "Bpk. Joko",
      "Tanggal": "20 Oktober 2023"
    }
  ]);

  // Adjust column widths
  ws['!cols'] = [
    { wch: 20 }, // Nama
    { wch: 10 }, // Kelas
    { wch: 12 }, // Warna
    { wch: 15 }, // Teks Grade
    { wch: 20 }, // Area
    { wch: 30 }, // Kutipan
    { wch: 15 }, // Guru
    { wch: 15 }  // Tanggal
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Sertifikat");
  XLSX.writeFile(wb, "Template_Sertifikat.xlsx");
};

export const generateStudentListTemplate = () => {
  const ws = XLSX.utils.json_to_sheet([
    { "Nama Siswa": "Andi Pratama" },
    { "Nama Siswa": "Budi Santoso" },
    { "Nama Siswa": "Citra Lestari" },
    { "Nama Siswa": "Dewi Sartika" },
    { "Nama Siswa": "Eko Purnomo" }
  ]);
  
  // Set column width
  ws['!cols'] = [{ wch: 30 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Daftar Siswa");
  XLSX.writeFile(wb, "Template_Daftar_Siswa.xlsx");
};

export const processRawNames = (names: string[]): Student[] => {
  return names.map((name) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: name,
  }));
};