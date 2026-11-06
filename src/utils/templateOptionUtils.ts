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
    'Identificación de la evidencia',
    'Registra criterio, subcriterio, indicador, evidencia, periodo y responsable.',
    `${context.criterionName || 'Criterio'} / ${context.subCriterionName || 'Subcriterio'} / ${indicator.code} - ${indicator.name}`
  ),
  section(
    'pertinencia',
    'Pertinencia con el indicador',
    'Explica por qué este soporte responde directamente a lo solicitado por CACES.',
    requirement.description
  ),
  section(
    'validez',
    'Validez institucional',
    'Incluye aprobación, firmas, fechas, unidad responsable o fuente institucional.',
    'Documento aprobado por..., fecha..., responsable...'
  ),
  section(
    'anexos',
    'Anexos y trazabilidad',
    'Lista los archivos, matrices, actas, capturas o soportes que acompañan la evidencia.',
    'Anexo 1..., Anexo 2..., fuente...'
  )
];

const kindSections = (kind: ReturnType<typeof detectEvidenceKind>) => {
  switch (kind) {
    case 'normativa':
      return [
        section('objeto', 'Objeto y alcance normativo', 'Define qué regula el documento y a quiénes aplica.', 'La normativa regula...'),
        section('aprobacion', 'Aprobación y vigencia', 'Registra resolución, acta, fecha y autoridad que aprueba.', 'Resolución No..., vigente desde...')
      ];
    case 'plan':
      return [
        section('objetivos', 'Objetivos, metas y actividades', 'Resume los objetivos, metas, actividades e indicadores principales.', 'Objetivo..., meta..., actividad...'),
        section('seguimiento', 'Seguimiento del plan', 'Indica cronograma, responsables, recursos y mecanismo de seguimiento.', 'Responsable..., fecha..., indicador...')
      ];
    case 'informe':
      return [
        section('metodologia', 'Metodología y periodo revisado', 'Explica cómo se levantó la información y qué periodo cubre.', 'Periodo..., fuente..., metodología...'),
        section('hallazgos', 'Resultados y acciones de mejora', 'Presenta resultados, conclusiones y acciones correctivas.', 'Resultado..., acción de mejora...')
      ];
    case 'matriz':
      return [
        section('campos', 'Campos de la matriz', 'Describe columnas, fuentes, responsables y periodo de actualización.', 'Código, carrera, responsable, estado...'),
        section('certificacion', 'Certificación de datos', 'Indica quién certifica la matriz y de dónde salen los datos.', 'Fuente institucional..., certificado por...')
      ];
    case 'visual':
      return [
        section('registro', 'Registro visual', 'Describe lugar, fecha, responsable y qué demuestra cada imagen o captura.', 'Imagen 1: fecha, lugar, descripción...'),
        section('constatacion', 'Constatación y respaldo', 'Agrega acta, recorrido, fuente o validación institucional si aplica.', 'Acta de constatación..., responsable...')
      ];
    case 'acta':
      return [
        section('participantes', 'Participantes y convocatoria', 'Registra fecha, medio de convocatoria, asistentes y roles.', 'Convocatoria enviada..., participantes...'),
        section('acuerdos', 'Acuerdos y evidencias de participación', 'Resume acuerdos, resultados, firmas y soportes.', 'Acuerdo 1..., lista de asistencia...')
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
      'Para organizar datos, responsables, fechas, estado y fuente de verificación.',
      indicator,
      requirement,
      context,
      [
        section('tabla', 'Tabla de cumplimiento', 'Construye una matriz con responsable, actividad, estado y evidencia.', 'Responsable | Actividad | Estado | Soporte'),
        section('observaciones', 'Observaciones de cumplimiento', 'Registra brechas, pendientes o notas de control.', 'Observación..., acción...')
      ]
    ),
    createTemplate(
      3,
      'Informe técnico de respaldo',
      'Para explicar resultados, análisis y conclusiones de la evidencia.',
      indicator,
      requirement,
      context,
      [
        section('analisis', 'Análisis técnico', 'Relaciona la evidencia con el criterio, subcriterio e indicador.', 'Análisis del cumplimiento...'),
        section('conclusiones', 'Conclusiones y recomendaciones', 'Cierra con estado de cumplimiento y acciones sugeridas.', 'Conclusión..., recomendación...')
      ]
    ),
    createTemplate(
      4,
      'Expediente de anexos',
      'Para agrupar múltiples soportes y explicar la trazabilidad de cada archivo.',
      indicator,
      requirement,
      context,
      [
        section('indice', 'Índice de anexos', 'Lista anexos con código, nombre, fecha y descripción.', 'Anexo 1..., Anexo 2...'),
        section('trazabilidad', 'Trazabilidad documental', 'Explica de dónde viene cada soporte y quién lo valida.', 'Fuente..., responsable..., fecha...')
      ]
    ),
    createTemplate(
      5,
      'Acta de constatación o validación',
      'Para dejar evidencia de revisión, constatación o validación interna antes de subir.',
      indicator,
      requirement,
      context,
      [
        section('constatacion', 'Constatación interna', 'Registra quién revisó la evidencia y qué se verificó.', 'Fecha..., responsable..., verificación...'),
        section('validacion', 'Resultado de validación', 'Indica si queda lista, observada o pendiente antes de revisión externa.', 'Resultado..., observaciones...')
      ]
    )
  ];
};
