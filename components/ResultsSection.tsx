import React from 'react';
import { GroupResult } from '../types';
import { Download, FileText, File as FileIcon, User, SignalHigh, SignalMedium, SignalLow, Signal } from 'lucide-react';
import { exportToDocx, exportToTxt } from '../utils/exporters';
import { motion } from 'framer-motion';

interface ResultsSectionProps {
  groups: GroupResult[];
}

const ProficiencyBadge = ({ score, label }: { score?: number, label?: string }) => {
  if (!score) return null;
  
  let colorClass = "bg-slate-100 text-slate-600";
  let icon = <Signal className="w-3 h-3" />;

  if (score === 4) { // Mahir
     colorClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
     icon = <SignalHigh className="w-3 h-3" />;
  } else if (score === 3) { // Cakap
     colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
     icon = <SignalMedium className="w-3 h-3" />;
  } else if (score === 2) { // Dasar
     colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
     icon = <SignalLow className="w-3 h-3" />;
  } else if (score === 1) { // Intervensi
     colorClass = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
     icon = <Signal className="w-3 h-3 rotate-90" />; // Custom icon or reuse
  }

  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${colorClass}`} title={label}>
      {icon} {label}
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
              <ul className="space-y-2">
                {group.members.map((member, i) => (
                  <li key={member.id} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm border-b last:border-0 border-slate-50 dark:border-slate-700 pb-2 last:pb-0">
                    <span className="font-mono text-slate-400 w-5 text-right flex-shrink-0 select-none">{i + 1}.</span>
                    <div className="flex flex-col w-full">
                       <span className="font-medium flex items-center gap-2 flex-wrap">
                        {member.name}
                        {member.gender === 'M' && <span className="text-[10px] font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">L</span>}
                        {member.gender === 'F' && <span className="text-[10px] font-bold text-pink-500 bg-pink-100 dark:bg-pink-900/30 px-1.5 py-0.5 rounded">P</span>}
                       </span>
                       {/* Proficiency Badge below name or beside */}
                       {member.proficiency && (
                          <div className="mt-1">
                            <ProficiencyBadge score={member.proficiency} label={member.proficiencyLabel} />
                          </div>
                       )}
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