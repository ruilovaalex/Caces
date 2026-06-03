import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, FileText } from 'lucide-react';
import {
  fadeInUp, fadeInRight, staggerContainer, easeOut, easeOutFast, hoverScale, tapScale,
} from '../../utils/animations';

interface DocenteDashboardProps {
  onViewAllFiles: () => void;
  onViewAllActivities: () => void;
}

// Animated counter hook
const useCountUp = (target: number, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
};

export const DocenteDashboard = ({ onViewAllFiles, onViewAllActivities }: DocenteDashboardProps) => {
  const stats = {
    uploaded: 3,
    pending: 3,
    validated: 1,
    observed: 1
  };

  const uploadedCount = useCountUp(stats.uploaded);
  const pendingCount = useCountUp(stats.pending);
  const validatedCount = useCountUp(stats.validated);
  const observedCount = useCountUp(stats.observed);

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

  const statCards = [
    { label: 'Subidas', value: uploadedCount, color: 'border-l-[#2563eb]', textColor: 'text-[#0f172a]' },
    { label: 'Pendientes', value: pendingCount, color: 'border-l-slate-400', textColor: 'text-slate-600' },
    { label: 'Validadas', value: validatedCount, color: 'border-l-[#15803d]', textColor: 'text-[#15803d]' },
    { label: 'Observadas', value: observedCount, color: 'border-l-[#dc2626]', textColor: 'text-[#dc2626]' },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Dashboard General</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Período 2025</p>
      </motion.div>

      {/* Stat cards with staggered fade-in from below */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={fadeInUp}
            transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.1 }}
            className={`premium-card bg-white p-5 rounded-lg border-l-4 ${card.color} space-y-2`}
          >
            <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest leading-none">{card.label}</span>
            <h3 className={`text-2xl font-black ${card.textColor}`}>{card.value}</h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Animated progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }}
        className="premium-card bg-white p-6 rounded-lg space-y-4"
      >
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
          <span className="text-[#64748b]">Progreso General de mis Entregas</span>
          <span className="text-[#2563eb]">50%</span>
        </div>
        <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#2563eb] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '50%' }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Bottom cards entering from the right */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={fadeInRight}
          transition={easeOut}
          whileHover={hoverScale}
          className="premium-card bg-white rounded-lg overflow-hidden border border-[#e2e8f0]"
        >
          <div className="p-6 border-b border-[#f1f5f9] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Actividades Pendientes</h3>
            </div>
            <motion.button
              whileHover={hoverScale}
              whileTap={tapScale}
              onClick={onViewAllActivities}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              Ver todas
            </motion.button>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-600 font-medium">Tienes 3 tareas pendientes de entrega. Revisa la pestaña de Actividades.</p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInRight}
          transition={{ ...easeOut, delay: 0.1 }}
          whileHover={hoverScale}
          className="premium-card bg-white rounded-lg overflow-hidden border border-[#e2e8f0]"
        >
          <div className="p-6 border-b border-[#f1f5f9] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#2563eb]" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Archivos Recientes</h3>
            </div>
            <motion.button
              whileHover={hoverScale}
              whileTap={tapScale}
              onClick={onViewAllFiles}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              Ver todos
            </motion.button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentFiles.map((file, i) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.6 + i * 0.08 }}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
