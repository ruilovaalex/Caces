export type Status = 'Pendiente' | 'Cargado' | 'Validado' | 'Observado' | 'Rechazado';
export type EvidenceFolderType = 'GENERAL' | 'CARRERA' | 'AREA';
export type OfficialFormatStatus = 'ACTIVO' | 'INACTIVO';
export type OfficialFormatSource = 'ADMIN_UPLOAD' | 'STATIC_TEMPLATE';

export interface EvidenceFolder {
  id: string;
  indicatorCode: string;
  requirementId: string;
  name: string;
  type: EvidenceFolderType;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface UploadedFile {
  id: string;
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
  folderId?: string;
  folderName?: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  version: number;
  status: Status;
  observation?: string;
  editableNote?: string;
  isCurrentVersion: boolean;
}

export interface UploadPayload {
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
  folderId?: string;
  folderName?: string;
  uploadedBy: string;
  observation?: string;
}

export interface OfficialFormat {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  status: OfficialFormatStatus;
  source: OfficialFormatSource;
  tags?: string[];
}

export interface EvidenceFormatLink {
  id: string;
  formatId: string;
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
  createdAt: string;
  createdBy: string;
}

export interface EvidenceGuideSection {
  title: string;
  items: string[];
}

export interface GeneratedDoc {
  id: string;
  indicatorCode: string;
  requirementId?: string;
  requirementLabel?: string;
  templateId: string;
  content: string;
  timestamp: string;
  label?: string;
  fileName?: string;
  isUpload?: boolean;
  fileSize?: string;
  fileType?: string;
}
