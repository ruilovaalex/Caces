import { Indicator, UploadedFile } from '../types';

export const calculateIndicatorProgress = (indicator: Indicator, allFiles: UploadedFile[]) => {
  const reqs = indicator.requirements;
  if (!reqs || reqs.length === 0) return 0;
  
  const validatedCount = reqs.filter(r => {
    const files = allFiles.filter(f => f.requirementId === r.id && f.indicatorCode === indicator.code);
    return files.some(f => f.status === 'Validado' && f.isCurrentVersion);
  }).length;

  return Math.round((validatedCount / reqs.length) * 100);
};

export const getIndicatorStats = (indicator: Indicator, allFiles: UploadedFile[]) => {
  const reqs = indicator.requirements || [];
  const total = reqs.length;
  
  const filesForInd = allFiles.filter(f => f.indicatorCode === indicator.code && f.isCurrentVersion);
  
  const valid = reqs.filter(r => filesForInd.some(f => f.requirementId === r.id && f.status === 'Validado')).length;
  const loaded = reqs.filter(r => filesForInd.some(f => f.requirementId === r.id && f.status === 'Cargado')).length;
  const observed = reqs.filter(r => filesForInd.some(f => f.requirementId === r.id && f.status === 'Observado')).length;
  const rejected = reqs.filter(r => filesForInd.some(f => f.requirementId === r.id && f.status === 'Rechazado')).length;
  const pending = total - valid - loaded - observed - rejected;

  return { total, valid, loaded, observed, rejected, pending };
};
