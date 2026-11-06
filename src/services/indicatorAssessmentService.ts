import { IndicatorAssessment, IndicatorRating } from '../types';
import { INDICATOR_RATING_SCALE } from '../data/cacesEvaluationRules';
import { StorageService } from './storageService';

const STORAGE_KEY = 'edusudamericano_indicator_assessments_v1';

interface AssessmentPayload {
  indicatorCode: string;
  rating: IndicatorRating;
  achievements: string;
  deficiencies: string;
  assessedBy: string;
}

// La valoracion del indicador es independiente del estado de los archivos y de las
// verificaciones presenciales: nunca se calcula a partir de ellos.
export const IndicatorAssessmentService = {
  getAll: (): IndicatorAssessment[] => {
    return StorageService.get<IndicatorAssessment[]>(STORAGE_KEY) || [];
  },

  register: (payload: AssessmentPayload): IndicatorAssessment => {
    const scale = INDICATOR_RATING_SCALE.find(item => item.value === payload.rating);
    if (!scale) throw new Error(`Valoración no reconocida: ${payload.rating}`);

    const record: IndicatorAssessment = {
      ...payload,
      id: crypto.randomUUID(),
      score: scale.score,
      assessedAt: new Date().toISOString(),
    };
    StorageService.set(STORAGE_KEY, [...IndicatorAssessmentService.getAll(), record]);
    return record;
  },
};

export const getIndicatorAssessmentHistory = (assessments: IndicatorAssessment[], indicatorCode: string) =>
  assessments
    .filter(item => item.indicatorCode === indicatorCode)
    .sort((a, b) => b.assessedAt.localeCompare(a.assessedAt));
