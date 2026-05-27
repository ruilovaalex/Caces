import React from 'react';
import { ClipboardList, Pause, Play, Plus } from 'lucide-react';
import { WorkflowGuide } from '../layout/WorkflowGuide';

const assignmentStages = [
  {
    label: 'Crear',
    icon: Plus,
    className: 'text-slate-700 bg-white border-slate-200 hover:border-slate-300'
  },
  {
    label: 'Pausa',
    icon: Pause,
    className: 'text-amber-700 bg-white border-amber-100 hover:border-amber-200'
  },
  {
    label: 'Progreso',
    icon: Play,
    className: 'text-blue-700 bg-white border-blue-100 hover:border-blue-200'
  }
];

export const AssignmentsView = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <WorkflowGuide activeStep="assignments" />

      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700 border border-emerald-100">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Asignaciones</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Apartado pendiente de definir
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assignmentStages.map(stage => {
          const StageIcon = stage.icon;

          return (
            <button
              key={stage.label}
              type="button"
              className={`h-28 rounded-lg border p-5 text-left transition-colors ${stage.className}`}
              aria-label={stage.label}
            >
              <StageIcon className="h-5 w-5" />
              <span className="mt-4 block text-sm font-black uppercase tracking-widest">{stage.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
