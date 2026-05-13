import { EvidenceTemplate } from '../types';

export const EVIDENCE_TEMPLATES: EvidenceTemplate[] = [
  {
    id: 'temp-1.1.1-1',
    requirementId: 'req-1.1.1-1',
    indicatorCode: '1.1.1',
    title: 'Normativa interna sobre el sistema de planificación',
    description: 'Documento legal que establece las bases del sistema de planificación institucional.',
    recommendedFileName: 'SIG-EV-1.1.1-NORMATIVA-PLANIFICACION.pdf',
    sections: [
      { id: 'sec-1', title: 'Datos generales del documento', instruction: 'Nombre oficial, fecha de emisión y resolución de aprobación.', placeholder: 'Ej: Resolución No. 001-2025 del Consejo Superior...', content: '' },
      { id: 'sec-2', title: 'Objetivo de la normativa', instruction: 'Definir para qué sirve este reglamento.', placeholder: 'Establecer los lineamientos para la formulación, seguimiento y evaluación...', content: '' },
      { id: 'sec-3', title: 'Alcance', instruction: 'A qué áreas o procesos aplica.', placeholder: 'Aplica a todas las unidades académicas y administrativas...', content: '' },
      { id: 'sec-4', title: 'Responsables del sistema de planificación', instruction: 'Quiénes lideran el proceso.', placeholder: 'Rectorado, Dirección de Planificación, Directores de Área...', content: '' },
      { id: 'sec-5', title: 'Procedimiento para elaboración del PEDI', instruction: 'Pasos técnicos para el Plan Estratégico.', placeholder: '1. Diagnóstico, 2. Formulación de objetivos...', content: '' },
      { id: 'sec-6', title: 'Procedimiento para elaboración del POA', instruction: 'Pasos técnicos para el Plan Operativo.', placeholder: 'Definición de metas anuales, asignación presupuestaria...', content: '' },
      { id: 'sec-7', title: 'Seguimiento y control', instruction: 'Periodicidad y herramientas de control.', placeholder: 'Informes semestrales de avance de metas...', content: '' },
      { id: 'sec-8', title: 'Evaluación del cumplimiento', instruction: 'Cómo se mide el éxito al final del periodo.', placeholder: 'Indicadores de gestión y desempeño...', content: '' },
      { id: 'sec-9', title: 'Actualización del PEDI o POA', instruction: 'Casos en que se permite realizar cambios.', placeholder: 'Cambios en el presupuesto nacional, nuevas normativas...', content: '' },
      { id: 'sec-10', title: 'Aprobación y vigencia', instruction: 'Firmas y fecha de validez.', placeholder: 'Vigente a partir de su publicación el...', content: '' }
    ]
  },
  {
    id: 'temp-1.1.1-2',
    requirementId: 'req-1.1.1-2',
    indicatorCode: '1.1.1',
    title: 'PEDI aprobado y vigente',
    description: 'Plan Estratégico de Desarrollo Institucional.',
    recommendedFileName: 'SIG-EV-1.1.1-PEDI-2025-2030.pdf',
    sections: [
      { id: 's1', title: 'Portada institucional', instruction: 'Logo, nombre de la institución y título del plan.', placeholder: '[Inserte Portada]', content: '' },
      { id: 's2', title: 'Presentación', instruction: 'Palabras de la máxima autoridad.', placeholder: 'El presente PEDI marca el rumbo...', content: '' },
      { id: 's3', title: 'Diagnóstico interno', instruction: 'Fortalezas y debilidades.', placeholder: 'Capacidad docente, infraestructura...', content: '' },
      { id: 's4', title: 'Diagnóstico externo', instruction: 'Oportunidades y amenazas (PESTEL/FODA).', placeholder: 'Demanda del mercado laboral, cambios legales...', content: '' },
      { id: 's5', title: 'Misión institucional', instruction: 'Razón de ser de la IES.', placeholder: 'Somos una institución dedicada a...', content: '' },
      { id: 's6', title: 'Visión institucional', instruction: 'A dónde se quiere llegar.', placeholder: 'Ser referentes en educación tecnológica...', content: '' },
      { id: 's7', title: 'Objetivos estratégicos', instruction: 'Metas a largo plazo.', placeholder: '1. Excelencia académica, 2. Innovación...', content: '' },
      { id: 's8', title: 'Metas institucionales', instruction: 'Cuantificación de los objetivos.', placeholder: 'Lograr el 90% de titulación...', content: '' },
      { id: 's9', title: 'Relación con docencia, investigación y vinculación', instruction: 'Ejes sustantivos.', placeholder: 'Impacto en el aula y la sociedad...', content: '' },
      { id: 's10', title: 'Matriz de planificación estratégica', instruction: 'Cuadro resumen de estrategias.', placeholder: '[Inserte Matriz]', content: '' },
      { id: 's11', title: 'Aprobación institucional', instruction: 'Resolución o acta de aprobación.', placeholder: 'Aprobado por Consejo...', content: '' }
    ]
  },
  {
    id: 'temp-1.1.1-3',
    requirementId: 'req-1.1.1-3',
    indicatorCode: '1.1.1',
    title: 'POA correspondiente al periodo de evaluación',
    description: 'Plan Operativo Anual detallado.',
    recommendedFileName: 'SIG-EV-1.1.1-POA-2025.pdf',
    sections: [
      { id: 'p1', title: 'Datos generales', instruction: 'Año, unidad responsable.', placeholder: 'Año Fiscal 2025...', content: '' },
      { id: 'p2', title: 'Objetivos operativos', instruction: 'Qué se hará este año.', placeholder: 'Capacitación a 20 docentes...', content: '' },
      { id: 'p3', title: 'Actividades planificadas', instruction: 'Tareas específicas.', placeholder: 'Talleres de pedagogía, compra de equipos...', content: '' },
      { id: 'p4', title: 'Responsables', instruction: 'Quién ejecuta cada actividad.', placeholder: 'Coordinación Académica...', content: '' },
      { id: 'p5', title: 'Cronograma', instruction: 'Meses de ejecución.', placeholder: 'Feb - Dic 2025...', content: '' },
      { id: 'p6', title: 'Recursos', instruction: 'Presupuesto y materiales.', placeholder: 'Presupuesto: $10,000...', content: '' },
      { id: 'p7', title: 'Indicadores de cumplimiento', instruction: 'Cómo mediremos el avance.', placeholder: 'Número de certificados emitidos...', content: '' },
      { id: 'p8', title: 'Relación con el PEDI', instruction: 'A qué objetivo estratégico aporta.', placeholder: 'Aporta al Objetivo Estratégico 1...', content: '' },
      { id: 'p9', title: 'Estado de avance', instruction: 'Nivel actual de ejecución.', placeholder: '45% completado...', content: '' },
      { id: 'p10', title: 'Evidencias de cumplimiento', instruction: 'Qué se presentará al final.', placeholder: 'Informes, registros de asistencia...', content: '' }
    ]
  },
  {
    id: 'temp-1.1.1-4',
    requirementId: 'req-1.1.1-4',
    indicatorCode: '1.1.1',
    title: 'Evidencias de construcción o actualización de la planificación estratégica',
    description: 'Respaldo del proceso participativo.',
    recommendedFileName: 'SIG-EV-1.1.1-RESPALDO-CONSTRUCCION-PEDI.pdf',
    sections: [
      { id: 'c1', title: 'Antecedentes', instruction: 'Por qué se inició el proceso.', placeholder: 'Caducidad del plan anterior...', content: '' },
      { id: 'c2', title: 'Actores participantes', instruction: 'Docentes, estudiantes, personal.', placeholder: 'Representantes de cada facultad...', content: '' },
      { id: 'c3', title: 'Convocatorias realizadas', instruction: 'Fechas y medios de invitación.', placeholder: 'Correo institucional, oficio No. 12...', content: '' },
      { id: 'c4', title: 'Reuniones desarrolladas', instruction: 'Resumen de sesiones de trabajo.', placeholder: 'Sesión 1: Análisis FODA...', content: '' },
      { id: 'c5', title: 'Aportes recibidos', instruction: 'Ideas clave de los participantes.', placeholder: 'Mejora en laboratorios, becas...', content: '' },
      { id: 'c6', title: 'Diagnóstico participativo', instruction: 'Resultado del diálogo.', placeholder: 'Consenso sobre prioridades...', content: '' },
      { id: 'c7', title: 'Resultados del proceso', instruction: 'Qué se logró.', placeholder: 'Borrador final del PEDI aprobado...', content: '' },
      { id: 'c8', title: 'Anexos de respaldo', instruction: 'Fotos, actas, registros.', placeholder: '[Inserte actas y listas de asistencia]', content: '' }
    ]
  },
  {
    id: 'temp-1.1.1-5',
    requirementId: 'req-1.1.1-5',
    indicatorCode: '1.1.1',
    title: 'Evidencias del control y evaluación del cumplimiento del POA',
    description: 'Informes de seguimiento anual.',
    recommendedFileName: 'SIG-EV-1.1.1-EVALUACION-POA.pdf',
    sections: [
      { id: 'e1', title: 'Periodo evaluado', instruction: 'Indicar los meses revisados.', placeholder: 'Enero - Junio 2025...', content: '' },
      { id: 'e2', title: 'Objetivo del seguimiento', instruction: 'Para qué se hizo la evaluación.', placeholder: 'Verificar el cumplimiento de metas...', content: '' },
      { id: 'e3', title: 'Actividades revisadas', instruction: 'Listado de ítems evaluados.', placeholder: 'Proyectos de vinculación, docencia...', content: '' },
      { id: 'e4', title: 'Nivel de cumplimiento', instruction: 'Porcentaje o cualitativo.', placeholder: '80% de las metas alcanzadas...', content: '' },
      { id: 'e5', title: 'Responsables', instruction: 'Quién revisó la información.', placeholder: 'Unidad de Calidad...', content: '' },
      { id: 'e6', title: 'Dificultades encontradas', instruction: 'Cuellos de botella.', placeholder: 'Retraso en licitaciones...', content: '' },
      { id: 'e7', title: 'Acciones correctivas', instruction: 'Cambios realizados para mejorar.', placeholder: 'Reprogramación de actividades...', content: '' },
      { id: 'e8', title: 'Conclusiones', instruction: 'Resumen del estado institucional.', placeholder: 'Se requiere mayor presupuesto para...', content: '' },
      { id: 'e9', title: 'Anexos', instruction: 'Cuadros estadísticos, gráficos.', placeholder: '[Inserte Gráficos de cumplimiento]', content: '' }
    ]
  },
  {
    id: 'temp-1.1.1-6',
    requirementId: 'req-1.1.1-6',
    indicatorCode: '1.1.1',
    title: 'Entrevistas al responsable institucional de planificación',
    description: 'Guion y registro de entrevistas.',
    recommendedFileName: 'SIG-EV-1.1.1-REGISTRO-ENTREVISTAS.pdf',
    sections: [
      { id: 'v1', title: 'Datos de la entrevista', instruction: 'Fecha, lugar o medio.', placeholder: '15 de Mayo, Presencial...', content: '' },
      { id: 'v2', title: 'Objetivo de la entrevista', instruction: 'Qué se buscaba validar.', placeholder: 'Conocer el proceso de seguimiento...', content: '' },
      { id: 'v3', title: 'Responsable entrevistado', instruction: 'Cargo y nombre.', placeholder: 'Dr. Juan Pérez - Director Planificación...', content: '' },
      { id: 'v4', title: 'Preguntas aplicadas', instruction: 'Cuestionario base.', placeholder: '¿Cómo se elaboraron las metas?...', content: '' },
      { id: 'v5', title: 'Respuestas principales', instruction: 'Resumen de lo dicho.', placeholder: 'Se cuenta con software de gestión...', content: '' },
      { id: 'v6', title: 'Hallazgos', instruction: 'Información relevante descubierta.', placeholder: 'Falta socialización en áreas...', content: '' },
      { id: 'v7', title: 'Conclusiones', instruction: 'Interpretación de la entrevista.', placeholder: 'El responsable domina el proceso...', content: '' },
      { id: 'v8', title: 'Firma o respaldo', instruction: 'Validación del acto.', placeholder: '[Captura de pantalla o firma]', content: '' }
    ]
  }
];
