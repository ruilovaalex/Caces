import { Indicator, UploadedFile, UserRole } from '../types';
import { getPendingIndicators, isPresentialRequirement } from './progressUtils';

export type NextActionTarget = 'indicator' | 'assignments' | 'none';

export interface NextAction {
  tone: 'action' | 'done';
  title: string;
  detail: string;
  cta?: string;
  target: NextActionTarget;
  indicator?: Indicator;
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

// Dice a cada perfil que le falta y cual es el siguiente paso, a partir de los mismos datos del panel.
export const getNextAction = (
  role: UserRole,
  indicators: Indicator[],
  allFiles: UploadedFile[],
  presentialPending: number,
): NextAction => {
  if (role === 'ADMIN') {
    return {
      tone: 'action',
      title: 'Gestiona las cuentas del sistema',
      detail: 'Crea usuarios, asigna roles y restablece contraseñas desde la sección 3.',
      cta: 'Abrir usuarios y roles',
      target: 'assignments',
    };
  }

  if (role === 'EVALUADOR') {
    const toReview = allFiles.filter(
      file => file.isCurrentVersion && file.status === 'Cargado' && !isPresentialRequirement(file.indicatorCode, file.requirementId),
    );
    const firstCode = toReview[0]?.indicatorCode;
    const indicator = indicators.find(item => item.code === firstCode);
    if (indicator) {
      const codes = new Set(toReview.map(file => file.indicatorCode));
      return {
        tone: 'action',
        title: `${plural(toReview.length, 'evidencia espera', 'evidencias esperan')} tu revisión`,
        detail: `En ${plural(codes.size, 'indicador', 'indicadores')}. Empieza por ${indicator.code} - ${indicator.name}.`,
        cta: `Revisar ${indicator.code}`,
        target: 'indicator',
        indicator,
      };
    }
    if (presentialPending > 0) {
      return {
        tone: 'action',
        title: `${plural(presentialPending, 'verificación presencial pendiente', 'verificaciones presenciales pendientes')}`,
        detail: 'No hay evidencias por revisar. Las verificaciones se registran durante la visita in situ, dentro de cada indicador.',
        target: 'none',
      };
    }
    return { tone: 'done', title: 'No tienes revisiones pendientes', detail: 'Todas las evidencias cargadas ya fueron revisadas.', target: 'none' };
  }

  if (role === 'COORDINADOR') {
    const pending = getPendingIndicators(indicators, allFiles);
    const first = pending[0];
    if (first) {
      const toCorrect = pending.reduce((sum, item) => sum + item.toCorrect.length, 0);
      const missing = pending.reduce((sum, item) => sum + item.missing.length, 0);
      const parts = [
        toCorrect ? `${plural(toCorrect, 'evidencia observada o rechazada', 'evidencias observadas o rechazadas')} por corregir` : '',
        missing ? `${plural(missing, 'evidencia', 'evidencias')} sin cargar` : '',
      ].filter(Boolean);
      return {
        tone: 'action',
        title: toCorrect ? 'Corrige las evidencias observadas' : 'Carga las evidencias que faltan',
        detail: `${parts.join(' y ')} en ${plural(pending.length, 'indicador', 'indicadores')}. Empieza por ${first.indicator.code} - ${first.indicator.name}.`,
        cta: `Abrir ${first.indicator.code}`,
        target: 'indicator',
        indicator: first.indicator,
      };
    }
    return { tone: 'done', title: 'Evidencias documentales completas', detail: 'Todas tienen un archivo vigente sin observaciones. Espera la revisión del evaluador.', target: 'none' };
  }

  return { tone: 'done', title: 'Revisa tus actividades', detail: 'Tus tareas estan en la pestana Actividades.', target: 'none' };
};
