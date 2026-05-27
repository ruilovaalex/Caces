import { EvidenceTemplate, Indicator, Requirement, TemplateSection } from '../types';

interface TemplateContext {
  criterionName?: string;
  subCriterionName?: string;
}

const normalizeFileName = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .toUpperCase();

const section = (
  id: string,
  title: string,
  instruction: string,
  placeholder: string
): TemplateSection => ({
  id,
  title,
  instruction,
  placeholder,
  content: ''
});

const detectEvidenceKind = (requirement: Requirement) => {
  const text = `${requirement.label} ${requirement.description}`.toLowerCase();

  if (text.includes('normativa') || text.includes('reglamento') || text.includes('politica') || text.includes('procedimiento')) {
    return 'normativa';
  }

  if (text.includes('plan') || text.includes('poa') || text.includes('pedi') || text.includes('cronograma')) {
    return 'plan';
  }

  if (text.includes('informe') || text.includes('seguimiento') || text.includes('evaluacion') || text.includes('resultados')) {
    return 'informe';
  }

  if (text.includes('matriz') || text.includes('listado') || text.includes('nomina') || text.includes('inventario')) {
    return 'matriz';
  }

  if (text.includes('fotografia') || text.includes('fotografica') || text.includes('captura') || text.includes('plano') || text.includes('video')) {
    return 'visual';
  }

  if (text.includes('acta') || text.includes('convocatoria') || text.includes('asistencia') || text.includes('socializacion')) {
    return 'acta';
  }

  return 'general';
};

const baseSections = (indicator: Indicator, requirement: Requirement, context: TemplateContext) => [
  section(
    'identificacion',
    'Identificacion de la evidencia',
    'Registra criterio, subcriterio, indicador, evidencia, periodo y responsable.',
    `${context.criterionName || 'Criterio'} / ${context.subCriterionName || 'Subcriterio'} / ${indicator.code} - ${indicator.name}`
  ),
  section(
    'pertinencia',
    'Pertinencia con el indicador',
    'Explica por que este soporte responde directamente a lo solicitado por CACES.',
    requirement.description
  ),
  section(
    'validez',
    'Validez institucional',
    'Incluye aprobacion, firmas, fechas, unidad responsable o fuente institucional.',
    'Documento aprobado por..., fecha..., responsable...'
  ),
  section(
    'anexos',
    'Anexos y trazabilidad',
    'Lista los archivos, matrices, actas, capturas o soportes que acompanan la evidencia.',
    'Anexo 1..., Anexo 2..., fuente...'
  )
];

const kindSections = (kind: ReturnType<typeof detectEvidenceKind>) => {
  switch (kind) {
    case 'normativa':
      return [
        section('objeto', 'Objeto y alcance normativo', 'Define que regula el documento y a quienes aplica.', 'La normativa regula...'),
        section('aprobacion', 'Aprobacion y vigencia', 'Registra resolucion, acta, fecha y autoridad que aprueba.', 'Resolucion No..., vigente desde...')
      ];
    case 'plan':
      return [
        section('objetivos', 'Objetivos, metas y actividades', 'Resume los objetivos, metas, actividades e indicadores principales.', 'Objetivo..., meta..., actividad...'),
        section('seguimiento', 'Seguimiento del plan', 'Indica cronograma, responsables, recursos y mecanismo de seguimiento.', 'Responsable..., fecha..., indicador...')
      ];
    case 'informe':
      return [
        section('metodologia', 'Metodologia y periodo revisado', 'Explica como se levanto la informacion y que periodo cubre.', 'Periodo..., fuente..., metodologia...'),
        section('hallazgos', 'Resultados y acciones de mejora', 'Presenta resultados, conclusiones y acciones correctivas.', 'Resultado..., accion de mejora...')
      ];
    case 'matriz':
      return [
        section('campos', 'Campos de la matriz', 'Describe columnas, fuentes, responsables y periodo de actualizacion.', 'Codigo, carrera, responsable, estado...'),
        section('certificacion', 'Certificacion de datos', 'Indica quien certifica la matriz y de donde salen los datos.', 'Fuente institucional..., certificado por...')
      ];
    case 'visual':
      return [
        section('registro', 'Registro visual', 'Describe lugar, fecha, responsable y que demuestra cada imagen o captura.', 'Imagen 1: fecha, lugar, descripcion...'),
        section('constatacion', 'Constatacion y respaldo', 'Agrega acta, recorrido, fuente o validacion institucional si aplica.', 'Acta de constatacion..., responsable...')
      ];
    case 'acta':
      return [
        section('participantes', 'Participantes y convocatoria', 'Registra fecha, medio de convocatoria, asistentes y roles.', 'Convocatoria enviada..., participantes...'),
        section('acuerdos', 'Acuerdos y evidencias de participacion', 'Resume acuerdos, resultados, firmas y soportes.', 'Acuerdo 1..., lista de asistencia...')
      ];
    default:
      return [
        section('desarrollo', 'Desarrollo de la evidencia', 'Describe el contenido principal con datos verificables.', 'Detalle institucional...'),
        section('respaldo', 'Respaldo documental', 'Indica documentos y anexos que demuestran cumplimiento.', 'Soportes adjuntos...')
      ];
  }
};

