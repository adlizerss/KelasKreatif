export interface Student {
  id: string;
  name: string;
}

export enum GroupingMode {
  BY_COUNT = 'BY_COUNT',
  BY_SIZE = 'BY_SIZE',
}

export type NamingType = 'auto' | 'custom';

export interface GroupConfig {
  mode: GroupingMode;
  value: number; // Represents either total groups or size per group
  namingPattern: string; // e.g., "Kelompok", "Tim"
  namingType: NamingType;
  customNames: string[];
}

export interface GroupResult {
  id: string;
  name: string;
  members: Student[];
}

export type FileType = 'txt' | 'csv' | 'xlsx';

// Certificate Types
export type CertificateGrade = 'B' | 'A' | 'S';
export type CertificateThemeColor = 'emerald' | 'blue' | 'yellow' | 'purple' | 'pink' | 'red' | 'orange' | 'cyan' | 'slate';

export interface CertificateData {
  grade: CertificateGrade;
  themeColor: CertificateThemeColor;
  gradeDisplay: string; // Teks yang ditampilkan sebagai huruf besar (misal: "A", "1", "S+")
  studentName: string;
  studentClass: string;
  awardArea: string;
  specificQuote: string;
  teacherName: string;
  date: string;
  generatedMessage: string;
}

export interface BulkCertificateData {
  id: string;
  studentName: string;
  studentClass: string;
  grade: CertificateGrade;
  themeColor?: CertificateThemeColor;
  gradeDisplay?: string;
  awardArea: string;
  specificQuote: string;
  teacherName: string;
  date: string;
}