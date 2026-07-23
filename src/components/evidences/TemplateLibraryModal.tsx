import React, { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Search, Sparkles, Star } from 'lucide-react';
import { MOCK_DATA } from '../../data/cacesMockData';
import { TEMPLATES } from '../../data/templates';
import { OfficialFormat } from '../../types';
import { OfficialFormatContentService } from '../../services/officialFormatContentService';
import { OfficialFormatService } from '../../services/officialFormatService';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  {
    id: 'criterio-1',
    label: MOCK_DATA[0].criteria[0].name,
    shortLabel: 'C1 ORGANIZACION',
    description: 'Plantillas para planificacion, seguimiento institucional, actas, informes y soporte de gestion.',
    templateIds: ['acta', 'informe', 'registro', 'oficio', 'documento'],
  },
  {
    id: 'criterio-2',
    label: MOCK_DATA[0].criteria[1].name,
    shortLabel: 'C2 INFRAESTRUCTURA',
    description: 'Modelos para constataciones, reportes, matrices y evidencias de recursos fisicos y tecnologicos.',
    templateIds: ['informe', 'registro', 'matriz', 'evidencia', 'oficio'],
  },
  {
    id: 'criterio-3',
    label: MOCK_DATA[0].criteria[2].name,
    shortLabel: 'C3 PROFESORES',
    description: 'Formatos para seguimiento docente, certificaciones, planes, registros y control de actividades.',
    templateIds: ['informe', 'registro', 'evidencia', 'certificado', 'matriz'],
  },
  {
    id: 'criterio-4',
    label: MOCK_DATA[0].criteria[3].name,
    shortLabel: 'C4 DOCENCIA',
    description: 'Plantillas para programas, actas, evidencias de clase, cronogramas y seguimiento academico.',
    templateIds: ['plan', 'acta', 'registro', 'evidencia', 'cronograma'],
  },
  {
    id: 'criterio-5',
    label: MOCK_DATA[0].criteria[4].name,
    shortLabel: 'C5 INVESTIGACION',
    description: 'Apoyos para proyectos, productos, seguimiento y respaldo de resultados.',
    templateIds: ['plan', 'informe', 'evidencia', 'matriz', 'certificado'],
  },
  {
    id: 'criterio-6',
    label: MOCK_DATA[0].criteria[5].name,
    shortLabel: 'C6 VINCULACION',
    description: 'Modelos para convenios, actas, informes, evidencias y relacion con actores externos.',
    templateIds: ['convenio', 'acta', 'informe', 'evidencia', 'oficio'],
  },
] as const;

const featuredIds = ['acta', 'informe', 'registro', 'plan'];

