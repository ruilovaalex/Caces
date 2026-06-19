import React, { useMemo, useState } from 'react';
import { Download, Edit3, FileUp, Save, Trash2 } from 'lucide-react';
import { Indicator, PublishedTemplate, Requirement } from '../../types';
import { TEMPLATE_CATEGORIES } from '../../data/templateCategories';
import { useTemplateLibrary } from '../../hooks/useTemplateLibrary';
import { TemplateService } from '../../services/templateService';
import { Modal } from '../common/Modal';

interface RequirementTemplateManagerModalProps {
  isOpen: boolean;
  indicator: Indicator;
  requirement: Requirement | null;
  currentUserName?: string;
  onClose: () => void;
}

interface TemplateFormState {
  label: string;
  description: string;
  targetLabel: string;
  file: File | null;
}

const createEmptyForm = (requirement: Requirement | null): TemplateFormState => ({
  label: '',
  description: '',
  targetLabel: requirement?.label || '',
  file: null,
});

export const RequirementTemplateManagerModal = ({
  isOpen,
  indicator,
  requirement,
  currentUserName,
  onClose,
}: RequirementTemplateManagerModalProps) => {
  const { customTemplates, refreshCustomTemplates } = useTemplateLibrary();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<TemplateFormState>(() => createEmptyForm(requirement));
  const [editingTemplate, setEditingTemplate] = useState<PublishedTemplate | null>(null);
  const [editingForm, setEditingForm] = useState<TemplateFormState>(() => createEmptyForm(requirement));

  const criterionId = `criterio-${indicator.code.split('.')[0]}`;
  const criterionLabel = TEMPLATE_CATEGORIES.find(category => category.id === criterionId)?.label || indicator.code;

  const requirementTemplates = useMemo(
    () => requirement
      ? customTemplates.filter(template =>
          template.indicatorCode === indicator.code &&
          template.requirementId === requirement.id
        )
      : [],
    [customTemplates, indicator.code, requirement]
  );

  React.useEffect(() => {
    setForm(createEmptyForm(requirement));
    setEditingTemplate(null);
    setEditingForm(createEmptyForm(requirement));
  }, [requirement, isOpen]);

  if (!requirement) return null;

  const handleCreate = async () => {
    if (!form.label.trim() || !form.description.trim() || !form.file) {
      window.alert('Completa nombre, descripcion y archivo del formato.');
      return;
    }

    setIsSaving(true);
    try {
      await TemplateService.createCustomTemplate({
        label: form.label,
        description: form.description,
        criterionId,
        indicatorCode: indicator.code,
        requirementId: requirement.id,
        requirementLabel: requirement.label,
        targetLabel: form.targetLabel || requirement.label,
        file: form.file,
        uploadedBy: currentUserName || 'Administrador',
      });
      refreshCustomTemplates();
      setForm(createEmptyForm(requirement));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (template: PublishedTemplate) => {
    setEditingTemplate(template);
    setEditingForm({
      label: template.label,
      description: template.description,
      targetLabel: template.targetLabel || requirement.label,
      file: null,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;
    if (!editingForm.label.trim() || !editingForm.description.trim()) {
      window.alert('Completa nombre y descripcion antes de guardar.');
      return;
    }

    setIsSaving(true);
    try {
      await TemplateService.updateCustomTemplate(editingTemplate.id, {
        label: editingForm.label,
        description: editingForm.description,
        criterionId,
        indicatorCode: indicator.code,
        requirementId: requirement.id,
        requirementLabel: requirement.label,
        targetLabel: editingForm.targetLabel || requirement.label,
        file: editingForm.file,
        uploadedBy: currentUserName || 'Administrador',
      });
      refreshCustomTemplates();
      setEditingTemplate(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (template: PublishedTemplate) => {
    const confirmed = window.confirm(`Eliminar la plantilla "${template.label}"?`);
    if (!confirmed) return;

    await TemplateService.deleteCustomTemplate(template.id);
    refreshCustomTemplates();
  };

  const handleDownload = async (template: PublishedTemplate) => {
    await TemplateService.downloadTemplate(template);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar plantillas de la evidencia"
      maxWidth="max-w-5xl"
      zIndex={103}
    >
      <div className="space-y-6 border-t border-slate-100 bg-white p-7">
        <div className="rounded-[24px] border border-blue-100 bg-blue-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">{criterionLabel}</p>
          <h3 className="mt-2 text-lg font-black text-slate-900">{requirement.label}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Publica aqui formatos especificos para esta evidencia. Los coordinadores podran descargarlos y reutilizarlos.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-600">Nueva plantilla para esta evidencia</h4>
            <div className="mt-5 space-y-4">
              <Field label="Nombre del formato">
                <input
                  value={form.label}
                  onChange={event => setForm(current => ({ ...current, label: event.target.value }))}
                  placeholder="Ej. Matriz de seguimiento"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
                />
              </Field>
              <Field label="Uso o nombre visible">
                <input
                  value={form.targetLabel}
                  onChange={event => setForm(current => ({ ...current, targetLabel: event.target.value }))}
                  placeholder={requirement.label}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
                />
              </Field>
              <Field label="Descripcion">
                <textarea
                  value={form.description}
                  onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
                  rows={4}
                  placeholder="Explica cuando se usa este formato y que debe completar el coordinador."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </Field>
              <Field label="Archivo base">
                <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 text-sm text-slate-500 hover:border-blue-300">
                  <FileUp className="h-4 w-4 text-blue-600" />
                  <span className="truncate">{form.file ? form.file.name : 'Seleccionar archivo'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={event => setForm(current => ({ ...current, file: event.target.files?.[0] || null }))}
                  />
                </label>
              </Field>
              <button
                onClick={() => void handleCreate()}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Guardando...' : 'Publicar plantilla'}
              </button>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-600">Plantillas publicadas</h4>
                <p className="mt-1 text-xs text-slate-400">{requirementTemplates.length} publicadas para esta evidencia.</p>
              </div>
            </div>

            {requirementTemplates.length > 0 ? (
              <div className="mt-5 space-y-4">
                {requirementTemplates.map(template => (
                  <article key={template.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h5 className="text-sm font-black text-slate-900">{template.label}</h5>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{template.description}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">
                        Publicada
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {template.targetLabel && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-blue-700">
                          {template.targetLabel}
                        </span>
                      )}
                      {template.fileName && (
                        <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                          {template.fileName}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => void handleDownload(template)}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 hover:bg-blue-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Descargar
                      </button>
                      <button
                        onClick={() => handleStartEdit(template)}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 hover:bg-emerald-100"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Actualizar
                      </button>
                      <button
                        onClick={() => void handleDelete(template)}
                        className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <p className="text-sm font-bold text-slate-500">Aun no hay plantillas publicadas para esta evidencia.</p>
                <p className="mt-2 text-xs text-slate-400">Sube una base aqui y luego otros coordinadores podran usarla.</p>
              </div>
            )}
          </section>
        </div>

        <Modal
          isOpen={Boolean(editingTemplate)}
          onClose={() => setEditingTemplate(null)}
          title="Actualizar plantilla publicada"
          maxWidth="max-w-2xl"
          zIndex={104}
        >
          <div className="space-y-5 border-t border-slate-100 bg-white p-7">
            <Field label="Nombre del formato">
              <input
                value={editingForm.label}
                onChange={event => setEditingForm(current => ({ ...current, label: event.target.value }))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
              />
            </Field>
            <Field label="Uso o nombre visible">
              <input
                value={editingForm.targetLabel}
                onChange={event => setEditingForm(current => ({ ...current, targetLabel: event.target.value }))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
              />
            </Field>
            <Field label="Descripcion">
              <textarea
                value={editingForm.description}
                onChange={event => setEditingForm(current => ({ ...current, description: event.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </Field>
            <Field label="Reemplazar archivo">
              <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 text-sm text-slate-500 hover:border-blue-300">
                <FileUp className="h-4 w-4 text-blue-600" />
                <span className="truncate">{editingForm.file ? editingForm.file.name : 'Mantener archivo actual'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={event => setEditingForm(current => ({ ...current, file: event.target.files?.[0] || null }))}
                />
              </label>
            </Field>
            <button
              onClick={() => void handleSaveEdit()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </Modal>
      </div>
    </Modal>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
    {children}
  </label>
);
