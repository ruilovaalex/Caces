import React from 'react';
import { Folder, Clock, CheckCircle2, AlertCircle, ChevronRight, FileText } from 'lucide-react';

interface DocenteDashboardProps {
  onViewAllFiles: () => void;
  onViewAllActivities: () => void;
}

export const DocenteDashboard = ({ onViewAllFiles, onViewAllActivities }: DocenteDashboardProps) => {
  const stats = {
    uploaded: 3,
    pending: 3,
    validated: 1,
    observed: 1
  };

  const recentFiles = [
    { id: '1', name: 'Syllabus_Biologia_2024.pdf', date: '01/06/2026', status: 'Validado' },
    { id: '2', name: 'Acta_Reunion_Marzo.docx', date: '28/05/2026', status: 'Observado' },
    { id: '3', name: 'Informe_2025.pdf', date: '25/05/2026', status: 'Pendiente' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Validado':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">Validado</span>;
      case 'Observado':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700">Observado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">Pendiente</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Dashboard General</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Período 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-[#2563eb] space-y-2">
          <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest leading-none">Subidas</span>
          <h3 className="text-2xl font-black text-[#0f172a]">{stats.uploaded}</h3>
        </div>
        <div className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-slate-400 space-y-2">
          <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest leading-none">Pendientes</span>
          <h3 className="text-2xl font-black text-slate-600">{stats.pending}</h3>
        </div>
        <div className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-[#15803d] space-y-2">
          <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest leading-none">Validadas</span>
          <h3 className="text-2xl font-black text-[#15803d]">{stats.validated}</h3>
        </div>
        <div className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-[#dc2626] space-y-2">
          <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest leading-none">Observadas</span>
          <h3 className="text-2xl font-black text-[#dc2626]">{stats.observed}</h3>
        </div>
      </div>

      <div className="premium-card bg-white p-6 rounded-lg space-y-4">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
          <span className="text-[#64748b]">Progreso General de mis Entregas</span>
          <span className="text-[#2563eb]">50%</span>
        </div>
        <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div className="h-full bg-[#2563eb] transition-all duration-700" style={{ width: '50%' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card bg-white rounded-lg overflow-hidden border border-[#e2e8f0]">
          <div className="p-6 border-b border-[#f1f5f9] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Actividades Pendientes</h3>
            </div>
            <button onClick={onViewAllActivities} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Ver todas</button>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-600 font-medium">Tienes 3 tareas pendientes de entrega. Revisa la pestaña de Actividades.</p>
          </div>
        </div>

        <div className="premium-card bg-white rounded-lg overflow-hidden border border-[#e2e8f0]">
          <div className="p-6 border-b border-[#f1f5f9] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#2563eb]" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Archivos Recientes</h3>
            </div>
            <button onClick={onViewAllFiles} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Ver todos</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentFiles.map(file => (
              <div key={file.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{file.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{file.date}</p>
                  </div>
                </div>
                {getStatusBadge(file.status)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
