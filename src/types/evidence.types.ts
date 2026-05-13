export type Status = 'Pendiente' | 'Cargado' | 'Validado' | 'Observado' | 'Rechazado';

export interface UploadedFile {
  id: string;
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
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
  uploadedBy: string;
  observation?: string;
}
