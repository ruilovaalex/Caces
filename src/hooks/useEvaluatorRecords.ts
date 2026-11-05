import { useCallback, useEffect, useState } from 'react';
import { IndicatorAssessment, IndicatorRating, PresentialVerification, Requirement, VerificationResult } from '../types';
import { PresentialVerificationService } from '../services/presentialVerificationService';
import { IndicatorAssessmentService } from '../services/indicatorAssessmentService';
import { NotificationService } from '../services/notificationService';
import { INDICATOR_RATING_SCALE } from '../data/cacesEvaluationRules';
import { describeError, isApiMode } from '../services/api/apiClient';
import { EvaluationApi } from '../services/api/cacesApi';

// Verificaciones presenciales y valoraciones de indicadores. En modo servidor se separan por periodo.
export const useEvaluatorRecords = (periodCode: string, enabled = true) => {
  const [verifications, setVerifications] = useState<PresentialVerification[]>([]);
  const [assessments, setAssessments] = useState<IndicatorAssessment[]>([]);

  const loadData = useCallback(async () => {
    if (!isApiMode) {
      setVerifications(PresentialVerificationService.getAll());
      setAssessments(IndicatorAssessmentService.getAll());
      return;
    }
    if (!enabled) {
      setVerifications([]);
      setAssessments([]);
      return;
    }
    try {
      const [nextVerifications, nextAssessments] = await Promise.all([
        EvaluationApi.verifications(periodCode),
        EvaluationApi.assessments(periodCode),
      ]);
      setVerifications(nextVerifications);
      setAssessments(nextAssessments);
    } catch (error) {
      // DOCENTE no tiene acceso a estos resultados: se muestran vacios.
      console.error(error);
      setVerifications([]);
      setAssessments([]);
    }
  }, [enabled, periodCode]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const registerVerification = useCallback(async (
    indicatorCode: string,
    requirement: Requirement,
    result: VerificationResult,
    notes: string,
    verifiedBy: string,
  ) => {
    if (isApiMode) {
      try {
        await EvaluationApi.registerVerification(periodCode, indicatorCode, requirement.id, result, notes);
      } catch (error) {
        window.alert(describeError(error));
      }
      await loadData();
      return;
    }

    PresentialVerificationService.register({
      indicatorCode,
      requirementId: requirement.id,
      requirementLabel: requirement.label,
      result,
      notes,
      verifiedBy,
    });
    await loadData();

    if (result === 'Con observaciones') {
      NotificationService.add({
        title: 'Verificacion presencial con observaciones',
        message: `Indicador ${indicatorCode}, evidencia ${requirement.id}: ${notes}`,
        type: 'warning',
        targetRole: 'COORDINADOR',
      });
    }
  }, [loadData, periodCode]);

  const registerAssessment = useCallback(async (
    indicatorCode: string,
    rating: IndicatorRating,
    achievements: string,
    deficiencies: string,
    assessedBy: string,
  ) => {
    if (isApiMode) {
      try {
        await EvaluationApi.registerAssessment(periodCode, indicatorCode, rating, achievements, deficiencies);
      } catch (error) {
        window.alert(describeError(error));
      }
      await loadData();
      return;
    }

    IndicatorAssessmentService.register({ indicatorCode, rating, achievements, deficiencies, assessedBy });
    await loadData();

    const label = INDICATOR_RATING_SCALE.find(item => item.value === rating)?.label || rating;
    NotificationService.add({
      title: 'Indicador valorado',
      message: `El indicador ${indicatorCode} fue valorado como ${label}.`,
      type: rating === 'SATISFACTORIO' ? 'success' : rating === 'DEFICIENTE' ? 'error' : 'info',
      targetRole: 'COORDINADOR',
    });
  }, [loadData, periodCode]);

  return {
    verifications,
    assessments,
    registerVerification,
    registerAssessment,
    refreshEvaluatorRecords: loadData,
  };
};
