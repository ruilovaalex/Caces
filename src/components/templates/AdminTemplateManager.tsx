import React, { useMemo, useState } from 'react';
import { Download, Edit3, FileUp, FolderCog, Save } from 'lucide-react';
import { Modal } from '../common/Modal';
import { PublishedTemplate } from '../../types';
import { TEMPLATE_CATEGORIES } from '../../data/templateCategories';

interface AdminTemplateManagerProps {
  customTemplates: PublishedTemplate[];
  onCreateTemplate: (payload: {
    label: string;
    description: string;
    criterionId: string;
    targetLabel?: string;
    file: File;
  }) => Promise<void>;
  onUpdateTemplate: (templateId: string, payload: {
    label: string;
    description: string;
    criterionId: string;
    targetLabel?: string;
    file?: File | null;
  }) => Promise<void>;
  onDownloadTemplate: (template: PublishedTemplate) => Promise<void>;
}

interface FormState {
  label: string;
  description: string;
  criterionId: string;
  targetLabel: string;
  file: File | null;
}

const createEmptyForm = (): FormState => ({
  label: '',
  description: '',
  criterionId: TEMPLATE_CATEGORIES[0]?.id || '',
  targetLabel: '',
  file: null,
});

export const AdminTemplateManager = ({
  customTemplates,
  onCreateTemplate,
  onUpdateTemplate,
  onDownloadTemplate,
}: AdminTemplateManagerProps) => {
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PublishedTemplate | null>(null);
  const [editingForm, setEditingForm] = useState<FormState>(createEmptyForm);

  const groupedTemplates = useMemo(
    () => TEMPLATE_CATEGORIES.map(category => ({
      category,
      templates: customTemplates.filter(template => template.criterionId === category.id),
    })),
    [customTemplates]
  );

  const handleCreate = async () => {
    if (!form.label.trim() || !form.description.trim() || !form.criterionId || !form.file) {
      window.alert('Completa nombre, descripcion, criterio y archivo del formato.');
      return;
    }

    setIsSaving(true);
    try {
      await onCreateTemplate({
        label: form.label,
        description: form.description,
        criterionId: form.criterionId,
        targetLabel: form.targetLabel,
        file: form.file,
      });
      setForm(createEmptyForm());
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (template: PublishedTemplate) => {
    setEditingTemplate(template);
    setEditingForm({
      label: template.label,
      description: template.description,
      criterionId: template.criterionId,
      targetLabel: template.targetLabel || '',
      file: null,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;
    if (!editingForm.label.trim() || !editingForm.description.trim() || !editingForm.criterionId) {
      window.alert('Completa nombre, descripcion y criterio antes de guardar.');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateTemplate(editingTemplate.id, {
        label: editingForm.label,
        description: editingForm.description,
        criterionId: editingForm.criterionId,
        targetLabel: editingForm.targetLabel,
        file: editingForm.file,
      });
      setEditingTemplate(null);
      setEditingForm(createEmptyForm());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700">
              <FolderCog className="h-3.5 w-3.5" />
              Administracion de formatos
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
              Publicar formatos para coordinadores
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
              Aqui el administrador puede subir, reemplazar y mantener los formatos oficiales por criterio para que
              coordinacion trabaje con la misma base documental.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricCard label="Publicadas" value={String(customTemplates.length)} accent="text-emerald-600" />
            <MetricCard label="Criterios activos" value={String(groupedTemplates.filter(item => item.templates.length > 0).length)} accent="text-blue-600" />
            <MetricCard label="Estado" value="LOCAL" accent="text-violet-600" />
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-600">Nuevo formato</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Nombre del formato">
                <input
                  value={form.label}
                  onChange={event => setForm(current => ({ ...current, label: event.target.value }))}
                  placeholder="Ej. Acta de seguimiento"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
                />
              </Field>
              <Field label="Criterio">
                <select
                  value={form.criterionId}
                  onChange={event => setForm(current => ({ ...current, criterionId: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
                >
                  {TEMPLATE_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Uso puntual o evidencia objetivo">
                <input
                  value={form.targetLabel}
                  onChange={event => setForm(current => ({ ...current, targetLabel: event.target.value }))}
                  placeholder="Ej. POA del periodo de evaluacion"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
                />
              </Field>
              <Field label="Archivo base">
                <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 text-sm text-slate-500 hover:border-blue-300">
                  <FileUp className="h-4 w-4 text-blue-600" />
                  <span className="truncate">{form.file ? form.file.name : 'Seleccionar formato'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={event => setForm(current => ({ ...current, file: event.target.files?.[0] || null }))}
                  />
                </label>
              </Field>
            </div>
            <Field label="Descripcion">
              <textarea
                value={form.description}
                onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
                placeholder="Explica para que sirve este formato y cuando debe usarse."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </Field>
            <button
              onClick={handleCreate}
              disabled={isSaving}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Publicar formato'}
            </button>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-600">Resumen por criterio</h3>
            <div className="mt-5 space-y-3">
              {groupedTemplates.map(({ category, templates }) => (
                <div key={category.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{category.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{category.description}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                      {templates.length} publicadas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-900">Formatos publicados</h3>
            <p className="mt-1 text-sm text-slate-500">Edita el contenido descriptivo o reemplaza el archivo cuando cambie la version oficial.</p>
          </div>
        </div>

        {customTemplates.length > 0 ? (
          <div className="mt-6 space-y-6">
            {groupedTemplates.filter(item => item.templates.length > 0).map(({ category, templates }) => (
              <div key={category.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{category.label}</h4>
                    <p className="mt-1 text-xs text-slate-500">{templates.length} formatos publicados para este criterio.</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    Activo
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {templates.map(template => (
                    <article key={template.id} className="rounded-[20px] border border-slate-200 bg-white p-4">
                      <p className="text-sm font-black text-slate-900">{template.label}</p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">{template.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {template.targetLabel && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-blue-700">
                            {template.targetLabel}
                          </span>
                        )}
                        {template.fileName && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                            {template.fileName}
                          </span>
                        )}
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          onClick={() => void onDownloadTemplate(template)}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 hover:bg-blue-50"
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
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-sm font-bold text-slate-500">Todavia no hay formatos publicados por administracion.</p>
            <p className="mt-2 text-xs text-slate-400">Sube el primero desde el formulario superior.</p>
          </div>
        )}
      </section>

      <Modal
        isOpen={Boolean(editingTemplate)}
        onClose={() => setEditingTemplate(null)}
        title="Actualizar formato publicado"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5 border-t border-slate-100 bg-white p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre del formato">
              <input
                value={editingForm.label}
                onChange={event => setEditingForm(current => ({ ...current, label: event.target.value }))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
              />
            </Field>
            <Field label="Criterio">
              <select
                value={editingForm.criterionId}
                onChange={event => setEditingForm(current => ({ ...current, criterionId: event.target.value }))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
              >
                {TEMPLATE_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Uso puntual o evidencia objetivo">
              <input
                value={editingForm.targetLabel}
                onChange={event => setEditingForm(current => ({ ...current, targetLabel: event.target.value }))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
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
          </div>
          <Field label="Descripcion">
            <textarea
              value={editingForm.description}
              onChange={event => setEditingForm(current => ({ ...current, description: event.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </Field>
          <button
            onClick={handleSaveEdit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </Modal>
    </>
  );
};

const MetricCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className={`mt-2 text-2xl font-black ${accent}`}>{value}</p>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
    {children}
  </label>
);
