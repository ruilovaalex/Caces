import { TEMPLATES } from '../data/templates';
import { FileContentService } from './fileContentService';
import { StorageService } from './storageService';
import { PublishedTemplate, Template } from '../types';

const CUSTOM_TEMPLATES_KEY = 'caces_custom_templates';
export const TEMPLATE_LIBRARY_UPDATED_EVENT = 'caces:template-library-updated';

interface SaveTemplatePayload {
  label: string;
  description: string;
  criterionId: string;
  indicatorCode?: string;
  requirementId?: string;
  requirementLabel?: string;
  targetLabel?: string;
  file: File;
  uploadedBy?: string;
}

interface UpdateTemplatePayload {
  label: string;
  description: string;
  criterionId: string;
  indicatorCode?: string;
  requirementId?: string;
  requirementLabel?: string;
  targetLabel?: string;
  file?: File | null;
  uploadedBy?: string;
}

const notifyTemplateLibraryChange = () => {
  window.dispatchEvent(new CustomEvent(TEMPLATE_LIBRARY_UPDATED_EVENT));
};

const sortTemplates = (templates: PublishedTemplate[]) =>
  [...templates].sort((left, right) => {
    const leftDate = left.uploadedAt ? new Date(left.uploadedAt).getTime() : 0;
    const rightDate = right.uploadedAt ? new Date(right.uploadedAt).getTime() : 0;
    return rightDate - leftDate;
  });

const createBaseTemplateBlob = (template: Template) => {
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

  return new Blob([content], { type: 'text/plain;charset=utf-8' });
};

const triggerBrowserDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const TemplateService = {
  getCustomTemplates(): PublishedTemplate[] {
    const templates = StorageService.get<PublishedTemplate[]>(CUSTOM_TEMPLATES_KEY) || [];
    return sortTemplates(templates);
  },

  async createCustomTemplate(payload: SaveTemplatePayload): Promise<PublishedTemplate> {
    const fileContentId = crypto.randomUUID();
    await FileContentService.save(fileContentId, payload.file);

    const template: PublishedTemplate = {
      id: crypto.randomUUID(),
      label: payload.label.trim(),
      description: payload.description.trim(),
      criterionId: payload.criterionId,
      indicatorCode: payload.indicatorCode,
      requirementId: payload.requirementId,
      requirementLabel: payload.requirementLabel,
      targetLabel: payload.targetLabel?.trim() || undefined,
      source: 'admin',
      fileName: payload.file.name,
      fileType: payload.file.type || 'application/octet-stream',
      uploadedBy: payload.uploadedBy || 'Administrador',
      uploadedAt: new Date().toISOString(),
      fileContentId,
    };

    const templates = this.getCustomTemplates();
    StorageService.set(CUSTOM_TEMPLATES_KEY, [template, ...templates]);
    notifyTemplateLibraryChange();
    return template;
  },

  async updateCustomTemplate(templateId: string, payload: UpdateTemplatePayload): Promise<PublishedTemplate | null> {
    const templates = this.getCustomTemplates();
    const currentTemplate = templates.find(template => template.id === templateId);

    if (!currentTemplate) {
      return null;
    }

    let fileContentId = currentTemplate.fileContentId;
    let fileName = currentTemplate.fileName;
    let fileType = currentTemplate.fileType;

    if (payload.file) {
      if (fileContentId) {
        await FileContentService.remove(fileContentId);
      }
      fileContentId = crypto.randomUUID();
      await FileContentService.save(fileContentId, payload.file);
      fileName = payload.file.name;
      fileType = payload.file.type || 'application/octet-stream';
    }

    const updatedTemplate: PublishedTemplate = {
      ...currentTemplate,
      label: payload.label.trim(),
      description: payload.description.trim(),
      criterionId: payload.criterionId,
      indicatorCode: payload.indicatorCode,
      requirementId: payload.requirementId,
      requirementLabel: payload.requirementLabel,
      targetLabel: payload.targetLabel?.trim() || undefined,
      fileContentId,
      fileName,
      fileType,
      uploadedBy: payload.uploadedBy || currentTemplate.uploadedBy,
      uploadedAt: new Date().toISOString(),
    };

    StorageService.set(
      CUSTOM_TEMPLATES_KEY,
      templates.map(template => template.id === templateId ? updatedTemplate : template)
    );
    notifyTemplateLibraryChange();
    return updatedTemplate;
  },

  async deleteCustomTemplate(templateId: string): Promise<void> {
    const templates = this.getCustomTemplates();
    const currentTemplate = templates.find(template => template.id === templateId);

    if (currentTemplate?.fileContentId) {
      await FileContentService.remove(currentTemplate.fileContentId);
    }

    StorageService.set(
      CUSTOM_TEMPLATES_KEY,
      templates.filter(template => template.id !== templateId)
    );
    notifyTemplateLibraryChange();
  },

  async downloadTemplate(template: Template | PublishedTemplate): Promise<void> {
    if ('source' in template && template.source === 'admin' && template.fileContentId) {
      const blob = await FileContentService.get(template.fileContentId);
      if (!blob) {
        window.alert('No se encontro el archivo publicado para esta plantilla.');
        return;
      }

      triggerBrowserDownload(blob, template.fileName || `${template.label}.bin`);
      return;
    }

    const baseTemplate = TEMPLATES.find(item => item.id === template.id) || template;
    triggerBrowserDownload(createBaseTemplateBlob(baseTemplate), `plantilla-${baseTemplate.id}.txt`);
  },
};
