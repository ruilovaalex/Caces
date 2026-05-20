import { Indicator, UploadedFile, Status } from '../types';

export const calculateIndicatorProgress = (indicator: Indicator, allFiles: UploadedFile[]) => {
  const requirements = indicator.requirements;
  if (!requirements || requirements.length === 0) return 0;

  const uploadedCount = requirements.filter(requirement => {
    const files = allFiles.filter(
      file => file.requirementId === requirement.id && file.indicatorCode === indicator.code
    );
    return files.some(file => file.isCurrentVersion);
  }).length;

  return Math.round((uploadedCount / requirements.length) * 100);
};

export const getIndicatorStats = (indicator: Indicator, allFiles: UploadedFile[]) => {
  const requirements = indicator.requirements || [];
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
