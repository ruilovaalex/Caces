import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Indicator, Status } from '../../types';
import { EvidenceStatusBadge as StatusBadge } from '../evidences/EvidenceStatusBadge';
import { IndicatorProgress } from './IndicatorProgress';

interface IndicatorHeaderProps {
  indicator: Indicator;
  status: Status;
  progress: number;
  onBackToDashboard: () => void;
}

export const IndicatorHeader = ({
  indicator,
  status,
  progress,
  onBackToDashboard
}: IndicatorHeaderProps) => {
  return (
    <div className="indicator-card p-8 border-b border-[#e2e8f0] flex justify-between items-start">
      <div className="flex gap-6">
        <div className="w-16 h-16 bg-[#1e2d4a] rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-slate-900/10">
          {indicator.code}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <StatusBadge status={status} />
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Criterio {indicator.code.split('.')[0]}</span>
          </div>
          <h2 className="text-2xl font-black text-[#0f172a] tracking-tight leading-tight">
            {indicator.name}
          </h2>
          <p className="text-[#64748b] text-sm mt-2 max-w-2xl leading-relaxed">
            {indicator.description}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f4f6f9] transition-all shadow-sm"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Volver al Dashboard
        </button>
        <div className="w-48">
          <IndicatorProgress
            progress={progress}
            label="Progreso Real"
            showValue={true}
          />
        </div>
      </div>
    </div>
  );
};
