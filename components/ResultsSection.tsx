import React from 'react';
import { GroupResult } from '../types';
import { FileText, File as FileIcon, SignalHigh, SignalMedium, SignalLow, Info } from 'lucide-react';
import { exportToDocx, exportToTxt } from '../utils/exporters';
import { motion } from 'framer-motion';

interface ResultsSectionProps {
  groups: GroupResult[];
}

const ProficiencyBadge = ({ score, label }: { score?: number, label?: string }) => {
  // Jika tidak ada score, jangan render apapun (untuk siswa tanpa data kemampuan)
  if (score === undefined || score === null) return null;
  
  // Default Style (Fallback)
  let colorClass = "bg-slate-100 text-slate-600 border-slate-200";
  let icon = <SignalLow className="w-3 h-3" />;
  let defaultLabel = "Umum";

  // Logika Eksplisit untuk setiap Level
  switch (score) {
    case 4: // Mahir
      colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      icon = <SignalHigh className="w-3 h-3" />;
      defaultLabel = "Mahir";
      break;
    case 3: // Cakap
      colorClass = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      icon = <SignalMedium className="w-3 h-3" />;
      defaultLabel = "Cakap";
      break;
    case 2: // Dasar / Berkembang
      colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      icon = <SignalLow className="w-3 h-3" />;
      defaultLabel = "Dasar";
      break;
    case 1: // Intervensi
      colorClass = "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      icon = <Info className="w-3 h-3" />;
      defaultLabel = "Perlu Intervensi";
      break;
    default:
      // Handle jika ada angka lain
      defaultLabel = label || "Umum";
      break;
  }

  // Gunakan label dari Excel jika ada, jika tidak gunakan defaultLabel berdasarkan skor
  const displayLabel = label || defaultLabel;

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 border ${colorClass} w-fit mt-1 shadow-sm`} title={`Level: ${score}`}>
      {icon} {displayLabel}
    </span>
  );
};

const ResultsSection: React.FC<ResultsSectionProps> = ({ groups }) => {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Hasil Pembagian ({groups.length} Kelompok)</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => exportToTxt(groups)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            Ekspor .TXT
          </button>
          <button
            onClick={() => exportToDocx(groups)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-sm font-medium"
          >
            <FileIcon className="w-4 h-4" />
            Ekspor .DOCX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, idx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3">
              <h3 className="text-white font-bold text-lg">{group.name}</h3>
              <p className="text-indigo-100 text-xs">{group.members.length} Anggota</p>
            </div>
            <div className="p-4 flex-1">
              <ul className="space-y-3">
                {group.members.map((member, i) => (
                  <li key={member.id} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm border-b last:border-0 border-slate-50 dark:border-slate-700 pb-3 last:pb-0">
                    <span className="font-mono text-slate-400 w-5 text-right flex-shrink-0 select-none pt-0.5">{i + 1}.</span>
                    <div className="flex flex-col w-full">
                       <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{member.name}</span>
                        {member.gender === 'M' && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-1.5 py-0 rounded">L</span>}
                        {member.gender === 'F' && <span className="text-[9px] font-bold text-pink-600 bg-pink-50 dark:bg-pink-900/30 border border-pink-100 dark:border-pink-800 px-1.5 py-0 rounded">P</span>}
                       </div>
                       {/* Proficiency Badge */}
                       <ProficiencyBadge score={member.proficiency} label={member.proficiencyLabel} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ResultsSection;