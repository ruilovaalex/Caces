import React from 'react';
import { CheckCircle2, Download, FileCheck2, FileSpreadsheet, ListChecks } from 'lucide-react';
import { Indicator, OfficialFormat, Requirement } from '../../types';
import { OfficialFormatContentService } from '../../services/officialFormatContentService';
import { OfficialFormatService } from '../../services/officialFormatService';
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
  const officialFormats = OfficialFormatService.getFormatsByEvidence(indicator.code, requirement.id);

  const handleDownloadFormat = async (format: OfficialFormat) => {
    const blob = await OfficialFormatContentService.get(format.id);
    if (!blob) {
      window.alert('No se encontro el archivo local de este formato.');
      return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = format.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
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
            Formato permitido: {guide.allowedFormat}
          </span>
        </div>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-blue-600" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Que debe preparar</h4>
          </div>
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-slate-700">
            {guide.whatToPrepare}
          </p>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Contenido minimo</h4>
          </div>
          <div className="space-y-2">
            {guide.minimumContent.map(item => (
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
            {guide.suggestedSupports.map(item => (
              <li key={item} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Formatos oficiales asociados</h4>
          </div>
          {officialFormats.length > 0 ? (
            <div className="space-y-2">
              {officialFormats.map(format => (
                <div key={format.id} className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
                  <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-700" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-800">{format.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{format.fileName} - {format.fileSize}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadFormat(format)}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-400">
              Sin formatos oficiales asociados.
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
};
