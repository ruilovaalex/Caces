import { Indicator, Requirement } from '../types';

const formatList = (format: string) => format
  .split('/')
  .map(item => item.trim())
  .filter(Boolean)
  .join(', ');

const inferDocumentFocus = (requirement: Requirement) => {
  const text = `${requirement.label} ${requirement.description}`.toLowerCase();

  if (text.includes('normativa') || text.includes('reglamento') || text.includes('politica') || text.includes('procedimiento')) {
    return {
      focus: 'Documento normativo aprobado y vigente.',
      checks: [
        'Nombre oficial del documento y codigo interno si existe.',
        'Fecha de aprobacion, resolucion, acta o autoridad que lo emite.',
        'Alcance, responsables y procedimiento que regula.'
      ],
      supports: [
        'Resolucion o acta de aprobacion.',
        'Documento completo con firmas o sellos.',
        'Version vigente o evidencia de actualizacion.'
      ]
    };
  }

  if (text.includes('plan') || text.includes('poa') || text.includes('pedi') || text.includes('cronograma')) {
    return {
      focus: 'Planificacion con objetivos, actividades, responsables e indicadores.',
      checks: [
        'Periodo de aplicacion y relacion con el modelo CACES.',
        'Objetivos, metas, actividades y responsables definidos.',
        'Cronograma, recursos e indicadores de seguimiento.'
      ],
      supports: [
        'Matriz o plan aprobado.',
        'Acta, resolucion o firma de aprobacion.',
        'Informe de seguimiento si ya hubo ejecucion.'
      ]
    };
  }

  if (text.includes('informe') || text.includes('seguimiento') || text.includes('evaluacion') || text.includes('resultados')) {
    return {
      focus: 'Informe verificable con resultados, analisis y acciones de mejora.',
      checks: [
        'Periodo evaluado y responsable del informe.',
        'Datos, indicadores o resultados que demuestren cumplimiento.',
        'Conclusiones, observaciones y acciones correctivas.'
      ],
      supports: [
        'Matrices de seguimiento.',
        'Reportes, graficos o respaldos estadisticos.',
        'Actas o comunicaciones de socializacion.'
      ]
    };
  }

  if (text.includes('matriz') || text.includes('listado') || text.includes('nomina') || text.includes('inventario')) {
    return {
      focus: 'Matriz certificada, completa y trazable.',
      checks: [
        'Columnas claras: periodo, responsable, unidad/carrera y estado.',
        'Datos completos, consistentes y actualizados.',
        'Firma, certificacion o fuente institucional.'
      ],
      supports: [
        'Archivo editable o PDF certificado.',
        'Fuente de datos o sistema institucional.',
        'Anexos que respalden los registros clave.'
      ]
    };
  }

  if (text.includes('fotografia') || text.includes('fotografica') || text.includes('captura') || text.includes('video') || text.includes('planos')) {
    return {
      focus: 'Evidencia visual clara, fechada y relacionada con el indicador.',
      checks: [
        'Imagenes legibles y asociadas al espacio, actividad o sistema evaluado.',
        'Fecha, lugar, responsable y breve descripcion.',
        'Relacion directa con el requerimiento del indicador.'
      ],
      supports: [
        'Fotografias, capturas o planos.',
        'Acta de constatacion si aplica.',
        'Archivo ZIP organizado por carpetas si son varios soportes.'
      ]
    };
  }

  if (text.includes('acta') || text.includes('convocatoria') || text.includes('asistencia') || text.includes('socializacion')) {
    return {
      focus: 'Respaldo de participacion o socializacion institucional.',
      checks: [
        'Convocatoria, fecha, participantes y tema tratado.',
        'Acta o registro con acuerdos principales.',
        'Lista de asistencia, firmas o evidencia equivalente.'
      ],
      supports: [
        'Actas y convocatorias.',
        'Registros de asistencia.',
        'Fotografias, correos o publicaciones.'
      ]
    };
  }

  return {
    focus: 'Evidencia completa, pertinente y verificable.',
    checks: [
      'Que corresponda exactamente al indicador seleccionado.',
      'Que incluya periodo, responsables y fuente institucional.',
      'Que tenga anexos suficientes para demostrar cumplimiento.'
    ],
    supports: [
      'Documento principal en el formato solicitado.',
      'Anexos o soportes complementarios.',
      'Firmas, fechas o respaldos de validez institucional.'
    ]
  };
};

export const buildRequirementWorkGuide = (indicator: Indicator, requirement: Requirement) => {
  const inferred = inferDocumentFocus(requirement);
  const allowedFormat = formatList(requirement.format);

  return {
    title: `Guia para ${requirement.label}`,
    intro: `Esta evidencia aporta al indicador ${indicator.code}: ${indicator.name}.`,
    description: requirement.description,
    whatToPrepare: inferred.focus,
    minimumContent: inferred.checks,
    suggestedSupports: inferred.supports,
    allowedFormat,
    focus: inferred.focus,
    checks: inferred.checks,
    supports: inferred.supports,
    format: allowedFormat,
    cacesDescription: requirement.description
  };
};
