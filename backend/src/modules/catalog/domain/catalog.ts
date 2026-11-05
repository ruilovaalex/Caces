export type IndicatorType = 'CUALITATIVO' | 'CUANTITATIVO';
export type VerificationMode = 'DOCUMENTAL' | 'PRESENCIAL';

export interface Period {
  id: string;
  code: string;
  label: string;
  year: number;
  active: boolean;
}

export interface RequirementRef {
  id: string;
  number: number;
  label: string;
  format: string;
  mode: VerificationMode;
  indicatorId: string;
  indicatorCode: string;
}

export interface IndicatorRef {
  id: string;
  code: string;
  name: string;
  type: IndicatorType;
}

export interface CatalogTree {
  criteria: {
    code: string;
    name: string;
    subCriteria: {
      code: string;
      name: string;
      indicators: {
        code: string;
        name: string;
        description: string;
        type: IndicatorType;
        requirements: { number: number; label: string; description: string; format: string; mode: VerificationMode }[];
      }[];
    }[];
  }[];
}

// Puerto de solo lectura que usan los demas modulos para resolver periodos y elementos del catalogo.
export interface CatalogLookup {
  listPeriods(): Promise<Period[]>;
  findPeriodByCode(code: string): Promise<Period | null>;
  findRequirement(indicatorCode: string, number: number): Promise<RequirementRef | null>;
  findIndicator(code: string): Promise<IndicatorRef | null>;
  getTree(): Promise<CatalogTree>;
}

export const CATALOG_LOOKUP = Symbol('CatalogLookup');
