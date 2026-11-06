import { Actor } from '../../../shared/domain/actor';
import { ForbiddenError, ValidationError } from '../../../shared/domain/errors';

// --- Verificaciones presenciales ---

export type VerificationResult = 'VERIFICADA' | 'CON_OBSERVACIONES';

export interface PresentialVerification {
  id: string;
  periodCode: string;
  indicatorCode: string;
  requirementNumber: number;
  result: VerificationResult;
  notes: string;
  verifiedByName: string;
  verifiedAt: Date;
}

// --- Valoracion de indicadores (independiente de archivos y verificaciones) ---

export type IndicatorRating = 'SATISFACTORIO' | 'CUASI_SATISFACTORIO' | 'POCO_SATISFACTORIO' | 'DEFICIENTE';

// Seccion 4.4 del Modelo de Evaluacion Externa 2024.
export const RATING_SCORES: Record<IndicatorRating, number> = {
  SATISFACTORIO: 1,
  CUASI_SATISFACTORIO: 0.7,
  POCO_SATISFACTORIO: 0.35,
  DEFICIENTE: 0,
};

export interface IndicatorAssessment {
  id: string;
  periodCode: string;
  indicatorCode: string;
  rating: IndicatorRating;
  score: number;
  achievements: string;
  deficiencies: string;
  assessedByName: string;
  assessedAt: Date;
}

export const EvaluationPolicy = {
  assertCanView(actor: Actor) {
    if (actor.role === 'DOCENTE') throw new ForbiddenError('No tienes acceso a los resultados de evaluación');
  },

  assertIsEvaluator(actor: Actor) {
    if (actor.role !== 'EVALUADOR') throw new ForbiddenError('Solo el evaluador registra verificaciones y valoraciones');
  },
};

export const assertVerificationInput = (mode: string, notes: string) => {
  if (mode !== 'PRESENCIAL') throw new ValidationError('Esta evidencia es documental: se revisa con sus archivos, no con una verificación presencial');
  if (!notes.trim()) throw new ValidationError('Describe lo que se comprobó en la visita');
};

export const assertAssessmentInput = (indicatorType: string, rating: IndicatorRating, achievements: string, deficiencies: string) => {
  if (indicatorType !== 'CUALITATIVO') {
    throw new ValidationError('Los indicadores cuantitativos se obtienen con su fórmula de cálculo; no admiten valoración cualitativa');
  }
  if (!achievements.trim()) throw new ValidationError('Registra los logros identificados');
  if (rating !== 'SATISFACTORIO' && !deficiencies.trim()) {
    throw new ValidationError('Registra las deficiencias que sustentan esta valoración');
  }
};

// --- Puertos ---

export interface VerificationRepository {
  listByPeriod(periodId: string): Promise<PresentialVerification[]>;
  create(data: { periodId: string; requirementId: string; result: VerificationResult; notes: string; verifiedById: string; legacyId?: string }): Promise<PresentialVerification>;
  existsLegacy(legacyId: string): Promise<boolean>;
}

export interface AssessmentRepository {
  listByPeriod(periodId: string): Promise<IndicatorAssessment[]>;
  create(data: {
    periodId: string;
    indicatorId: string;
    rating: IndicatorRating;
    score: number;
    achievements: string;
    deficiencies: string;
    assessedById: string;
    legacyId?: string;
  }): Promise<IndicatorAssessment>;
  existsLegacy(legacyId: string): Promise<boolean>;
}

export const VERIFICATION_REPOSITORY = Symbol('VerificationRepository');
export const ASSESSMENT_REPOSITORY = Symbol('AssessmentRepository');
