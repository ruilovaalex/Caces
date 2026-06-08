import React, { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Search, Star } from 'lucide-react';
import { TEMPLATES } from '../../data/templates';
import { Modal } from '../common/Modal';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: 'gestion', label: 'Gestion institucional', templateIds: ['acta', 'informe', 'registro'] },
  { id: 'planificacion', label: 'Planificacion y seguimiento', templateIds: ['plan', 'informe', 'registro'] },
  { id: 'docencia', label: 'Docencia', templateIds: ['informe', 'registro', 'evidencia'] },
  { id: 'vinculacion', label: 'Vinculacion', templateIds: ['acta', 'informe', 'evidencia'] },
  { id: 'investigacion', label: 'Investigacion e innovacion', templateIds: ['plan', 'informe', 'evidencia'] },
] as const;

const featuredIds = ['acta', 'informe', 'registro', 'plan'];

export const TemplateLibraryModal = ({
  isOpen,
  onClose,
}: TemplateLibraryModalProps) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todas');

  const filteredTemplates = useMemo(() => {
    const category = categories.find(item => item.id === activeCategory);
    const normalizedQuery = query.trim().toLowerCase();

    return TEMPLATES.filter(template => {
      const matchesCategory = !category || category.templateIds.includes(template.id as never);
      const matchesQuery = !normalizedQuery
        || template.label.toLowerCase().includes(normalizedQuery)
        || template.description.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const handleDownload = (templateId: string) => {
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

  const featuredTemplates = TEMPLATES.filter(template => featuredIds.includes(template.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Biblioteca de plantillas" maxWidth="max-w-6xl">
      <div className="space-y-7 border-t border-slate-100 bg-slate-50 p-7">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar una plantilla"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-400"
            />
          </label>
          <select
            value={activeCategory}
            onChange={event => setActiveCategory(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400"
          >
            <option value="todas">Todas las categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
        </div>

        {!query && activeCategory === 'todas' && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Plantillas mas utilizadas</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {featuredTemplates.map(template => (
                <TemplateCard key={template.id} template={template} onDownload={handleDownload} featured />
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-700">
            {activeCategory === 'todas' ? 'Todas las plantillas' : categories.find(item => item.id === activeCategory)?.label}
          </h3>
          {filteredTemplates.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map(template => (
                <TemplateCard key={template.id} template={template} onDownload={handleDownload} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-400">
              No se encontraron plantillas con esos filtros.
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-700">Explorar por bloques</h3>
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-5">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <p className="mt-3 text-sm font-black text-slate-700">{category.label}</p>
                <p className="mt-1 text-xs text-slate-400">{category.templateIds.length} tipos disponibles</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
};

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
