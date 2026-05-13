import { YearPeriod } from '../types';

export const MOCK_DATA: YearPeriod[] = [
  {
    year: 2025,
    criteria: [
      {
        id: "1",
        name: "CATEGORÍA 1: ORGANIZACIÓN",
        subCriteria: [
          {
            id: "1.1",
            name: "1.1 Planificación y desarrollo",
            indicators: [
              { 
                code: "1.1.1", 
                name: "Planificación estratégica y operativa", 
                status: "Pendiente", 
                description: "Evalúa el sistema de planificación cuyo centro es el PEDI ejecutado a través de POAs.", 
                requirements: [
                  { id: "1", label: "Normativa interna sobre el sistema de planificación", description: "Documento institucional aprobado y vigente que regula la elaboración, seguimiento, control, evaluación y actualización de la planificación institucional.", format: "PDF", status: "Pendiente" },
                  { id: "2", label: "PEDI aprobado y vigente durante el periodo de evaluación", description: "Plan Estratégico de Desarrollo Institucional aprobado oficialmente, con misión, visión, diagnóstico, objetivos estratégicos, metas y planificación institucional.", format: "PDF / XLSX", status: "Pendiente" },
                  { id: "3", label: "POA correspondiente al periodo de evaluación", description: "Plan Operativo Anual con actividades, responsables, fechas, recursos, indicadores de cumplimiento y relación con los objetivos del PEDI.", format: "PDF / XLSX", status: "Pendiente" },
                  { id: "4", label: "Evidencias de construcción o actualización de la planificación estratégica", description: "Actas, convocatorias, encuestas, entrevistas, diagnósticos, estudios, documentos de aportes y registros de participación de actores internos y externos.", format: "PDF / XLSX / ZIP / JPG / PNG", status: "Pendiente" },
                  { id: "5", label: "Evidencias del control y evaluación del cumplimiento del POA", description: "Informes de seguimiento, matrices de cumplimiento, actas de reuniones, reportes de avance, informes de evaluación y acciones correctivas.", format: "PDF / XLSX", status: "Pendiente" },
                  { id: "6", label: "Entrevistas al responsable institucional de planificación y responsables de áreas", description: "Guías de entrevista, actas, cronogramas o registros que evidencien la preparación para la verificación con responsables institucionales.", format: "PDF", status: "Pendiente" },
                  { id: "7", label: "Evidencias de modificaciones o actualizaciones del PEDI o POA", description: "Solicitudes de modificación, justificaciones, actas de discusión, documentos de autorización y versiones actualizadas del PEDI o POA.", format: "PDF / XLSX", status: "Pendiente" },
                  { id: "8", label: "Evidencias de divulgación del sistema de planificación", description: "Capturas de la web institucional, publicaciones, afiches, correos, socializaciones, fotos de carteleras, registros de asistencia y encuestas de conocimiento.", format: "PDF / JPG / PNG / ZIP", status: "Pendiente" },
                ] 
              },
              { 
                code: "1.1.2", 
                name: "Relaciones interinstitucionales", 
                status: "Pendiente", 
                description: "Convenios y redes académicas para el desarrollo institucional.", 
                requirements: [
                  { id: "1", label: "Convenios Vigentes con Firmas", description: "Documentos legales de cooperación.", format: "PDF", status: "Pendiente" }
                ] 
              }
            ]
          }
        ]
      }
    ]
  }
];
