import { UploadedFile } from '../types';
import { FileContentService } from './fileContentService';
import { StorageService } from './storageService';
import { getDisplayFileType } from '../utils/evidenceFormatUtils';

const STORAGE_KEY = 'caces_repository_folder_files_v1';

export interface RepositoryFolderFile extends UploadedFile {
  folderName: string;
}

interface UploadFolderFilePayload {
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
  folderName: string;
  uploadedBy: string;
}

export const RepositoryFolderService = {
  getAll(): RepositoryFolderFile[] {
    return StorageService.get<RepositoryFolderFile[]>(STORAGE_KEY) || [];
  },

  getByRequirement(indicatorCode: string, requirementId: string): RepositoryFolderFile[] {
    return this.getAll().filter(file => file.indicatorCode === indicatorCode && file.requirementId === requirementId);
  },

  getByFolder(indicatorCode: string, requirementId: string, folderName: string): RepositoryFolderFile[] {
    return this.getByRequirement(indicatorCode, requirementId)
      .filter(file => file.folderName === folderName)
      .sort((left, right) => new Date(right.uploadDate).getTime() - new Date(left.uploadDate).getTime());
  },

  async upload(file: File, payload: UploadFolderFilePayload): Promise<RepositoryFolderFile> {
    const fileId = crypto.randomUUID();
    const uploadedFile: RepositoryFolderFile = {
      id: fileId,
      indicatorCode: payload.indicatorCode,
      requirementId: payload.requirementId,
      requirementLabel: payload.requirementLabel,
      folderName: payload.folderName,
      fileName: file.name,
      fileType: getDisplayFileType(file.name, file.type),
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      uploadDate: new Date().toLocaleString(),
      uploadedBy: payload.uploadedBy,
      version: 1,
      status: 'Cargado',
      isCurrentVersion: true,
    };

    await FileContentService.save(fileId, file);
    StorageService.set(STORAGE_KEY, [uploadedFile, ...this.getAll()]);
    return uploadedFile;
  },

  async delete(fileId: string): Promise<void> {
    StorageService.set(
      STORAGE_KEY,
      this.getAll().filter(file => file.id !== fileId)
    );
    await FileContentService.remove(fileId);
  },
};
