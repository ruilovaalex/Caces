import React, { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Search, Sparkles, Star } from 'lucide-react';
import { TEMPLATES } from '../../data/templates';
import { FEATURED_TEMPLATE_IDS, TEMPLATE_CATEGORIES } from '../../data/templateCategories';
import { useTemplateLibrary } from '../../hooks/useTemplateLibrary';
import { TemplateService } from '../../services/templateService';
import { PublishedTemplate, Template } from '../../types';
import { Modal } from '../common/Modal';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DisplayTemplate extends Template {
  criterionId: string;
  source: 'base' | 'admin';
  indicatorCode?: string;
  requirementId?: string;
  requirementLabel?: string;
  targetLabel?: string;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  fileContentId?: string;
}

export const TemplateLibraryModal = ({
  isOpen,
  onClose,
}: TemplateLibraryModalProps) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const { customTemplates } = useTemplateLibrary();

  const activeCategoryData = TEMPLATE_CATEGORIES.find(category => category.id === activeCategory);

  const getTemplatesByCategory = (categoryId: string): DisplayTemplate[] => {
    const category = TEMPLATE_CATEGORIES.find(item => item.id === categoryId);
    if (!category) return [];

    const baseTemplates = category.templateIds
      .map(templateId => TEMPLATES.find(template => template.id === templateId))
      .filter((template): template is Template => Boolean(template))
      .map(template => ({
        ...template,
        criterionId: category.id,
        source: 'base' as const,
      }));

    const adminTemplates = customTemplates.filter(template => template.criterionId === category.id);

    return [...baseTemplates, ...adminTemplates];
  };

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const scopedTemplates = activeCategoryData ? getTemplatesByCategory(activeCategoryData.id) : [];

    return scopedTemplates.filter(template => (
      !normalizedQuery ||
      template.label.toLowerCase().includes(normalizedQuery) ||
      template.description.toLowerCase().includes(normalizedQuery) ||
      template.fileName?.toLowerCase().includes(normalizedQuery) ||
      template.requirementLabel?.toLowerCase().includes(normalizedQuery) ||
      template.targetLabel?.toLowerCase().includes(normalizedQuery)
    ));
  }, [activeCategoryData, customTemplates, query]);

  const featuredTemplates = useMemo(
    () => TEMPLATES.filter(template => FEATURED_TEMPLATE_IDS.includes(template.id)).map(template => ({
      ...template,
      criterionId: 'featured',
      source: 'base' as const,
    })),
    []
  );

  const handleDownload = async (template: DisplayTemplate | PublishedTemplate) => {
    await TemplateService.downloadTemplate(template);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Biblioteca de plantillas" maxWidth="max-w-6xl">
      <div className="space-y-7 border-t border-slate-100 bg-slate-50 p-7">
        <div className="flex flex-col gap-3">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar una plantilla"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-400"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Todas" active={activeCategory === ''} onClick={() => setActiveCategory('')} />
            {TEMPLATE_CATEGORIES.map(category => (
              <FilterChip
                key={category.id}
                label={category.shortLabel}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </div>

        {!query && activeCategory === '' && (
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
          <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-700">Plantillas por criterio</h3>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {TEMPLATE_CATEGORIES.map(category => {
              const publishedCount = customTemplates.filter(template => template.criterionId === category.id).length;

              return (
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
                  <div className="mt-4 flex flex-wrap gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                      {category.templateIds.length} base
                    </p>
                    {publishedCount > 0 && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        {publishedCount} publicadas
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
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
                  <TemplateCard key={`${template.source}-${template.id}-${template.criterionId}`} template={template} onDownload={handleDownload} />
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
            <p className="text-sm font-bold text-slate-600">Selecciona un criterio para ver sus plantillas.</p>
            <p className="mt-2 text-xs text-slate-400">La parte inferior se abre solo cuando eliges un criterio.</p>
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

interface TemplateCardProps {
  template: DisplayTemplate;
  onDownload: (template: DisplayTemplate) => Promise<void>;
  featured?: boolean;
}

const TemplateCard = ({ template, onDownload, featured = false }: TemplateCardProps) => (
  <article className="flex min-h-[150px] flex-col rounded-lg border border-slate-200 bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
        featured ? 'bg-amber-50 text-amber-600' : template.source === 'admin' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
      }`}>
        <FileText className="h-4 w-4" />
      </div>
      <div className="flex flex-col items-end gap-1">
        {featured && <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Frecuente</span>}
        {template.source === 'admin' && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Publicada</span>}
      </div>
    </div>
    <h4 className="mt-3 text-sm font-black text-slate-800">{template.label}</h4>
    <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{template.description}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {template.targetLabel && (
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-blue-700">
          {template.targetLabel}
        </span>
      )}
      {template.requirementLabel && (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">
          {template.requirementLabel}
        </span>
      )}
      {template.fileName && (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
          {template.fileName}
        </span>
      )}
    </div>
    <button
      onClick={() => void onDownload(template)}
      className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800"
    >
      <Download className="h-3.5 w-3.5" />
      {template.source === 'admin' ? 'Descargar formato' : 'Descargar base'}
    </button>
  </article>
);
