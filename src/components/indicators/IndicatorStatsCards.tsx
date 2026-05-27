import React from 'react';

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
  return (
    <div className="px-8 py-6 bg-[#f4f6f9] border-b border-[#e2e8f0] grid grid-cols-5 gap-4">
      <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm text-center">
        <p className="text-[9px] font-black text-[#64748b] uppercase mb-1">Total</p>
        <p className="text-lg font-black text-[#0f172a]">{stats.total}</p>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm text-center">
        <p className="text-[9px] font-black text-[#64748b] uppercase mb-1">Cargadas</p>
        <p className="text-lg font-black text-[#2563eb]">{stats.loaded}</p>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm text-center">
        <p className="text-[9px] font-black text-[#64748b] uppercase mb-1">Validadas</p>
        <p className="text-lg font-black text-[#15803d]">{stats.valid}</p>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm text-center">
        <p className="text-[9px] font-black text-[#64748b] uppercase mb-1">Observadas</p>
        <p className="text-lg font-black text-[#dc2626]">{stats.observed}</p>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm text-center text-[#d97706]">
          <p className="text-[9px] font-black text-[#64748b] uppercase mb-1">Pendientes</p>
          <p className="text-lg font-black">{stats.pending}</p>
      </div>
    </div>
  );
};