const createTemplate = (
  option: number,
  title: string,
  description: string,
  indicator: Indicator,
  requirement: Requirement,
  context: TemplateContext,
  extraSections: TemplateSection[]
): EvidenceTemplate => ({
  id: `auto-${indicator.code}-${requirement.id}-${option}`,
  indicatorCode: indicator.code,
  requirementId: requirement.id,
  title,
  description,
  recommendedFileName: `SIG-EV-${normalizeFileName(indicator.code)}-${normalizeFileName(requirement.id)}-OPCION-${option}.${requirement.format.includes('XLS') ? 'xlsx' : 'pdf'}`,
  sections: [
    ...baseSections(indicator, requirement, context),
    ...extraSections
  ]
});

export const buildEvidenceTemplateOptions = (
  indicator: Indicator,
  requirement: Requirement,
  context: TemplateContext = {}
): EvidenceTemplate[] => {
  const kind = detectEvidenceKind(requirement);
  const specificSections = kindSections(kind);

  return [
    createTemplate(
      1,
      'Documento institucional completo',
      'Para presentar la evidencia como documento formal con contexto, validez y anexos.',
      indicator,
      requirement,
      context,
      specificSections
    ),
    createTemplate(
      2,
      'Matriz de cumplimiento',
      'Para organizar datos, responsables, fechas, estado y fuente de verificacion.',
      indicator,
      requirement,
      context,
      [
        section('tabla', 'Tabla de cumplimiento', 'Construye una matriz con responsable, actividad, estado y evidencia.', 'Responsable | Actividad | Estado | Soporte'),
        section('observaciones', 'Observaciones de cumplimiento', 'Registra brechas, pendientes o notas de control.', 'Observacion..., accion...')
      ]
    ),
    createTemplate(
      3,
      'Informe tecnico de respaldo',
      'Para explicar resultados, analisis y conclusiones de la evidencia.',
      indicator,
      requirement,
      context,
      [
        section('analisis', 'Analisis tecnico', 'Relaciona la evidencia con el criterio, subcriterio e indicador.', 'Analisis del cumplimiento...'),
        section('conclusiones', 'Conclusiones y recomendaciones', 'Cierra con estado de cumplimiento y acciones sugeridas.', 'Conclusion..., recomendacion...')
      ]
    ),
    createTemplate(
      4,
      'Expediente de anexos',
      'Para agrupar multiples soportes y explicar la trazabilidad de cada archivo.',
      indicator,
      requirement,
      context,
      [
        section('indice', 'Indice de anexos', 'Lista anexos con codigo, nombre, fecha y descripcion.', 'Anexo 1..., Anexo 2...'),
        section('trazabilidad', 'Trazabilidad documental', 'Explica de donde viene cada soporte y quien lo valida.', 'Fuente..., responsable..., fecha...')
      ]
    ),
    createTemplate(
      5,
      'Acta de constatacion o validacion',
      'Para dejar evidencia de revision, constatacion o validacion interna antes de subir.',
      indicator,
      requirement,
      context,
      [
        section('constatacion', 'Constatacion interna', 'Registra quien reviso la evidencia y que se verifico.', 'Fecha..., responsable..., verificacion...'),
        section('validacion', 'Resultado de validacion', 'Indica si queda lista, observada o pendiente antes de revision externa.', 'Resultado..., observaciones...')
      ]
    )
  ];
};
