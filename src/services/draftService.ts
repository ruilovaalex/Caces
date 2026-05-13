import { EvidenceDraft, DraftHistoryEntry } from '../types';

const DRAFTS_KEY = 'caces_evidence_drafts';
const HISTORY_KEY = 'caces_draft_history';

export const DraftService = {
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
