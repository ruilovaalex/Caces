import { isApiMode, ApiError, describeError } from './api/apiClient';
import { DraftsApi } from './api/cacesApi';
import { EvidenceDraft, DraftHistoryEntry } from '../types';

const DRAFTS_KEY = 'caces_evidence_drafts';
const HISTORY_KEY = 'caces_draft_history';

export const DraftService = {
  configurePeriod: (periodCode: string | null): void => {
    syncPeriod = periodCode;
  },

  // Carga los borradores del servidor en la cache local. Sin permiso de lectura (otros roles) la cache se vacia.
  hydrate: async (periodCode: string, canRead = true): Promise<void> => {
    if (!isApiMode) return;
    syncPeriod = periodCode;
    writeCache(canRead ? await DraftsApi.list(periodCode) : []);
  },

  getDraft: (indicatorCode: string, requirementId: string): EvidenceDraft | null => {
    const draftsRaw = localStorage.getItem(DRAFTS_KEY);
    if (!draftsRaw) return null;
    
    try {
      const drafts: EvidenceDraft[] = JSON.parse(draftsRaw);
      return drafts.find(d => d.indicatorCode === indicatorCode && d.requirementId === requirementId) || null;
    } catch (e) {
      console.error('Error parsing drafts', e);
      return null;
    }
  },

  saveDraft: (draft: EvidenceDraft): void => {
    const draftsRaw = localStorage.getItem(DRAFTS_KEY);
    let drafts: EvidenceDraft[] = [];
    
    if (draftsRaw) {
      try {
        drafts = JSON.parse(draftsRaw);
      } catch (e) {
        console.error('Error parsing drafts', e);
      }
    }

    const index = drafts.findIndex(d => d.indicatorCode === draft.indicatorCode && d.requirementId === draft.requirementId);
    
    const baseVersion = index >= 0 ? drafts[index].version : 0;
    const newDraft = {
      ...draft,
      updatedAt: new Date().toISOString(),
      version: index >= 0 ? drafts[index].version + 1 : 1
    };

    if (index >= 0) {
      drafts[index] = newDraft;
    } else {
      drafts.push(newDraft);
    }

    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    
    // Save to history
    DraftService._addToHistory(newDraft);
    syncSave(newDraft, baseVersion);
  },

  updateDraft: (indicatorCode: string, requirementId: string, updates: Partial<EvidenceDraft>): void => {
    const draft = DraftService.getDraft(indicatorCode, requirementId);
    if (draft) {
      DraftService.saveDraft({ ...draft, ...updates });
    }
  },

  deleteDraft: (indicatorCode: string, requirementId: string): void => {
    const draftsRaw = localStorage.getItem(DRAFTS_KEY);
    if (!draftsRaw) return;

    try {
      let drafts: EvidenceDraft[] = JSON.parse(draftsRaw);
      drafts = drafts.filter(d => !(d.indicatorCode === indicatorCode && d.requirementId === requirementId));
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      syncDelete(indicatorCode, requirementId);
    } catch (e) {
      console.error('Error deleting draft', e);
    }
  },

  getDraftHistory: (indicatorCode: string, requirementId: string): DraftHistoryEntry[] => {
    const historyRaw = localStorage.getItem(HISTORY_KEY);
    if (!historyRaw) return [];

    try {
      const allHistory: Record<string, DraftHistoryEntry[]> = JSON.parse(historyRaw);
      const key = `${indicatorCode}_${requirementId}`;
      return allHistory[key] || [];
    } catch (e) {
      console.error('Error parsing history', e);
      return [];
    }
  },

  _addToHistory: (draft: EvidenceDraft): void => {
    const historyRaw = localStorage.getItem(HISTORY_KEY);
    let allHistory: Record<string, DraftHistoryEntry[]> = {};

    if (historyRaw) {
      try {
        allHistory = JSON.parse(historyRaw);
      } catch (e) {
        console.error('Error parsing history', e);
      }
    }

    const key = `${draft.indicatorCode}_${draft.requirementId}`;
    if (!allHistory[key]) allHistory[key] = [];

    const entry: DraftHistoryEntry = {
      id: crypto.randomUUID(),
      updatedAt: draft.updatedAt,
      updatedBy: draft.updatedBy,
      version: draft.version,
      changes: `Actualización de versión ${draft.version}`
    };

    allHistory[key].unshift(entry);
    
    // Keep only last 10 versions
    if (allHistory[key].length > 10) {
      allHistory[key] = allHistory[key].slice(0, 10);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
  }
};

// --- Sincronizacion con el servidor (solo modo servidor) ---
// localStorage actua como cache de lectura sincrona; el servidor es la fuente de verdad compartida.
let syncPeriod: string | null = null;
const queues = new Map<string, Promise<void>>();
const syncErrorListeners = new Set<(message: string) => void>();

const keyOf = (indicatorCode: string, requirementId: string) => `${indicatorCode}_${requirementId}`;
const readCache = (): EvidenceDraft[] => {
  try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]'); } catch { return []; }
};
const writeCache = (drafts: EvidenceDraft[]) => localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));

// Serializa las escrituras de un mismo borrador para que las versiones lleguen en orden.
const enqueue = (key: string, job: () => Promise<void>) => {
  const next = (queues.get(key) ?? Promise.resolve()).then(job).catch(error => {
    const message = error instanceof ApiError && error.status === 409
      ? 'El borrador fue modificado por otra persona. Se recargo la versión del servidor.'
      : `No se pudo guardar el borrador en el servidor: ${describeError(error)}`;
    syncErrorListeners.forEach(listener => listener(message));
    if (error instanceof ApiError && error.status === 409 && syncPeriod) void DraftService.hydrate(syncPeriod);
  });
  queues.set(key, next);
};

export const DraftSync = {
  onError(listener: (message: string) => void) {
    syncErrorListeners.add(listener);
    return () => { syncErrorListeners.delete(listener); };
  },
};

const syncSave = (draft: EvidenceDraft, baseVersion: number) => {
  if (!isApiMode || !syncPeriod) return;
  const period = syncPeriod;
  enqueue(keyOf(draft.indicatorCode, draft.requirementId), async () => {
    const saved = await DraftsApi.save(period, draft, baseVersion);
    writeCache(readCache().map(d => (d.indicatorCode === saved.indicatorCode && d.requirementId === saved.requirementId ? { ...d, version: saved.version } : d)));
  });
};

const syncDelete = (indicatorCode: string, requirementId: string) => {
  if (!isApiMode || !syncPeriod) return;
  const period = syncPeriod;
  enqueue(keyOf(indicatorCode, requirementId), () => DraftsApi.remove(period, indicatorCode, requirementId));
};
