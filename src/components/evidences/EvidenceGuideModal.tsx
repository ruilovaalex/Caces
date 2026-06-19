import React, { useMemo } from 'react';
import { CheckCircle2, Download, FileCheck2, FileText, ListChecks } from 'lucide-react';
import { Indicator, PublishedTemplate, Requirement, Template } from '../../types';
import { TEMPLATES } from '../../data/templates';
import { useTemplateLibrary } from '../../hooks/useTemplateLibrary';
import { TemplateService } from '../../services/templateService';
import { buildRequirementWorkGuide } from '../../utils/workGuideUtils';
import { Modal } from '../common/Modal';

interface EvidenceGuideModalProps {
  isOpen: boolean;
  indicator: Indicator;
  requirement: Requirement | null;
  onClose: () => void;
}

const TEMPLATE_GROUPS: Record<string, string[]> = {
  normativa: ['documento', 'acta', 'oficio'],
  planificacion: ['plan', 'cronograma', 'matriz'],
  informe: ['informe', 'matriz', 'registro'],
  matriz: ['matriz', 'registro', 'evidencia'],
  visual: ['evidencia', 'registro', 'informe'],
  socializacion: ['acta', 'registro', 'oficio'],
  general: ['documento', 'registro', 'evidencia'],
};

export const EvidenceGuideModal = ({
  isOpen,
  indicator,
  requirement,
  onClose,
}: EvidenceGuideModalProps) => {
  if (!requirement) return null;

  const guide = buildRequirementWorkGuide(indicator, requirement);
  const { customTemplates } = useTemplateLibrary();
  const suggestedTemplates = useMemo(() => {
    const text = `${requirement.label} ${requirement.description}`.toLowerCase();

    const groupKey = text.includes('normativa') || text.includes('reglamento') || text.includes('politica') || text.includes('procedimiento')
      ? 'normativa'
      : text.includes('plan') || text.includes('poa') || text.includes('pedi') || text.includes('cronograma')
        ? 'planificacion'
        : text.includes('informe') || text.includes('seguimiento') || text.includes('evaluacion') || text.includes('resultados')
          ? 'informe'
          : text.includes('matriz') || text.includes('listado') || text.includes('nomina') || text.includes('inventario')
            ? 'matriz'
            : text.includes('fotografia') || text.includes('captura') || text.includes('video') || text.includes('planos')
              ? 'visual'
              : text.includes('acta') || text.includes('convocatoria') || text.includes('asistencia') || text.includes('socializacion')
                ? 'socializacion'
                : 'general';

    const baseTemplates = TEMPLATE_GROUPS[groupKey]
      .map(templateId => TEMPLATES.find(template => template.id === templateId))
      .filter((template): template is Template => Boolean(template));

    const publishedTemplates = customTemplates.filter(template =>
      template.indicatorCode === indicator.code &&
      template.requirementId === requirement.id
    );

    return [...publishedTemplates, ...baseTemplates]
      .filter((template, index, collection) => collection.findIndex(item => item.id === template.id) === index)
      .slice(0, 3);
  }, [customTemplates, indicator.code, requirement.description, requirement.id, requirement.label]);

  const handleDownload = async (template: Template | PublishedTemplate) => {
    await TemplateService.downloadTemplate(template);
  };

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
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Plantillas sugeridas para esta evidencia</h4>
              <p className="mt-1 text-xs text-slate-500">
                Descarga una base editable para preparar este respaldo con una estructura inicial.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
              {suggestedTemplates.length} sugeridas
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {suggestedTemplates.map(template => (
              <article key={template.id} className="flex min-h-[172px] flex-col rounded-xl border border-slate-200 bg-white p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  'source' in template && template.source === 'admin'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  <FileText className="h-4 w-4" />
                </div>
                <h5 className="mt-4 text-sm font-black text-slate-900">{template.label}</h5>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500">{template.description}</p>
                {'source' in template && template.source === 'admin' && (
                  <span className="mt-3 inline-flex self-start rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    Publicada por admin
                  </span>
                )}
                <button
                  onClick={() => void handleDownload(template)}
                  className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-700 transition-colors hover:bg-blue-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar plantilla
                </button>
              </article>
            ))}
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {guide.supports.map(item => (
              <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
};
