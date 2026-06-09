import React, { useMemo, useState } from 'react';
import {
  Blocks,
  Download,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
import { TEMPLATES } from '../../data/templates';

const categories = [
  {
    id: 'criterio-1',
    label: 'Criterio 1: Organizacion',
    chipLabel: 'C1 Organizacion',
    description: 'Plantillas para planificacion, seguimiento institucional, actas, informes y soporte de gestion.',
    templateIds: ['acta', 'informe', 'registro', 'oficio', 'documento'],
  },
  {
    id: 'criterio-2',
    label: 'Criterio 2: Infraestructura',
    chipLabel: 'C2 Infraestructura',
    description: 'Modelos para constataciones, reportes, matrices y evidencias de recursos fisicos y tecnologicos.',
    templateIds: ['informe', 'registro', 'matriz', 'evidencia', 'oficio'],
  },
  {
    id: 'criterio-3',
    label: 'Criterio 3: Profesores',
    chipLabel: 'C3 Profesores',
    description: 'Formatos para seguimiento docente, certificaciones, planes, registros y control de actividades.',
    templateIds: ['informe', 'registro', 'evidencia', 'certificado', 'matriz'],
  },
  {
    id: 'criterio-4',
    label: 'Criterio 4: Docencia',
    chipLabel: 'C4 Docencia',
    description: 'Plantillas para programas, actas, evidencias de clase, cronogramas y seguimiento academico.',
    templateIds: ['plan', 'acta', 'registro', 'evidencia', 'cronograma'],
  },
  {
    id: 'criterio-5',
    label: 'Criterio 5: Investigacion + Desarrollo e Innovacion',
    chipLabel: 'C5 Investigacion',
    description: 'Apoyos para proyectos, productos, seguimiento y respaldo de resultados.',
    templateIds: ['plan', 'informe', 'evidencia', 'matriz', 'certificado'],
  },
  {
    id: 'criterio-6',
    label: 'Criterio 6: Vinculacion con la Sociedad',
    chipLabel: 'C6 Vinculacion',
    description: 'Modelos para convenios, actas, informes, evidencias y relacion con actores externos.',
    templateIds: ['convenio', 'acta', 'informe', 'evidencia', 'oficio'],
  },
] as const;

const featuredIds = ['acta', 'informe', 'registro', 'plan'];

export const TemplatesView = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');

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

  const featuredTemplates = useMemo(
    () => TEMPLATES.filter(template => featuredIds.includes(template.id)),
    []
  );

  const handleDownload = (templateId: string) => {
    const template = TEMPLATES.find(item => item.id === templateId);
    if (!template) return;

    const content = [
      `PLANTILLA INSTITUCIONAL: ${template.label.toUpperCase()}`,
      '',
      template.description,
      '',
      '1. Datos generales',
      '2. Objetivo o alcance',
      '3. Desarrollo',
      '4. Resultados, acuerdos o evidencias',
      '5. Responsables',
      '6. Firmas y anexos',
    ].join('\n');

    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `plantilla-${template.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-8"
    >
      <section className="rounded-[28px] border border-blue-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-blue-700">
              <Blocks className="h-3.5 w-3.5" />
              Centro de creacion
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
              Plantillas
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
              Aqui encuentras las plantillas mas usadas y una biblioteca organizada por criterio CACES.
              Entra, filtra y descarga una base limpia para comenzar a trabajar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Mas usadas" value="4" accent="text-amber-600" />
            <MetricCard label="Biblioteca" value={String(TEMPLATES.length)} accent="text-blue-600" />
            <MetricCard label="Criterios" value={String(categories.length)} accent="text-emerald-600" />
            <MetricCard label="Base" value="TXT" accent="text-violet-600" />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar una plantilla por nombre o uso"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-400 focus:bg-white"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Todas" active={activeCategory === ''} onClick={() => setActiveCategory('')} />
            {categories.map(category => (
              <FilterChip
                key={category.id}
                label={category.chipLabel}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {!query && activeCategory === '' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <h2 className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Plantillas mas utilizadas</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredTemplates.map(template => (
              <TemplateCard key={template.id} template={template} onDownload={handleDownload} featured />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-blue-600" />
          <h2 className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Plantillas por criterio</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-[24px] border p-5 text-left transition-all ${
                activeCategory === category.id
                  ? 'border-blue-300 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                activeCategory === category.id ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-black text-slate-800">{category.label}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{category.description}</p>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                {category.templateIds.length} plantillas sugeridas
              </p>
            </button>
          ))}
        </div>
      </section>

      {activeCategoryData ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                {activeCategoryData.label}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {activeCategoryData.description}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              {filteredTemplates.length} plantillas visibles
            </div>
          </div>

          {filteredTemplates.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map(template => (
                <TemplateCard key={template.id} template={template} onDownload={handleDownload} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-sm font-bold text-slate-500">No se encontraron plantillas con esos filtros.</p>
              <p className="mt-2 text-xs text-slate-400">Prueba con otro criterio o limpia la busqueda.</p>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-600">Selecciona un criterio para ver sus plantillas.</p>
          <p className="mt-2 text-xs text-slate-400">La biblioteca inferior se abre solo cuando eliges un criterio.</p>
        </section>
      )}
    </motion.div>
  );
};

const MetricCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className={`mt-2 text-2xl font-black ${accent}`}>{value}</p>
  </div>
);

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

const TemplateCard = ({
  template,
  onDownload,
  featured = false,
}: {
  template: (typeof TEMPLATES)[number];
  onDownload: (templateId: string) => void;
  featured?: boolean;
}) => (
  <article className="flex min-h-[190px] flex-col rounded-[24px] border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between gap-3">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
        featured ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
      }`}>
        <FileText className="h-5 w-5" />
      </div>
      {featured && (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-amber-700">
          Frecuente
        </span>
      )}
    </div>

    <h3 className="mt-4 text-sm font-black text-slate-900">{template.label}</h3>
    <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500">{template.description}</p>

    <button
      onClick={() => onDownload(template.id)}
      className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 transition-colors hover:bg-blue-50"
    >
      <Download className="h-3.5 w-3.5" />
      Descargar base
    </button>
  </article>
);
