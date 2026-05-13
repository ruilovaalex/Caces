import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Indicator } from '../../types';
import { EvidenceStatusBadge as StatusBadge } from '../evidences/EvidenceStatusBadge';

import { IndicatorProgress } from './IndicatorProgress';

interface IndicatorHeaderProps {
  indicator: Indicator;
  progress: number;
  onBackToDashboard: () => void;
}

export const IndicatorHeader = ({
  indicator,
  progress,
  onBackToDashboard
}: IndicatorHeaderProps) => {
  return (
    <div className="indicator-card p-8 border-b border-slate-100 flex justify-between items-start">
      <div className="flex gap-6">
        <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-slate-900/10">
          {indicator.code}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <StatusBadge status={indicator.status} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criterio {indicator.code.split('.')[0]}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
            {indicator.name}
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-2xl leading-relaxed">
            {indicator.description}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <button 
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
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
