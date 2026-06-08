import { Status, UploadedFile, GeneratedDoc, UploadPayload } from '../types';
import { StorageService } from './storageService';
import { FileContentService } from './fileContentService';
import { getDisplayFileType } from '../utils/evidenceFormatUtils';

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

    const fileId = crypto.randomUUID();
    const newFile: UploadedFile = {
      id: fileId,
      indicatorCode: payload.indicatorCode,
      requirementId: payload.requirementId,
      requirementLabel: payload.requirementLabel,
      fileName: file.name,
      fileType: getDisplayFileType(file.name, file.type),
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      uploadDate: new Date().toLocaleString(),
      uploadedBy: payload.uploadedBy,
      version: newVersion,
      status: 'Cargado',
      observation: payload.observation,
      isCurrentVersion: true
    };

    await FileContentService.save(fileId, file);
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
    const evidenceToDelete = all.find(f => f.id === evidenceId);
    if (!evidenceToDelete) return;

    const remaining = all.filter(f => f.id !== evidenceId);

    const requirementFiles = remaining
      .filter(file =>
        file.indicatorCode === evidenceToDelete.indicatorCode &&
        file.requirementId === evidenceToDelete.requirementId
      )
      .sort((a, b) => b.version - a.version);

    const nextCurrentId = requirementFiles[0]?.id;
    const updated = remaining.map(file => {
      if (file.indicatorCode !== evidenceToDelete.indicatorCode || file.requirementId !== evidenceToDelete.requirementId) {
        return file;
      }

      return {
        ...file,
        isCurrentVersion: file.id === nextCurrentId
      };
    });

    StorageService.set(STORAGE_KEY, updated);
    void FileContentService.remove(evidenceId);
  },

  getFileContent: (evidenceId: string): Promise<Blob | null> => {
    return FileContentService.get(evidenceId);
  },

  getVersionHistory: (indicatorCode: string, requirementId: string): UploadedFile[] => {
    return EvidenceService.getByRequirement(indicatorCode, requirementId).sort((a,b) => b.version - a.version);
  }
};
