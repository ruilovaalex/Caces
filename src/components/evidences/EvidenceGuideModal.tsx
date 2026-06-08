import React from 'react';
import { CheckCircle2, FileCheck2, ListChecks } from 'lucide-react';
import { Indicator, Requirement } from '../../types';
import { buildRequirementWorkGuide } from '../../utils/workGuideUtils';
import { Modal } from '../common/Modal';

interface EvidenceGuideModalProps {
  isOpen: boolean;
  indicator: Indicator;
  requirement: Requirement | null;
  onClose: () => void;
}

export const EvidenceGuideModal = ({
  isOpen,
  indicator,
  requirement,
  onClose,
}: EvidenceGuideModalProps) => {
  if (!requirement) return null;

  const guide = buildRequirementWorkGuide(indicator, requirement);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guia para subir la evidencia" maxWidth="max-w-3xl">
      <div className="space-y-6 border-t border-slate-100 bg-white p-7">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
            Indicador {indicator.code}
          </p>
          <h3 className="mt-2 text-lg font-black text-slate-900">{requirement.label}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{requirement.description}</p>
          <span className="mt-4 inline-flex rounded-md bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 ring-1 ring-blue-100">
            Formato permitido: {guide.format}
          </span>
        </div>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-blue-600" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Que debe preparar</h4>
          </div>
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-slate-700">
            {guide.focus}
          </p>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Contenido minimo</h4>
          </div>
          <div className="space-y-2">
            {guide.checks.map(item => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-sm leading-relaxed text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-700">Archivos de respaldo sugeridos</h4>
          <ul className="grid gap-2 md:grid-cols-2">
            {guide.supports.map(item => (
              <li key={item} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  );
};
