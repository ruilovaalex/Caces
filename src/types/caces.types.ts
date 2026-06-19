import { Status } from './evidence.types';

export interface Requirement {
  id: string;
  label: string;
  description: string;
  format: string;
  reference?: string;
  status: Status;
  observation?: string;
  editableNote?: string;
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

export type TemplateSource = 'base' | 'admin';

export interface PublishedTemplate extends Template {
  criterionId: string;
  source: TemplateSource;
  indicatorCode?: string;
  requirementId?: string;
  requirementLabel?: string;
  targetLabel?: string;
  fileName?: string;
  fileType?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  fileContentId?: string;
}

export interface TemplateCategory {
  id: string;
  label: string;
  chipLabel: string;
  shortLabel: string;
  description: string;
  templateIds: string[];
}
