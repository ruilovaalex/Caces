import React from 'react';
import { motion } from 'motion/react';
import { staggerContainer, fadeInUp, useCountUp } from '../../utils/animations';

interface IndicatorStatsCardsProps {
  stats: {
    total: number;
    valid: number;
    loaded: number;
    observed: number;
    rejected: number;
    pending: number;
  };
}

export const IndicatorStatsCards = ({ stats }: IndicatorStatsCardsProps) => {
  const totalCount = useCountUp(stats.total);
  const validCount = useCountUp(stats.valid);
  const loadedCount = useCountUp(stats.loaded);
  const observedCount = useCountUp(stats.observed);
  const pendingCount = useCountUp(stats.pending);

  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      className="px-8 py-6 bg-[#f4f6f9] border-b border-[#e2e8f0] grid grid-cols-5 gap-4"
    >
      <motion.div variants={fadeInUp} className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm text-center">
        <p className="text-[9px] font-black text-[#64748b] uppercase mb-1">Total</p>
        <p className="text-lg font-black text-[#0f172a]">{totalCount}</p>
      </motion.div>
      <motion.div variants={fadeInUp} className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm text-center">
        <p className="text-[9px] font-black text-[#64748b] uppercase mb-1">Cargadas</p>
        <p className="text-lg font-black text-[#2563eb]">{loadedCount}</p>
      </motion.div>
      <motion.div variants={fadeInUp} className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm text-center">
        <p className="text-[9px] font-black text-[#64748b] uppercase mb-1">Validadas</p>
        <p className="text-lg font-black text-[#15803d]">{validCount}</p>
      </motion.div>
      <motion.div variants={fadeInUp} className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm text-center">
        <p className="text-[9px] font-black text-[#64748b] uppercase mb-1">Observadas</p>
        <p className="text-lg font-black text-[#dc2626]">{observedCount}</p>
      </motion.div>
      <motion.div variants={fadeInUp} className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm text-center text-[#d97706]">
          <p className="text-[9px] font-black text-[#64748b] uppercase mb-1">Pendientes</p>
          <p className="text-lg font-black">{pendingCount}</p>
      </motion.div>
    </motion.div>
  );
};
