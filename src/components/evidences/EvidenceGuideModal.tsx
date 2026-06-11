import React from 'react';
import { CheckCircle2, FileCheck2, ListChecks, Lightbulb, AlertTriangle, ListOrdered, ShieldAlert } from 'lucide-react';
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
    <Modal isOpen={isOpen} onClose={onClose} title="Guía para subir la evidencia" maxWidth="max-w-4xl">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Enfoque principal</h4>
              </div>
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-slate-700">
                {guide.focus}
              </p>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Contenido mínimo indispensable</h4>
              </div>
              <div className="space-y-2">
                {guide.checks.map(item => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-700">Formatos y soportes</h4>
              <ul className="grid gap-2">
                {guide.supports.map(item => (
                  <li key={item} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Pasos sugeridos</h4>
              </div>
              <div className="space-y-3">
                {guide.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 bg-white">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-700">
                      {idx + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            {guide.tips.length > 0 && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-amber-900">Tips para la evaluación</h4>
                </div>
                <ul className="space-y-2">
                  {guide.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm leading-relaxed text-amber-800 flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-400 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {guide.warnings.length > 0 && (
              <section className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-rose-900">Advertencias críticas</h4>
                </div>
                <ul className="space-y-2">
                  {guide.warnings.map((warn, idx) => (
                    <li key={idx} className="text-sm leading-relaxed text-rose-800 flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-rose-400 shrink-0" />
                      {warn}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
