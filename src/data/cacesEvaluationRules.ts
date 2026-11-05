import { IndicatorRating } from '../types';

// Datos derivados del "Modelo de Evaluacion Externa 2024 con Fines de Acreditacion para los ISTT".
// Evidencias cuyo unico medio de verificacion es la visita in situ y que son actividades del
// evaluador (entrevistas, verificaciones, constataciones, observacion de clases), no documentos.
// Clave: `${codigoIndicador}#${numeroEvidencia}`.
export const PRESENTIAL_REQUIREMENT_KEYS: ReadonlySet<string> = new Set([
  '1.1.1#6', '1.1.3#6', '1.1.4#3', '1.1.4#5', '1.1.4#7',
  '1.2.2#5', '1.2.2#6', '1.2.3#2',
  '2.1.1#1', '2.1.3#1', '2.1.3#2', '2.1.3#3',
  '3.2.4#7', '3.2.4#8',
  '4.1.3#7', '4.1.4#5', '4.1.6#1', '4.1.6#2', '4.2.1#7', '4.2.2#7',
  '4.4.1#3', '4.4.1#4', '4.4.2#12', '4.5.1#7', '4.5.1#9', '4.5.2#5', '4.5.2#10',
  '5.1.1#9', '5.1.1#10', '5.1.1#13', '5.2.1#5',
  '6.1.1#8',
]);

// Los 15 indicadores cuantitativos del modelo (Tabla 1: 15 cuantitativos y 28 cualitativos).
export const QUANTITATIVE_INDICATOR_CODES: ReadonlySet<string> = new Set([
  '2.1.1', '2.1.4', '3.1.2', '3.1.3', '3.1.4', '3.2.1', '3.2.2', '3.3.1', '3.3.2',
  '4.1.1', '4.1.2', '4.1.4', '4.1.5', '4.1.6', '5.1.2',
]);

// Categorias de evaluacion de los indicadores cualitativos (seccion 4.4 del modelo).
export const INDICATOR_RATING_SCALE: ReadonlyArray<{
  value: IndicatorRating;
  label: string;
  score: number;
  description: string;
}> = [
  {
    value: 'SATISFACTORIO',
    label: 'Satisfactorio',
    score: 1,
    description: 'Cumple el estandar en los componentes esenciales y tambien en los complementarios.',
  },
  {
    value: 'CUASI_SATISFACTORIO',
    label: 'Cuasi satisfactorio',
    score: 0.7,
    description: 'Deficiencias parciales en componentes complementarios; los esenciales se cumplen.',
  },
  {
    value: 'POCO_SATISFACTORIO',
    label: 'Poco satisfactorio',
    score: 0.35,
    description: 'Deficiencias en complementarios y afectaciones en esenciales, o deficiencias generalizadas en complementarios.',
  },
  {
    value: 'DEFICIENTE',
    label: 'Deficiente',
    score: 0,
    description: 'Graves deficiencias en los componentes esenciales, que en sentido general no se logran.',
  },
];
