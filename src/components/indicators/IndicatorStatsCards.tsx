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
    <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-5 gap-4">
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total</p>
        <p className="text-lg font-black text-slate-700">{stats.total}</p>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Cargadas</p>
        <p className="text-lg font-black text-blue-600">{stats.loaded}</p>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Validadas</p>
        <p className="text-lg font-black text-emerald-600">{stats.valid}</p>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Observadas</p>
        <p className="text-lg font-black text-amber-500">{stats.observed}</p>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center text-rose-600">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pendientes</p>
          <p className="text-lg font-black">{stats.pending}</p>
      </div>
    </div>
  );
};
