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
    <section className="premium-hero border border-white/10 rounded-2xl shadow-[0_18px_40px_-26px_rgba(15,23,42,0.8)] p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#2563eb] text-white flex items-center justify-center shrink-0">
            <CurrentIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#aac4e8]">{current.label}</p>
            <h2 className="text-base font-black text-white tracking-tight">{current.title}</h2>
            <p className="mt-1 text-xs text-white/60 leading-relaxed">{current.detail}</p>
            <p className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-white">
              <ArrowRight className="h-3.5 w-3.5 text-[#22c55e]" />
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
                  step.id === activeStep ? 'bg-[#2563eb] text-white' : 'bg-white/10 text-[#aac4e8]'
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
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15"
              >
                Repositorio
              </button>
            )}
            {canManageAssignments && onOpenAssignments && (
              <button
                onClick={onOpenAssignments}
                className="rounded-lg bg-[#2563eb] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700"
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
