export type Role = 'ADMIN' | 'COORDINADOR' | 'EVALUADOR';
export type Status = 'Pendiente' | 'Cargado' | 'Validado' | 'Observado';

export interface Requirement {
  id: string;
  label: string;
  status: Status;
  isAI?: boolean;
}

export interface GeneratedDoc {
  id: string;
  indicatorCode: string;
  templateId: string;
  content: string;
  timestamp: string;
  label?: string;
  isUpload?: boolean;
  fileSize?: string;
  fileType?: string;
}

export interface Indicator {
  code: string;
  name: string;
  status: Status;
  description: string;
  requirements: Requirement[];
}

export interface SubCriterion {
  id: string;
  name: string;
  indicators: Indicator[];
}

export interface Criterion {
  id: string;
  name: string;
  subCriteria: SubCriterion[];
}

export interface YearPeriod {
  year: number;
  criteria: Criterion[];
}

export interface Template {
  id: string;
  label: string;
  description: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  link?: string;
}
