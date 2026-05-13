import { GeneratedDoc } from '../types';

const STORAGE_KEY = 'edusudamericano_evidences_v1';

export const EvidenceService = {
  // Simula GET /api/evidences
  getAll: (): GeneratedDoc[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Simula POST /api/evidences
  save: (doc: GeneratedDoc): void => {
    const all = EvidenceService.getAll();
    all.push(doc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  // Simula el proceso de subida de archivo real
  upload: async (file: File, indicatorCode: string): Promise<GeneratedDoc> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDoc: GeneratedDoc = {
          id: Math.random().toString(36).substr(2, 9),
          indicatorCode: indicatorCode,
          templateId: 'upload',
          content: `Archivo subido: ${file.name}`,
          timestamp: new Date().toLocaleString(),
          label: file.name,
          isUpload: true,
          fileSize: (file.size / 1024).toFixed(2) + ' KB',
          fileType: file.type
        };
        EvidenceService.save(newDoc);
        resolve(newDoc);
      }, 1000); // Simulamos retardo de red
    });
  },

  // Simula DELETE /api/evidences/:id
  delete: (id: string): void => {
    const all = EvidenceService.getAll();
    const filtered = all.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
