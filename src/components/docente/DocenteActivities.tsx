import React, { useState } from 'react';
import { Upload, Smartphone, Wand2, CheckCircle2, Clock } from 'lucide-react';

interface DocenteActivitiesProps {
  onOpenUploadModal: () => void;
}

export const DocenteActivities = ({ onOpenUploadModal }: DocenteActivitiesProps) => {
  const pendingTasks = [
    { id: '1', title: 'Subir título de cuarto nivel', description: 'Copia certificada del título registrado en SENESCYT.', daysLeft: 2, status: 'Pendiente' },
    { id: '2', title: 'Syllabus período 2025', description: 'Documento oficial firmado por dirección de carrera.', daysLeft: 6, status: 'Pendiente' },
    { id: '3', title: 'Certificado de capacitación docente', description: 'Certificado de al menos 40 horas de formación continua.', daysLeft: 10, status: 'Pendiente' }
  ];

  const completedTasks = [
    { id: '4', title: 'Acta de compromiso institucional', description: 'Documento firmado al inicio del semestre.', date: '15/05/2026', status: 'Completado' }
  ];

  const getUrgencyBadge = (days: number) => {
    if (days <= 2) return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700">¡Urgente! ({days} días)</span>;
    if (days <= 7) return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">Quedan {days} días</span>;
    return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">Quedan {days} días</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Actividades Asignadas</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Tareas requeridas por coordinación</p>
      </div>

      <div className="space-y-4">
        {pendingTasks.map(task => (
          <div key={task.id} className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-amber-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-black text-slate-800 tracking-tight">{task.title}</h3>
                  {getUrgencyBadge(task.daysLeft)}
                </div>
                <p className="text-xs text-slate-500">{task.description}</p>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button 
                onClick={onOpenUploadModal}
                className="evidence-btn inline-flex items-center gap-2 !px-3 !py-2 bg-[#2563eb] !text-white border-none hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Subir Archivo
              </button>
              <button 
                onClick={onOpenUploadModal}
                className="evidence-btn inline-flex items-center gap-2 !px-3 !py-2 bg-slate-800 !text-white border-none hover:bg-slate-900"
              >
                <Smartphone className="w-4 h-4" />
                Escanear
              </button>
              <button 
                onClick={onOpenUploadModal}
                className="evidence-btn inline-flex items-center gap-2 !px-3 !py-2 bg-emerald-600 !text-white border-none hover:bg-emerald-700"
              >
                <Wand2 className="w-4 h-4" />
                Generar con IA
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Tareas Completadas
        </h3>
        <div className="space-y-3">
          {completedTasks.map(task => (
            <div key={task.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between opacity-70">
              <div>
                <p className="text-sm font-bold text-slate-700 line-through decoration-slate-300">{task.title}</p>
                <p className="text-xs text-slate-400 mt-1">{task.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">Completado</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
