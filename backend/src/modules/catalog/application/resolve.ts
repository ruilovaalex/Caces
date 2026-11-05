import { NotFoundError, ValidationError } from '../../../shared/domain/errors';
import { CatalogLookup, IndicatorRef, Period, RequirementRef } from '../domain/catalog';

// Ayudas compartidas por los casos de uso para validar las referencias recibidas.
export const resolvePeriod = async (catalog: CatalogLookup, periodCode: string): Promise<Period> => {
  const period = await catalog.findPeriodByCode(periodCode);
  if (!period) throw new NotFoundError(`Periodo academico no encontrado: ${periodCode}`);
  return period;
};

export const resolveWritablePeriod = async (catalog: CatalogLookup, periodCode: string): Promise<Period> => {
  const period = await resolvePeriod(catalog, periodCode);
  if (!period.active) throw new ValidationError('El periodo academico esta cerrado y no admite cambios');
  return period;
};

export const resolveRequirement = async (catalog: CatalogLookup, indicatorCode: string, number: number): Promise<RequirementRef> => {
  const requirement = await catalog.findRequirement(indicatorCode, number);
  if (!requirement) throw new NotFoundError(`Evidencia no encontrada: indicador ${indicatorCode}, numero ${number}`);
  return requirement;
};

export const resolveIndicator = async (catalog: CatalogLookup, code: string): Promise<IndicatorRef> => {
  const indicator = await catalog.findIndicator(code);
  if (!indicator) throw new NotFoundError(`Indicador no encontrado: ${code}`);
  return indicator;
};
