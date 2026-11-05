import { Indicator, PresentialVerification, Requirement, UploadedFile, Status } from '../types';
import { PRESENTIAL_REQUIREMENT_KEYS } from '../data/cacesEvaluationRules';
import { getPresentialStatus, getRequirementVerifications } from '../services/presentialVerificationService';

export const isPresentialRequirement = (indicatorCode: string, requirementId: string) =>
  PRESENTIAL_REQUIREMENT_KEYS.has(`${indicatorCode}#${requirementId}`);

// Las evidencias presenciales se verifican en la visita in situ y no forman parte del progreso documental.
export const getDocumentalRequirements = (indicator: Indicator): Requirement[] =>
  (indicator.requirements || []).filter(requirement => !isPresentialRequirement(indicator.code, requirement.id));

export const getPresentialRequirements = (indicator: Indicator): Requirement[] =>
  (indicator.requirements || []).filter(requirement => isPresentialRequirement(indicator.code, requirement.id));

// Devuelve null cuando el indicador no tiene evidencias documentales (todas son presenciales).
export const calculateIndicatorProgress = (indicator: Indicator, allFiles: UploadedFile[]): number | null => {
  const requirements = getDocumentalRequirements(indicator);
  if (requirements.length === 0) return null;

  const uploadedCount = requirements.filter(requirement => {
    const files = allFiles.filter(
      file => file.requirementId === requirement.id && file.indicatorCode === indicator.code
    );
    return files.some(file => file.isCurrentVersion);
  }).length;

  return Math.round((uploadedCount / requirements.length) * 100);
};

export const getIndicatorStats = (indicator: Indicator, allFiles: UploadedFile[]) => {
  const requirements = getDocumentalRequirements(indicator);
  const total = requirements.length;

  const filesForIndicator = allFiles.filter(
    file => file.indicatorCode === indicator.code && file.isCurrentVersion
  );

  const loaded = requirements.filter(requirement =>
    filesForIndicator.some(file => file.requirementId === requirement.id)
  ).length;
  const valid = requirements.filter(requirement =>
    filesForIndicator.some(file => file.requirementId === requirement.id && file.status === 'Validado')
  ).length;
  const observed = requirements.filter(requirement =>
    filesForIndicator.some(file => file.requirementId === requirement.id && file.status === 'Observado')
  ).length;
  const rejected = requirements.filter(requirement =>
    filesForIndicator.some(file => file.requirementId === requirement.id && file.status === 'Rechazado')
  ).length;
  const pending = total - loaded;

  return { total, valid, loaded, observed, rejected, pending };
};

export const getIndicatorCurrentStatus = (indicator: Indicator, allFiles: UploadedFile[]): Status => {
  const stats = getIndicatorStats(indicator, allFiles);

  if (stats.rejected > 0) return 'Rechazado';
  if (stats.observed > 0) return 'Observado';
  if (stats.valid === stats.total && stats.total > 0) return 'Validado';
  if (stats.loaded > 0) return 'Cargado';
  return 'Pendiente';
};

export const getPresentialStats = (indicators: Indicator[], verifications: PresentialVerification[]) => {
  let total = 0;
  let verified = 0;
  let observed = 0;

  indicators.forEach(indicator => {
    getPresentialRequirements(indicator).forEach(requirement => {
      total += 1;
      const status = getPresentialStatus(getRequirementVerifications(verifications, indicator.code, requirement.id));
      if (status === 'Verificada') verified += 1;
      if (status === 'Con observaciones') observed += 1;
    });
  });

  return { total, verified, observed, pending: total - verified - observed };
};

// Pendientes reales del periodo: evidencias documentales sin archivo vigente o con archivo observado/rechazado.
// Primero los indicadores con correcciones pendientes; luego los de menor avance.
export const getPendingIndicators = (indicators: Indicator[], allFiles: UploadedFile[]) => {
  const currentFiles = allFiles.filter(file => file.isCurrentVersion);
  return indicators
    .map(indicator => {
      const currentFor = (requirementId: string) =>
        currentFiles.find(file => file.indicatorCode === indicator.code && file.requirementId === requirementId);
      const documental = getDocumentalRequirements(indicator);
      const missing = documental.filter(requirement => !currentFor(requirement.id));
      const toCorrect = documental.filter(requirement => {
        const status = currentFor(requirement.id)?.status;
        return status === 'Observado' || status === 'Rechazado';
      });
      return { indicator, missing, toCorrect, progress: calculateIndicatorProgress(indicator, allFiles) };
    })
    .filter(item => item.progress !== null && (item.missing.length > 0 || item.toCorrect.length > 0))
    .sort((a, b) => b.toCorrect.length - a.toCorrect.length || (a.progress ?? 0) - (b.progress ?? 0));
};
