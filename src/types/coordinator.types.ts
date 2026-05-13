import { UserRole } from './auth.types';

export interface TemplateSection {
  id: string;
  title: string;
  instruction: string;
  placeholder: string;
  content: string;
}

export interface EvidenceTemplate {
  id: string;
  requirementId: string;
  indicatorCode: string;
  title: string;
  description: string;
  sections: TemplateSection[];
  recommendedFileName: string;
}

export type DraftStatus = 'SIN_INICIAR' | 'EN_EDICION' | 'BORRADOR_GUARDADO' | 'LISTO_PARA_SUBIR' | 'ARCHIVO_FINAL_CARGADO';

export interface EvidenceDraft {
  id: string;
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
  templateId: string;
  sections: TemplateSection[];
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
  status: DraftStatus;
  observations?: string;
}

export interface DraftHistoryEntry {
  id: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
  changes: string;
}
