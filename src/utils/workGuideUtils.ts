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
        'Nombre oficial del documento y código interno si existe.',
        'Fecha de aprobación, resolución, acta o autoridad que lo emite.',
        'Alcance, responsables y procedimiento que regula.'
      ],
      supports: [
        'Resolución o acta de aprobación.',
        'Documento completo con firmas o sellos.',
        'Versión vigente o evidencia de actualización.'
      ]
    };
  }

  if (text.includes('plan') || text.includes('poa') || text.includes('pedi') || text.includes('cronograma')) {
    return {
      focus: 'Planificación con objetivos, actividades, responsables e indicadores.',
      checks: [
        'Periodo de aplicación y relación con el modelo CACES.',
        'Objetivos, metas, actividades y responsables definidos.',
        'Cronograma, recursos e indicadores de seguimiento.'
      ],
      supports: [
        'Matriz o plan aprobado.',
        'Acta, resolución o firma de aprobación.',
        'Informe de seguimiento si ya hubo ejecución.'
      ]
    };
  }

  if (text.includes('informe') || text.includes('seguimiento') || text.includes('evaluacion') || text.includes('resultados')) {
    return {
      focus: 'Informe verificable con resultados, análisis y acciones de mejora.',
      checks: [
        'Periodo evaluado y responsable del informe.',
        'Datos, indicadores o resultados que demuestren cumplimiento.',
        'Conclusiones, observaciones y acciones correctivas.'
      ],
      supports: [
        'Matrices de seguimiento.',
        'Reportes, gráficos o respaldos estadísticos.',
        'Actas o comunicaciones de socialización.'
      ]
    };
  }

  if (text.includes('matriz') || text.includes('listado') || text.includes('nomina') || text.includes('inventario')) {
    return {
      focus: 'Matriz certificada, completa y trazable.',
      checks: [
        'Columnas claras: periodo, responsable, unidad/carrera y estado.',
        'Datos completos, consistentes y actualizados.',
        'Firma, certificación o fuente institucional.'
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
        'Imágenes legibles y asociadas al espacio, actividad o sistema evaluado.',
        'Fecha, lugar, responsable y breve descripción.',
        'Relación directa con el requerimiento del indicador.'
      ],
      supports: [
        'Fotografías, capturas o planos.',
        'Acta de constatación si aplica.',
        'Archivo ZIP organizado por carpetas si son varios soportes.'
      ]
    };
  }

  if (text.includes('acta') || text.includes('convocatoria') || text.includes('asistencia') || text.includes('socializacion')) {
    return {
      focus: 'Respaldo de participación o socialización institucional.',
      checks: [
        'Convocatoria, fecha, participantes y tema tratado.',
        'Acta o registro con acuerdos principales.',
        'Lista de asistencia, firmas o evidencia equivalente.'
      ],
      supports: [
        'Actas y convocatorias.',
        'Registros de asistencia.',
        'Fotografías, correos o publicaciones.'
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

  return {
    title: `Guía para ${requirement.label}`,
    intro: `Esta evidencia aporta al indicador ${indicator.code}: ${indicator.name}.`,
    focus: inferred.focus,
    checks: inferred.checks,
    supports: inferred.supports,
    format: formatList(requirement.format),
    cacesDescription: requirement.description
  };
};
