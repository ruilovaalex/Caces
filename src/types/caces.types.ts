import { Status } from './evidence.types';

export interface Requirement {
  id: string;
  label: string;
  description: string;
  format: string;
  allowedFormats?: string[];
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
