import React from 'react';
import { GroupResult } from '../types';
import { Download, FileText, File as FileIcon } from 'lucide-react';
import { exportToDocx, exportToTxt } from '../utils/exporters';
import { motion } from 'framer-motion';

interface ResultsSectionProps {
  groups: GroupResult[];
}

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
                    <span className="font-medium">{member.name}</span>
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