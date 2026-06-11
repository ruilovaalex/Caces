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
      ],
      steps: [
        'Revisar el estado actual de la normativa y sus anexos.',
        'Asegurar que las firmas esten completas y legibles.',
        'Escanear el documento original de preferencia a color.'
      ],
      tips: ['Si la normativa fue actualizada, asegurese de adjuntar tambien el documento que aprueba la actualizacion.'],
      warnings: ['No se aceptaran borradores sin firma ni sello institucional.']
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
      ],
      steps: [
        'Recopilar el POA o plan de la institucion.',
        'Verificar que las fechas coincidan con el periodo evaluado.',
        'Marcar o resaltar las secciones o metas correspondientes al indicador.'
      ],
      tips: ['Incluir matrices de Excel como anexos suele facilitar la lectura a los evaluadores externos.'],
      warnings: ['El documento base debe estar formalmente aprobado por el organo colegiado superior.']
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
      ],
      steps: [
        'Generar el reporte consolidado del periodo evaluado.',
        'Añadir conclusiones claras y acciones de mejora ejecutadas en el texto.',
        'Adjuntar las evidencias primarias (como listados o fotos) como anexos.'
      ],
      tips: ['Las tablas y graficos estadisticos aportan mucha claridad y contundencia a los informes.'],
      warnings: ['Evite presentar informes meramente descriptivos sin un analisis cuantitativo o cualitativo real.']
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
      ],
      steps: [
        'Descargar la plantilla de la matriz institucional (si existe).',
        'Completar absolutamente todos los campos sin omitir columnas.',
        'Cruzar la informacion final con la base de datos oficial para detectar errores.'
      ],
      tips: ['Asegurese de que los formatos de fecha (dd/mm/aaaa) y numeros sean consistentes en toda la matriz.'],
      warnings: ['Celdas vacias, inconsistencias de cedulas o nombres pueden causar que toda la evidencia sea rechazada.']
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
      ],
      steps: [
        'Tomar las capturas de pantalla o fotografias requeridas con buena calidad.',
        'Agregar descripciones o pies de foto explicativos a cada imagen.',
        'Consolidar todas las imagenes en un solo documento PDF o archivo comprimido.'
      ],
      tips: ['Si captura un sistema web o plataforma, asegurese de que la URL y la fecha de su ordenador esten visibles.'],
      warnings: ['No edite, recorte agresivamente ni altere la informacion contenida en las capturas de pantalla.']
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
      ],
      steps: [
        'Recopilar el acta de la sesion correspondiente.',
        'Verificar que el listado de firmas de asistencia este anexo.',
        'Subrayar o resaltar los puntos del orden del dia estrictamente relacionados al indicador.'
      ],
      tips: ['Si la sesion o reunion fue virtual, adjuntar capturas de pantalla de la plataforma (ej. Zoom/Teams) o enlaces de grabacion en la nube.'],
      warnings: ['Las actas sin la firma de responsabilidad del secretario y/o presidente carecen de validez oficial.']
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
    ],
    steps: [
      'Leer detenidamente la definicion del requerimiento en el modelo CACES vigente.',
      'Recopilar la informacion solicitada de las distintas dependencias.',
      'Revisar exhaustivamente la calidad y legibilidad del archivo final antes de subirlo.'
    ],
    tips: ['Mantenga un respaldo local ordenado de todos los archivos que suba a la plataforma.'],
    warnings: ['Cargar informacion falsa, alterada o incompleta perjudica el proceso de aseguramiento de la calidad.']
  };
};

export const buildRequirementWorkGuide = (indicator: Indicator, requirement: Requirement) => {
  const inferred = inferDocumentFocus(requirement);

  return {
    title: `Guia para ${requirement.label}`,
    intro: `Esta evidencia aporta al indicador ${indicator.code}: ${indicator.name}.`,
    focus: inferred.focus,
    checks: inferred.checks,
    supports: inferred.supports,
    steps: inferred.steps,
    tips: inferred.tips,
    warnings: inferred.warnings,
    format: formatList(requirement.format),
    cacesDescription: requirement.description
  };
};
