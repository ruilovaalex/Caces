import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { YearPeriod, Indicator } from '../../types';

interface ChecklistViewProps {
  mockData: YearPeriod[];
  onIndicatorSelect: (ind: Indicator) => void;
  onBackToDashboard: () => void;
}

export const ChecklistView = ({
  mockData,
  onIndicatorSelect,
  onBackToDashboard
}: ChecklistViewProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Checklist Geral de Cumplimiento</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Mapa de Evidencias CACES 2024</p>
        </div>
        <button 
          onClick={onBackToDashboard}
          className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
        >
          Volver al Dashboard
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cod / Indicador</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidencias Requeridas</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progreso</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mockData[0].criteria.flatMap(c => c.subCriteria.flatMap(s => s.indicators)).map(ind => (
              <tr key={ind.code} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6 align-top">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-800">{ind.code}</span>
                    <span className="text-sm font-bold text-slate-600 line-clamp-1">{ind.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-2">
                    {ind.requirements.map(req => (
                      <div key={req.id} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'Validado' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        <span className={`text-[11px] font-medium ${req.status === 'Validado' ? 'text-emerald-700' : 'text-slate-400'}`}>{req.label}</span>
                      </div>
                    ))}
                    {ind.requirements.length === 0 && <span className="text-[10px] text-slate-300 italic font-medium tracking-wide">Sin documentos base definidos</span>}
                  </div>
                </td>
                <td className="px-8 py-6 text-center align-top">
                   <div className="inline-flex items-center gap-3 px-3 py-1 bg-slate-100 rounded-lg">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${ind.status === 'Validado' ? 'text-emerald-500' : 'text-slate-300'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${ind.status === 'Validado' ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {ind.status}
                      </span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right align-top">
                  <button 
                    onClick={() => onIndicatorSelect(ind)}
                    className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