const downloadStaticTemplate = (templateId: string) => {
  const template = TEMPLATES.find(item => item.id === templateId);
  if (!template) return;

  const content = [
    `PLANTILLA INSTITUCIONAL: ${template.label.toUpperCase()}`,
    '',
    template.description,
    '',
    '1. Datos generales',
    '2. Objetivo',
    '3. Desarrollo',
    '4. Resultados o acuerdos',
    '5. Responsables y fechas',
    '6. Firmas y anexos',
  ].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `plantilla-${template.id}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
};

const downloadOfficialFormat = async (format: OfficialFormat, onMissing: () => void) => {
  const blob = await OfficialFormatContentService.get(format.id);
  if (!blob) {
    onMissing();
    return;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = format.fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const TemplateLibraryModal = ({
  isOpen,
  onClose,
}: TemplateLibraryModalProps) => {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const officialFormats = OfficialFormatService.getActive();

  const activeCategoryData = categories.find(category => category.id === activeCategory);

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return TEMPLATES.filter(template => {
      const matchesCategory = !activeCategoryData || activeCategoryData.templateIds.includes(template.id as never);
      const matchesQuery =
        !normalizedQuery ||
        template.label.toLowerCase().includes(normalizedQuery) ||
        template.description.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategoryData, query]);

  const filteredFormats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return officialFormats;

    return officialFormats.filter(format =>
      format.title.toLowerCase().includes(normalizedQuery) ||
      format.description.toLowerCase().includes(normalizedQuery) ||
      format.fileName.toLowerCase().includes(normalizedQuery)
    );
  }, [officialFormats, query]);

  const featuredTemplates = TEMPLATES.filter(template => featuredIds.includes(template.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Biblioteca de formatos y plantillas" maxWidth="max-w-6xl">
      <div className="space-y-7 border-t border-slate-100 bg-slate-50 p-7">
        <div className="flex flex-col gap-3">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar un formato o plantilla"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-400"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Todas" active={activeCategory === ''} onClick={() => setActiveCategory('')} />
            {categories.map(category => (
              <FilterChip
                key={category.id}
                label={category.shortLabel}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Formatos oficiales locales</h3>
          </div>
          {filteredFormats.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredFormats.map(format => (
                <OfficialFormatCard key={format.id} format={format} onDownload={format => downloadOfficialFormat(format, () => showToast('No se encontró el archivo local de este formato.', 'error'))} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-400">
              No hay formatos oficiales locales disponibles.
            </div>
          )}
        </section>

        {!query && activeCategory === '' && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Plantillas sugeridas mas utilizadas</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {featuredTemplates.map(template => (
                <TemplateCard key={template.id} template={template} onDownload={downloadStaticTemplate} featured />
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-700">Plantillas sugeridas por criterio</h3>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  activeCategory === category.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <FileSpreadsheet className={`h-5 w-5 ${
                  activeCategory === category.id ? 'text-blue-700' : 'text-blue-600'
                }`} />
                <p className="mt-3 text-sm font-black text-slate-700">{category.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{category.description}</p>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-600">
                  {category.templateIds.length} plantillas sugeridas
                </p>
              </button>
            ))}
          </div>
        </section>

        {activeCategoryData ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">{activeCategoryData.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{activeCategoryData.description}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                {filteredTemplates.length} plantillas visibles
              </div>
            </div>

            {filteredTemplates.length > 0 ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredTemplates.map(template => (
                  <TemplateCard key={template.id} template={template} onDownload={downloadStaticTemplate} />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm font-semibold text-slate-400">
                No se encontraron plantillas con esos filtros.
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-bold text-slate-600">Selecciona un criterio para ver sus plantillas sugeridas.</p>
            <p className="mt-2 text-xs text-slate-400">Los formatos oficiales locales se muestran arriba.</p>
          </section>
        )}
      </div>
    </Modal>
  );
};

const FilterChip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
      active
        ? 'bg-[#2563eb] text-white shadow-md shadow-blue-600/20'
        : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

const OfficialFormatCard = ({ format, onDownload }: { format: OfficialFormat; onDownload: (format: OfficialFormat) => void }) => (
  <article className="flex min-h-[150px] flex-col rounded-lg border border-emerald-100 bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <FileSpreadsheet className="h-4 w-4" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Oficial</span>
    </div>
    <h4 className="mt-3 text-sm font-black text-slate-800">{format.title}</h4>
    <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{format.description}</p>
    <p className="mt-2 text-[10px] font-bold text-slate-400">{format.fileName}</p>
    <button
      onClick={() => onDownload(format)}
      className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:text-emerald-900"
    >
      <Download className="h-3.5 w-3.5" />
      Descargar formato
    </button>
  </article>
);

interface TemplateCardProps {
  template: (typeof TEMPLATES)[number];
  onDownload: (templateId: string) => void;
  featured?: boolean;
}

const TemplateCard = ({ template, onDownload, featured = false }: TemplateCardProps) => (
  <article className="flex min-h-[150px] flex-col rounded-lg border border-slate-200 bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${featured ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
        <FileText className="h-4 w-4" />
      </div>
      {featured && <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Frecuente</span>}
    </div>
    <h4 className="mt-3 text-sm font-black text-slate-800">{template.label}</h4>
    <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{template.description}</p>
    <button
      onClick={() => onDownload(template.id)}
      className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800"
    >
      <Download className="h-3.5 w-3.5" />
      Descargar base
    </button>
  </article>
);
