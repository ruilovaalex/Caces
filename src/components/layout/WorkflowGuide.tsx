import React from 'react';
import { ArrowRight, ClipboardCheck, ClipboardList, FolderTree, UploadCloud } from 'lucide-react';

interface WorkflowGuideProps {
  activeStep: 'repository' | 'assignments' | 'evidence' | 'review';
  canManageAssignments?: boolean;
  onOpenRepository?: () => void;
  onOpenAssignments?: () => void;
}

const steps = {
  repository: {
    label: 'Paso 1',
    title: 'Repositorio',
    detail: 'Busca el indicador dentro del modelo CACES.',
    next: 'Abre un indicador o crea una asignacion.',
    icon: FolderTree
  },
  assignments: {
    label: 'Paso 2',
    title: 'Asignaciones',
    detail: 'Define quien prepara cada evidencia y para que fecha.',
    next: 'Abre la evidencia asignada para prepararla.',
    icon: ClipboardList
  },
  evidence: {
    label: 'Paso 3',
    title: 'Evidencia',
    detail: 'Prepara el documento, revisa el formato y sube la version final.',
    next: 'Cuando este cargada, pasa a revision.',
    icon: UploadCloud
  },
  review: {
    label: 'Paso 4',
    title: 'Revision',
    detail: 'Evalua pertinencia, completitud y soporte documental.',
    next: 'Valida, observa o rechaza la evidencia.',
    icon: ClipboardCheck
  }
} as const;

const stepOrder = [
  {
    id: 'repository',
    title: 'Repositorio'
  },
  {
    id: 'assignments',
    title: 'Asignar'
  },
  {
    id: 'evidence',
    title: 'Evidencia'
  },
  {
    id: 'review',
    title: 'Revisar'
  }
] as const;

export const WorkflowGuide = ({
  activeStep,
  canManageAssignments = false,
  onOpenRepository,
  onOpenAssignments
}: WorkflowGuideProps) => {
  const current = steps[activeStep];
  const CurrentIcon = current.icon;

  return (
    <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <CurrentIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">{current.label}</p>
            <h2 className="text-base font-black text-slate-800 tracking-tight">{current.title}</h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{current.detail}</p>
            <p className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-slate-700">
              <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
              {current.next}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap gap-1.5">
            {stepOrder.map((step, index) => (
              <span
                key={step.id}
                className={`rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                  step.id === activeStep ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {index + 1}. {step.title}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {onOpenRepository && (
              <button
                onClick={onOpenRepository}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-300 hover:text-blue-700"
              >
                Repositorio
              </button>
            )}
            {canManageAssignments && onOpenAssignments && (
              <button
                onClick={onOpenAssignments}
                className="rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800"
              >
                Asignar evidencia
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
