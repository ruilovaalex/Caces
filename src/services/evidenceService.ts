import { Status, UploadedFile, GeneratedDoc, UploadPayload } from '../types';
import { StorageService } from './storageService';

const STORAGE_KEY = 'edusudamericano_advanced_evidences_v2';
const DOCS_STORAGE_KEY = 'edusudamericano_generated_docs_v2';

export const EvidenceService = {
  getAll: (): UploadedFile[] => {
    return StorageService.get<UploadedFile[]>(STORAGE_KEY) || [];
  },

  getAllDocs: (): GeneratedDoc[] => {
    return StorageService.get<GeneratedDoc[]>(DOCS_STORAGE_KEY) || [];
  },

  saveDoc: (doc: GeneratedDoc): void => {
    const all = EvidenceService.getAllDocs();
    all.push(doc);
    StorageService.set(DOCS_STORAGE_KEY, all);
  },

  getByIndicator: (indicatorCode: string): UploadedFile[] => {
    const all = EvidenceService.getAll();
    return all.filter(f => f.indicatorCode === indicatorCode);
  },

  getByRequirement: (indicatorCode: string, requirementId: string): UploadedFile[] => {
    const all = EvidenceService.getAll();
    return all.filter(f => f.indicatorCode === indicatorCode && f.requirementId === requirementId);
  },

  upload: async (file: File, payload: UploadPayload): Promise<UploadedFile> => {
    const all = EvidenceService.getAll();
    
    // Desactivar versiones anteriores del mismo requerimiento en ese indicador
    const updated = all.map(f => {
      if (f.indicatorCode === payload.indicatorCode && f.requirementId === payload.requirementId) {
        return { ...f, isCurrentVersion: false };
      }
      return f;
    });

    const newVersion = EvidenceService.getByRequirement(payload.indicatorCode, payload.requirementId).length + 1;

    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      indicatorCode: payload.indicatorCode,
      requirementId: payload.requirementId,
      requirementLabel: payload.requirementLabel,
      fileName: file.name,
      fileType: file.type || file.name.split('.').pop() || 'unknown',
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      uploadDate: new Date().toLocaleString(),
      uploadedBy: payload.uploadedBy,
      version: newVersion,
      status: 'Cargado',
      observation: payload.observation,
      isCurrentVersion: true
    };

    updated.push(newFile);
    StorageService.set(STORAGE_KEY, updated);
    return newFile;
  },

  updateStatus: (evidenceId: string, status: Status, observation?: string): void => {
    const all = EvidenceService.getAll();
    const updated = all.map(f => {
      if (f.id === evidenceId) {
        return { ...f, status, observation };
      }
      return f;
    });
    StorageService.set(STORAGE_KEY, updated);
  },

  updateNote: (evidenceId: string, note: string): void => {
    const all = EvidenceService.getAll();
    const updated = all.map(f => {
      if (f.id === evidenceId) {
        return { ...f, editableNote: note };
      }
      return f;
    });
    StorageService.set(STORAGE_KEY, updated);
  },

  deleteEvidence: (evidenceId: string): void => {
    const all = EvidenceService.getAll();
    const updated = all.filter(f => f.id !== evidenceId);
    StorageService.set(STORAGE_KEY, updated);
  },

  getVersionHistory: (indicatorCode: string, requirementId: string): UploadedFile[] => {
    return EvidenceService.getByRequirement(indicatorCode, requirementId).sort((a,b) => b.version - a.version);
  }
};
