import { EvidenceFolder, EvidenceFolderType, UploadedFile } from '../types';
import { StorageService } from './storageService';

const STORAGE_KEY = 'edusudamericano_evidence_folders_v1';
const getLegacyFolderStorageKey = (indicatorCode: string) => `caces_repository_folders_${indicatorCode}`;

type LegacyFolderMap = Record<string, string[]>;

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ');

const readLegacyFolders = (indicatorCode: string): LegacyFolderMap => {
  try {
    const saved = localStorage.getItem(getLegacyFolderStorageKey(indicatorCode));
    return saved ? JSON.parse(saved) as LegacyFolderMap : {};
  } catch {
    return {};
  }
};

const folderExists = (
  folders: EvidenceFolder[],
  indicatorCode: string,
  requirementId: string,
  name: string
) => folders.some(folder =>
  folder.indicatorCode === indicatorCode &&
  folder.requirementId === requirementId &&
  folder.name.toLowerCase() === name.toLowerCase()
);

export const EvidenceFolderService = {
  getAll: (): EvidenceFolder[] => StorageService.get<EvidenceFolder[]>(STORAGE_KEY) || [],

  saveAll: (folders: EvidenceFolder[]): void => {
    StorageService.set(STORAGE_KEY, folders);
  },

  getByIndicator: (indicatorCode: string): EvidenceFolder[] => {
    return EvidenceFolderService.getAll()
      .filter(folder => folder.indicatorCode === indicatorCode)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getByRequirement: (indicatorCode: string, requirementId: string): EvidenceFolder[] => {
    return EvidenceFolderService.getByIndicator(indicatorCode)
      .filter(folder => folder.requirementId === requirementId);
  },

  migrateLegacyForIndicator: (indicatorCode: string): EvidenceFolder[] => {
    const allFolders = EvidenceFolderService.getAll();
    const legacyFolders = readLegacyFolders(indicatorCode);
    const now = new Date().toISOString();
    let hasChanges = false;

    const migratedFolders = Object.entries(legacyFolders).reduce<EvidenceFolder[]>((folders, [requirementId, names]) => {
      names.forEach(name => {
        const normalizedName = normalizeName(name);
        if (!normalizedName || folderExists(folders, indicatorCode, requirementId, normalizedName)) return;

        folders.push({
          id: crypto.randomUUID(),
          indicatorCode,
          requirementId,
          name: normalizedName,
          type: 'GENERAL',
          createdAt: now,
          updatedAt: now
        });
        hasChanges = true;
      });

      return folders;
    }, [...allFolders]);

    if (hasChanges) {
      EvidenceFolderService.saveAll(migratedFolders);
    }

    return EvidenceFolderService.getByIndicator(indicatorCode);
  },

  create: (
    indicatorCode: string,
    requirementId: string,
    name: string,
    type: EvidenceFolderType = 'GENERAL',
    createdBy?: string
  ): EvidenceFolder | null => {
    const normalizedName = normalizeName(name);
    if (!normalizedName) return null;

    const folders = EvidenceFolderService.getAll();
    if (folderExists(folders, indicatorCode, requirementId, normalizedName)) {
      return null;
    }

    const now = new Date().toISOString();
    const folder: EvidenceFolder = {
      id: crypto.randomUUID(),
      indicatorCode,
      requirementId,
      name: normalizedName,
      type,
      createdAt: now,
      updatedAt: now,
      createdBy
    };

    EvidenceFolderService.saveAll([...folders, folder]);
    return folder;
  },

  folderHasFiles: (folderId: string, files: UploadedFile[] = []): boolean => {
    return files.some(file => file.folderId === folderId);
  },

  delete: (folderId: string, files: UploadedFile[] = []): boolean => {
    if (EvidenceFolderService.folderHasFiles(folderId, files)) return false;

    const folders = EvidenceFolderService.getAll();
    EvidenceFolderService.saveAll(folders.filter(folder => folder.id !== folderId));
    return true;
  }
};
