import React from 'react';
import { motion } from 'motion/react';
import { Folder, ChevronRight, AlertCircle } from 'lucide-react';
import { YearPeriod, UploadedFile, Indicator } from '../../types';
import { calculateIndicatorProgress } from '../../utils/progressUtils';

interface DashboardProps {
  mockData: YearPeriod[];
  allFiles: UploadedFile[];
  onIndicatorSelect: (ind: Indicator) => void;
  onViewChecklist: () => void;
  onToggleNode: (id: string) => void;
}

export const Dashboard = ({
  mockData,
  allFiles,
  onIndicatorSelect,
  onViewChecklist,
  onToggleNode
}: DashboardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Evidencias</span>
          <h3 className="text-2xl font-black text-slate-800">
            {mockData[0].criteria.reduce((acc, c) => acc + c.subCriteria.reduce((acc2, s) => acc2 + s.indicators.reduce((acc3, i) => acc3 + i.requirements.length, 0), 0), 0)}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Cargadas</span>
          <h3 className="text-2xl font-black text-blue-600">
             {allFiles.filter(f => f.isCurrentVersion).length}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Validadas</span>
          <h3 className="text-2xl font-black text-emerald-600">
             {allFiles.filter(f => f.status === 'Validado' && f.isCurrentVersion).length}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Observadas</span>
          <h3 className="text-2xl font-black text-amber-500">
             {allFiles.filter(f => f.status === 'Observado' && f.isCurrentVersion).length}
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
            Estructura Institucional de Calidad
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
          {mockData[0].criteria.map(crit => (
            <div 
              key={crit.id} 
              onClick={() => onToggleNode(`crit-${crit.id}`)}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Folder className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Criterio {crit.id}</span>
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{crit.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-6">
                {crit.subCriteria.length} Subcriterios • {crit.subCriteria.reduce((acc, sub) => acc + sub.indicators.length, 0)} Indicadores
              </p>
              <div className="space-y-4">
                 {crit.subCriteria.map(sub => {
                   const subProgress = Math.round(sub.indicators.reduce((sum, ind) => sum + calculateIndicatorProgress(ind, allFiles), 0) / (sub.indicators.length || 1));
                   return (
                     <div key={sub.id} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                         <span className="text-slate-400 truncate max-w-[80%]">{sub.name}</span>
                         <span className="text-blue-600">{subProgress}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${subProgress}%` }} />
                       </div>
                     </div>
                   );
                 })}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Atención Requerida: Evidencias Pendientes</h3>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo CACES 2024</span>
          </div>
          <div className="divide-y divide-slate-50">
            {mockData[0].criteria.flatMap(c => c.subCriteria.flatMap(s => s.indicators)).filter(i => i.status === 'Pendiente').slice(0, 5).map(ind => (
              <div 
                key={ind.code} 
                onClick={() => onIndicatorSelect(ind)}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                    {ind.code}
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-700">{ind.name}</p>
                     <div className="flex gap-2 mt-1">
                       {ind.requirements.slice(0, 2).map(r => (
                         <span key={r.id} className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded italic">Falta: {r.label}</span>
                       ))}
                     </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-all" />
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-50/50 text-center border-t border-slate-50">
            <button 
              onClick={onViewChecklist}
              className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.2em] transition-colors"
            >
              Visualizar todos los requerimientos
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
