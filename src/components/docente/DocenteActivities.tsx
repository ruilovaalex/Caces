import React from 'react';
import { motion } from 'motion/react';
import { Upload, Smartphone, Wand2, CheckCircle2 } from 'lucide-react';
import {
  fadeInUp, staggerContainer, easeOut, hoverScale, hoverLift, tapScale,
} from '../../utils/animations';

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
    const isUrgent = days <= 2;
    const badgeClass = days <= 2
      ? 'bg-rose-100 text-rose-700'
      : days <= 7
        ? 'bg-amber-100 text-amber-700'
        : 'bg-emerald-100 text-emerald-700';
    const text = days <= 2 ? `¡Urgente! (${days} días)` : `Quedan ${days} días`;

    return (
      <motion.span
        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${badgeClass}`}
        {...(isUrgent ? {
          animate: { scale: [1, 1.08, 1] },
          transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
        } : {})}
      >
        {text}
      </motion.span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Actividades Asignadas</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Tareas requeridas por coordinación</p>
      </motion.div>

      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {pendingTasks.map((task, i) => (
          <motion.div
            key={task.id}
            variants={fadeInUp}
            transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.1 }}
            whileHover={hoverLift}
            className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-amber-500 cursor-default"
          >
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
              <motion.button 
                whileHover={hoverScale}
                whileTap={tapScale}
                onClick={onOpenUploadModal}
                className="evidence-btn inline-flex items-center gap-2 !px-3 !py-2 bg-[#2563eb] !text-white border-none hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Subir Archivo
              </motion.button>
              <motion.button 
                whileHover={hoverScale}
                whileTap={tapScale}
                onClick={onOpenUploadModal}
                className="evidence-btn inline-flex items-center gap-2 !px-3 !py-2 bg-slate-800 !text-white border-none hover:bg-slate-900"
              >
                <Smartphone className="w-4 h-4" />
                Escanear
              </motion.button>
              <motion.button 
                whileHover={hoverScale}
                whileTap={tapScale}
                onClick={onOpenUploadModal}
                className="evidence-btn inline-flex items-center gap-2 !px-3 !py-2 bg-emerald-600 !text-white border-none hover:bg-emerald-700"
              >
                <Wand2 className="w-4 h-4" />
                Generar con IA
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
      >
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Tareas Completadas
        </h3>
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {completedTasks.map((task, i) => (
            <motion.div
              key={task.id}
              variants={fadeInUp}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.6 + i * 0.08 }}
              className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between opacity-70"
            >
              <div>
                <p className="text-sm font-bold text-slate-700 line-through decoration-slate-300">{task.title}</p>
                <p className="text-xs text-slate-400 mt-1">{task.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">Completado</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.date}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
