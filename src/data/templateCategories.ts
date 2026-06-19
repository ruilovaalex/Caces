import { MOCK_DATA } from './cacesMockData';
import { TemplateCategory } from '../types';

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'criterio-1',
    label: MOCK_DATA[0].criteria[0].name,
    chipLabel: 'C1 ORGANIZACION',
    shortLabel: 'C1 ORGANIZACION',
    description: 'Plantillas para planificacion, seguimiento institucional, actas, informes y soporte de gestion.',
    templateIds: ['acta', 'informe', 'registro', 'oficio', 'documento'],
  },
  {
    id: 'criterio-2',
    label: MOCK_DATA[0].criteria[1].name,
    chipLabel: 'C2 INFRAESTRUCTURA',
    shortLabel: 'C2 INFRAESTRUCTURA',
    description: 'Modelos para constataciones, reportes, matrices y evidencias de recursos fisicos y tecnologicos.',
    templateIds: ['informe', 'registro', 'matriz', 'evidencia', 'oficio'],
  },
  {
    id: 'criterio-3',
    label: MOCK_DATA[0].criteria[2].name,
    chipLabel: 'C3 PROFESORES',
    shortLabel: 'C3 PROFESORES',
    description: 'Formatos para seguimiento docente, certificaciones, planes, registros y control de actividades.',
    templateIds: ['informe', 'registro', 'evidencia', 'certificado', 'matriz'],
  },
  {
    id: 'criterio-4',
    label: MOCK_DATA[0].criteria[3].name,
    chipLabel: 'C4 DOCENCIA',
    shortLabel: 'C4 DOCENCIA',
    description: 'Plantillas para programas, actas, evidencias de clase, cronogramas y seguimiento academico.',
    templateIds: ['plan', 'acta', 'registro', 'evidencia', 'cronograma'],
  },
  {
    id: 'criterio-5',
    label: MOCK_DATA[0].criteria[4].name,
    chipLabel: 'C5 INVESTIGACION',
    shortLabel: 'C5 INVESTIGACION',
    description: 'Apoyos para proyectos, productos, seguimiento y respaldo de resultados.',
    templateIds: ['plan', 'informe', 'evidencia', 'matriz', 'certificado'],
  },
  {
    id: 'criterio-6',
    label: MOCK_DATA[0].criteria[5].name,
    chipLabel: 'C6 VINCULACION',
    shortLabel: 'C6 VINCULACION',
    description: 'Modelos para convenios, actas, informes, evidencias y relacion con actores externos.',
    templateIds: ['convenio', 'acta', 'informe', 'evidencia', 'oficio'],
  },
];

export const FEATURED_TEMPLATE_IDS = ['acta', 'informe', 'registro', 'plan'];
