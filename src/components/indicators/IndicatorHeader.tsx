import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Indicator, Status } from '../../types';
import { EvidenceStatusBadge as StatusBadge } from '../evidences/EvidenceStatusBadge';

interface IndicatorHeaderProps {
  indicator: Indicator;
  status: Status;
  onBackToDashboard: () => void;
}

export const IndicatorHeader = ({
  indicator,
  status,
  onBackToDashboard
}: IndicatorHeaderProps) => {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-5">
      <div className="flex items-start gap-4">
        <button
          onClick={onBackToDashboard}
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          title="Volver al repositorio"
          aria-label="Volver al repositorio"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1e2d4a] text-white">
          <FileText className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Indicador {indicator.code}
            </span>
            <StatusBadge status={status} />
          </div>
          <h2 className="mt-1 text-xl font-black leading-tight text-slate-900">
            {indicator.name}
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-500">
            {indicator.description}
          </p>
        </div>
      </div>
    </header>
  );
};
