import { Requirement, YearPeriod } from '../types';

const evidence = (
  id: string,
  label: string,
  description: string,
  format = 'PDF',
): Requirement => ({
  id,
  label,
  description,
  format,
  status: 'Pendiente',
});

export const MOCK_DATA: YearPeriod[] = [
  {
    year: 2025,
    criteria: [
      {
        id: '1',
        name: 'CRITERIO 1: ORGANIZACIÓN',
        subCriteria: [
          {
            id: '1.1',
            name: '1.1 Planificación y desarrollo',
            indicators: [
              {
                code: '1.1.1',
                name: 'Planificación estratégica y operativa',
                status: 'Pendiente',
                description:
                  'Evalúa la existencia, actualización, ejecución, seguimiento y socialización de la planificación institucional, especialmente PEDI y POA.',
                requirements: [
                  evidence('1', 'Normativa interna del sistema de planificación', 'Reglamento, política o procedimiento aprobado que regula elaboración, seguimiento, evaluación y actualización de la planificación institucional.'),
                  evidence('2', 'PEDI aprobado y vigente', 'Plan estratégico institucional vigente durante el periodo de evaluación, con objetivos, metas, indicadores, responsables y alineación institucional.'),
                  evidence('3', 'POA del periodo de evaluación', 'Plan operativo anual con actividades, responsables, cronograma, recursos, indicadores de cumplimiento y relación con el PEDI.', 'PDF / XLSX'),
                  evidence('4', 'Seguimiento y evaluación del POA', 'Informes, matrices de cumplimiento, actas, reportes de avance y acciones correctivas aplicadas durante el periodo evaluado.', 'PDF / XLSX'),
                  evidence('5', 'Participación en la construcción o actualización de la planificación', 'Actas, convocatorias, registros de asistencia, encuestas, diagnósticos y aportes de actores internos y externos.', 'PDF / ZIP'),
                  evidence('6', 'Modificaciones del PEDI o POA', 'Solicitudes, justificaciones, aprobaciones y versiones actualizadas cuando existan cambios de la planificación.', 'PDF / XLSX'),
                  evidence('7', 'Divulgación de la planificación institucional', 'Capturas web, correos, publicaciones, carteleras, socializaciones, registros de asistencia o evidencias equivalentes.', 'PDF / JPG / PNG / ZIP'),
                ],
              },
              {
                code: '1.1.2',
                name: 'Relaciones interinstitucionales',
                status: 'Pendiente',
                description:
                  'Valora la planificación, ejecución, resultados y pertinencia de convenios, redes y relaciones externas para fortalecer las funciones sustantivas.',
                requirements: [
                  evidence('1', 'Normativa o lineamientos de relaciones interinstitucionales', 'Documento aprobado que define responsables, procedimientos, seguimiento y evaluación de convenios y redes.'),
                  evidence('2', 'Plan o matriz de relaciones interinstitucionales', 'Planificación de convenios, redes y alianzas vinculadas con docencia, investigación, vinculación o gestión institucional.', 'PDF / XLSX'),
                  evidence('3', 'Convenios vigentes y ejecutados', 'Convenios, cartas de intención o instrumentos equivalentes con firmas, vigencia, objeto, compromisos y responsables.'),
                  evidence('4', 'Evidencias de ejecución de convenios', 'Informes, actas, productos, certificados, registros de participación, fotografías o resultados generados por las relaciones externas.', 'PDF / ZIP'),
                  evidence('5', 'Participación en redes académicas o del entorno', 'Documentos que demuestren integración y participación efectiva en redes académicas, productivas, sociales o de servicios.', 'PDF / ZIP'),
                ],
              },
              {
                code: '1.1.3',
                name: 'Aseguramiento interno de la calidad',
                status: 'Pendiente',
                description:
                  'Evalúa la existencia y funcionamiento del sistema o área institucional responsable del aseguramiento interno de la calidad.',
                requirements: [
                  evidence('1', 'Normativa interna del aseguramiento de la calidad', 'Reglamento, política o resolución que formaliza el sistema, unidad o comisión de aseguramiento interno de la calidad.'),
                  evidence('2', 'Plan de aseguramiento interno de la calidad', 'Plan anual o plurianual con procesos, actividades, responsables, cronograma e indicadores de seguimiento.', 'PDF / XLSX'),
                  evidence('3', 'Informes de autoevaluación y seguimiento', 'Reportes de evaluación interna, análisis de resultados, planes de mejora y seguimiento al cumplimiento.'),
                  evidence('4', 'Evidencias de socialización del AIC', 'Registros de capacitación, socialización y divulgación del sistema de calidad ante la comunidad educativa.', 'PDF / ZIP'),
                  evidence('5', 'Actas o productos de comités de calidad', 'Actas, resoluciones, matrices de acuerdos y evidencias de decisiones adoptadas por órganos responsables de calidad.'),
                ],
              },
              {
                code: '1.1.4',
                name: 'Sistema informático de gestión',
                status: 'Pendiente',
                description:
                  'Revisa la disponibilidad, regulación, operación, soporte y uso del sistema informático de gestión institucional y documental.',
                requirements: [
                  evidence('1', 'Reglamento del sistema informático de gestión', 'Normativa aprobada y vigente del SIG, incluyendo gestión documental, seguridad, perfiles y responsabilidades.'),
                  evidence('2', 'Manuales de usuario del SIG', 'Manuales o instructivos actualizados para los usuarios y administradores del sistema.'),
                  evidence('3', 'Constatación funcional del SIG', 'Capturas, reportes o actas que evidencien módulos, usuarios, repositorio documental y funcionalidades disponibles.', 'PDF / PNG / ZIP'),
                  evidence('4', 'Soporte técnico y operatividad del SIG', 'Contratos, informes de soporte, bitácoras, reportes de incidencias y evidencias de disponibilidad del sistema.', 'PDF / XLSX'),
                  evidence('5', 'Capacitación de usuarios del SIG', 'Programas, registros de asistencia, materiales, evaluaciones o videos que demuestren capacitación en el uso del sistema.', 'PDF / ZIP'),
                  evidence('6', 'Repositorio documental institucional', 'Evidencias de documentos cargados, organizados y administrados en el sistema de gestión documental.', 'PDF / PNG / ZIP'),
                ],
              },
            ],
          },
          {
            id: '1.2',
            name: '1.2 Gestión social',
            indicators: [
              {
                code: '1.2.1',
                name: 'Igualdad de oportunidades',
                status: 'Pendiente',
                description:
                  'Evalúa acciones afirmativas, inclusión, no discriminación y apoyo a personas en condición de vulnerabilidad.',
                requirements: [
                  evidence('1', 'Normativa de acción afirmativa e igualdad', 'Política, reglamento o resolución institucional sobre igualdad de oportunidades, inclusión y no discriminación.'),
                  evidence('2', 'Plan o programa de acciones afirmativas', 'Planificación de becas, ayudas, apoyos pedagógicos, adaptaciones y servicios para grupos vulnerables.', 'PDF / XLSX'),
                  evidence('3', 'Beneficiarios de acciones afirmativas', 'Listados certificados, expedientes, resoluciones, descuentos, becas, ayudas económicas o apoyos otorgados.', 'PDF / XLSX'),
                  evidence('4', 'Seguimiento de permanencia y rendimiento', 'Informes o matrices de seguimiento de estudiantes beneficiados y resultados de las acciones implementadas.', 'PDF / XLSX'),
                  evidence('5', 'Socialización y atención de casos', 'Campañas, talleres, registros de atención, entrevistas o mecanismos de denuncia y respuesta institucional.', 'PDF / ZIP'),
                ],
              },
              {
                code: '1.2.2',
                name: 'Ética y transparencia',
                status: 'Pendiente',
                description:
                  'Analiza la existencia y aplicación de normas, mecanismos y prácticas institucionales de ética, integridad y transparencia.',
                requirements: [
                  evidence('1', 'Código de ética o convivencia', 'Código, reglamento o normativa aprobada que define principios éticos, deberes, prohibiciones y procedimientos.'),
                  evidence('2', 'Mecanismos de transparencia institucional', 'Publicaciones, portales, informes de rendición de cuentas, acceso a información y canales formales de comunicación.', 'PDF / PNG / ZIP'),
                  evidence('3', 'Gestión de conflictos o denuncias', 'Protocolos, registros anonimizados, actas, resoluciones o informes sobre atención de conflictos éticos.'),
                  evidence('4', 'Capacitación en ética y transparencia', 'Planes, materiales, registros de asistencia y evidencias de actividades formativas para la comunidad educativa.', 'PDF / ZIP'),
                ],
              },
              {
                code: '1.2.3',
                name: 'Bienestar psicológico',
                status: 'Pendiente',
                description:
                  'Evalúa la planificación, atención, prevención y seguimiento de bienestar psicológico para estudiantes y comunidad educativa.',
                requirements: [
                  evidence('1', 'Política o protocolo de bienestar psicológico', 'Documento aprobado que regula prevención, atención, derivación, confidencialidad y seguimiento.'),
                  evidence('2', 'Plan anual de bienestar psicológico', 'Cronograma de campañas, talleres, atención individual, seguimiento y actividades de promoción de salud mental.', 'PDF / XLSX'),
                  evidence('3', 'Registros de atención psicológica', 'Reportes anonimizados, fichas estadísticas, derivaciones, seguimiento de casos y resultados agregados.', 'PDF / XLSX'),
                  evidence('4', 'Campañas y actividades preventivas', 'Evidencias de talleres, charlas, materiales, fotografías, convocatorias y registros de asistencia.', 'PDF / ZIP'),
                ],
              },
            ],
          },
        ],
      },
      {
        id: '2',
        name: 'CRITERIO 2: INFRAESTRUCTURA',
        subCriteria: [
          {
            id: '2.1',
            name: '2.1 Infraestructura básica',
            indicators: [
              {
                code: '2.1.1',
                name: 'Espacios de bienestar',
                status: 'Pendiente',
                description:
                  'Valora condiciones, disponibilidad, mantenimiento y uso de espacios destinados al bienestar y esparcimiento de la comunidad educativa.',
                requirements: [
                  evidence('1', 'Inventario de espacios de bienestar', 'Listado de espacios físicos disponibles con ubicación, capacidad, estado y uso previsto.', 'PDF / XLSX'),
                  evidence('2', 'Evidencia fotográfica y planos', 'Fotografías, planos, croquis o recorridos que demuestren existencia, condiciones y accesibilidad de los espacios.', 'PDF / JPG / PNG / ZIP'),
                  evidence('3', 'Mantenimiento y adecuaciones', 'Contratos, órdenes de trabajo, informes o bitácoras de mantenimiento preventivo y correctivo.', 'PDF / XLSX'),
                  evidence('4', 'Uso y satisfacción de usuarios', 'Registros de uso, encuestas, informes de bienestar o evidencias de actividades realizadas en esos espacios.', 'PDF / XLSX'),
                ],
              },
              {
                code: '2.1.2',
                name: 'Accesibilidad física',
                status: 'Pendiente',
                description:
                  'Evalúa condiciones de accesibilidad, movilidad, señalética y eliminación de barreras físicas en instalaciones institucionales.',
                requirements: [
                  evidence('1', 'Diagnóstico de accesibilidad física', 'Informe técnico sobre rampas, circulaciones, baterías sanitarias, señalética, ingresos y barreras identificadas.'),
                  evidence('2', 'Plan de adecuaciones de accesibilidad', 'Plan de mejoras con responsables, presupuesto, cronograma y seguimiento de ejecución.', 'PDF / XLSX'),
                  evidence('3', 'Evidencias de infraestructura accesible', 'Fotografías, planos, fichas técnicas y actas de constatación de adecuaciones implementadas.', 'PDF / JPG / PNG / ZIP'),
                  evidence('4', 'Mantenimiento de condiciones de accesibilidad', 'Bitácoras, órdenes de trabajo o informes de mantenimiento de elementos de accesibilidad.', 'PDF / XLSX'),
                ],
              },
              {
                code: '2.1.3',
                name: 'Puestos de trabajo de los profesores TC',
                status: 'Pendiente',
                description:
                  'Revisa la disponibilidad, condiciones y equipamiento de puestos de trabajo para profesores de tiempo completo.',
                requirements: [
                  evidence('1', 'Inventario de puestos para profesores TC', 'Listado de puestos disponibles, ubicación, asignación, mobiliario y equipamiento.', 'PDF / XLSX'),
                  evidence('2', 'Listado certificado de profesores TC', 'Nómina de profesores de tiempo completo durante el periodo evaluado y sus asignaciones institucionales.', 'PDF / XLSX'),
                  evidence('3', 'Evidencia fotográfica de puestos de trabajo', 'Fotografías o actas de constatación de espacios, mobiliario, conectividad y condiciones de uso.', 'PDF / JPG / PNG / ZIP'),
                  evidence('4', 'Mantenimiento y dotación de recursos', 'Registros de mantenimiento, adquisición o reposición de mobiliario y equipos para puestos docentes.', 'PDF / XLSX'),
                ],
              },
              {
                code: '2.1.4',
                name: 'Ancho de banda',
                status: 'Pendiente',
                description:
                  'Evalúa la suficiencia del servicio de internet respecto a usuarios, jornadas, instalaciones y condiciones contratadas.',
                requirements: [
                  evidence('1', 'Contratos vigentes de internet', 'Contratos que indiquen proveedor, ancho de banda, ubicación, condiciones de prestación y vigencia.'),
                  evidence('2', 'Facturas de pago del servicio de internet', 'Facturas del periodo evaluado que demuestren continuidad y servicio efectivamente recibido.', 'PDF / XLSX'),
                  evidence('3', 'Usuarios considerados para el cálculo', 'Listados certificados de estudiantes, docentes y administrativos por jornada, sede, carrera o modalidad.', 'PDF / XLSX'),
                  evidence('4', 'Reportes de conectividad y disponibilidad', 'Mediciones, capturas, informes técnicos o bitácoras de desempeño y soporte de conectividad.', 'PDF / XLSX / PNG'),
                ],
              },
            ],
          },
        ],
      },
      {
        id: '3',
        name: 'CRITERIO 3: PROFESORES',
        subCriteria: [
          {
            id: '3.1',
            name: '3.1 Selección y formación previa',
            indicators: [
              {
                code: '3.1.1',
                name: 'Selección de profesores',
                status: 'Pendiente',
                description:
                  'Valora procesos transparentes, técnicos y justos de selección docente y concursos de titularidad.',
                requirements: [
                  evidence('1', 'Normativa de selección docente', 'Reglamento o procedimiento aprobado para selección, contratación y concursos de méritos y oposición.'),
                  evidence('2', 'Convocatorias y bases de concursos', 'Publicaciones, requisitos, perfiles, cronogramas y criterios de evaluación utilizados en procesos de selección.', 'PDF / ZIP'),
                  evidence('3', 'Expedientes de selección', 'Actas, matrices de calificación, hojas de vida, informes de comisión y resultados de procesos ejecutados.', 'PDF / XLSX / ZIP'),
                  evidence('4', 'Contratos o nombramientos docentes', 'Documentos que respalden la vinculación final de profesores seleccionados.', 'PDF / ZIP'),
                ],
              },
              {
                code: '3.1.2',
                name: 'Formación de posgrado',
                status: 'Pendiente',
                description:
                  'Mide la formación académica de posgrado de los profesores y su pertinencia con las áreas de docencia.',
                requirements: [
                  evidence('1', 'Nómina certificada de profesores', 'Listado de profesores con dedicación, asignaturas, carreras y periodo de vinculación.', 'PDF / XLSX'),
                  evidence('2', 'Títulos de posgrado registrados', 'Copias o reportes oficiales de títulos de cuarto nivel y registros correspondientes.', 'PDF / ZIP'),
                  evidence('3', 'Matriz de pertinencia formación-docencia', 'Relación entre formación de posgrado, campo de conocimiento, asignaturas y carreras impartidas.', 'PDF / XLSX'),
                ],
              },
              {
                code: '3.1.3',
                name: 'Experiencia profesional práctica de profesores TC de contenidos profesionales',
                status: 'Pendiente',
                description:
                  'Evalúa experiencia profesional práctica de profesores de tiempo completo que imparten contenidos profesionales.',
                requirements: [
                  evidence('1', 'Matriz de profesores TC de contenidos profesionales', 'Listado de profesores, asignaturas, carrera, dedicación y clasificación del contenido impartido.', 'PDF / XLSX'),
                  evidence('2', 'Certificados de experiencia profesional', 'Certificados laborales, contratos, RUC, nombramientos o documentos equivalentes que respalden experiencia práctica.', 'PDF / ZIP'),
                  evidence('3', 'Relación experiencia-asignatura', 'Análisis de correspondencia entre experiencia profesional y contenidos profesionales impartidos.', 'PDF / XLSX'),
                ],
              },
              {
                code: '3.1.4',
                name: 'Ejercicio profesional práctico de profesores MT y TP de contenidos profesionales',
                status: 'Pendiente',
                description:
                  'Valora el ejercicio profesional práctico vigente de profesores de medio tiempo y tiempo parcial que imparten contenidos profesionales.',
                requirements: [
                  evidence('1', 'Matriz de profesores MT y TP', 'Listado de profesores, dedicación, asignaturas, carrera y contenidos profesionales impartidos.', 'PDF / XLSX'),
                  evidence('2', 'Evidencias de ejercicio profesional vigente', 'Contratos, certificados laborales, facturas, RUC, nombramientos o documentos de actividad profesional actual.', 'PDF / ZIP'),
                  evidence('3', 'Pertinencia del ejercicio profesional', 'Análisis de relación entre la práctica profesional y las asignaturas impartidas.', 'PDF / XLSX'),
                ],
              },
            ],
          },
          {
            id: '3.2',
            name: '3.2 Organización y desarrollo',
            indicators: [
              {
                code: '3.2.1',
                name: 'Titularidad de profesores TC y MT',
                status: 'Pendiente',
                description:
                  'Mide la presencia de profesores titulares de tiempo completo y medio tiempo en la planta docente.',
                requirements: [
                  evidence('1', 'Nómina certificada de profesores TC y MT', 'Listado por dedicación, relación laboral, titularidad, carrera y periodo evaluado.', 'PDF / XLSX'),
                  evidence('2', 'Nombramientos o contratos de titularidad', 'Documentos que acrediten la condición de profesor titular.', 'PDF / ZIP'),
                  evidence('3', 'Cálculo institucional del indicador', 'Matriz con variables, fórmula aplicada y resultado del indicador cuantitativo.', 'PDF / XLSX'),
                ],
              },
              {
                code: '3.2.2',
                name: 'Formación académica en curso y capacitación',
                status: 'Pendiente',
                description:
                  'Evalúa estudios en curso, capacitación y actualización de profesores durante el periodo evaluado.',
                requirements: [
                  evidence('1', 'Plan de capacitación docente', 'Plan aprobado con diagnóstico, objetivos, actividades, cronograma, presupuesto y responsables.', 'PDF / XLSX'),
                  evidence('2', 'Registros de capacitación ejecutada', 'Certificados, listas de asistencia, programas, evaluaciones y evidencias de cursos o talleres.', 'PDF / ZIP'),
                  evidence('3', 'Profesores con formación académica en curso', 'Matrículas, certificados de inscripción o avance en maestrías, doctorados u otros programas pertinentes.', 'PDF / ZIP'),
                  evidence('4', 'Evaluación de resultados de capacitación', 'Informes que relacionen capacitación con mejora docente, desempeño o necesidades institucionales.', 'PDF / XLSX'),
                ],
              },
              {
                code: '3.2.3',
                name: 'Carga horaria semanal de los profesores TC',
                status: 'Pendiente',
                description:
                  'Analiza la distribución equilibrada de horas de docencia, gestión, investigación, vinculación y otras actividades de profesores TC.',
                requirements: [
                  evidence('1', 'Distributivos de carga horaria', 'Asignación semanal de actividades por profesor TC, carrera, periodo académico y función sustantiva.', 'PDF / XLSX'),
                  evidence('2', 'Nómina de profesores TC', 'Listado certificado de profesores de tiempo completo incluidos en el cálculo.', 'PDF / XLSX'),
                  evidence('3', 'Informes de cumplimiento de carga horaria', 'Reportes, registros o evidencias de ejecución de actividades asignadas.', 'PDF / XLSX / ZIP'),
                ],
              },
              {
                code: '3.2.4',
                name: 'Evaluación de profesores',
                status: 'Pendiente',
                description:
                  'Revisa la planificación, aplicación, resultados y uso de la evaluación integral del desempeño docente.',
                requirements: [
                  evidence('1', 'Normativa de evaluación docente', 'Reglamento, procedimiento o instrumento aprobado para evaluación integral de profesores.'),
                  evidence('2', 'Instrumentos y reportes de evaluación', 'Encuestas, rúbricas, reportes del sistema y resultados por periodo académico.', 'PDF / XLSX'),
                  evidence('3', 'Socialización de resultados', 'Actas, comunicaciones, reportes individuales o institucionales entregados a profesores y autoridades.', 'PDF / ZIP'),
                  evidence('4', 'Planes de mejora docente', 'Acciones derivadas de resultados de evaluación, seguimiento y evidencias de cumplimiento.', 'PDF / XLSX'),
                ],
              },
            ],
          },
          {
            id: '3.3',
            name: '3.3 Remuneraciones',
            indicators: [
              {
                code: '3.3.1',
                name: 'Remuneración promedio mensual TC',
                status: 'Pendiente',
                description:
                  'Mide la remuneración promedio mensual de profesores de tiempo completo respecto a condiciones establecidas por el modelo.',
                requirements: [
                  evidence('1', 'Nómina de profesores TC remunerados', 'Listado certificado de profesores TC, remuneración mensual, tiempo de vinculación y periodo considerado.', 'PDF / XLSX'),
                  evidence('2', 'Roles de pago o comprobantes', 'Roles, comprobantes, transferencias o documentos equivalentes que respalden remuneraciones pagadas.', 'PDF / ZIP'),
                  evidence('3', 'Contratos o nombramientos TC', 'Documentos laborales que indiquen dedicación, remuneración y vigencia.', 'PDF / ZIP'),
                  evidence('4', 'Cálculo del indicador', 'Matriz con variables, fórmula aplicada, exclusiones justificadas y resultado final.', 'PDF / XLSX'),
                ],
              },
              {
                code: '3.3.2',
                name: 'Remuneración promedio por hora TP',
                status: 'Pendiente',
                description:
                  'Mide la remuneración promedio por hora de profesores de tiempo parcial.',
                requirements: [
                  evidence('1', 'Nómina de profesores TP', 'Listado certificado de profesores de tiempo parcial, horas contratadas, asignaturas y periodo.', 'PDF / XLSX'),
                  evidence('2', 'Roles de pago, facturas o comprobantes', 'Documentos de pago correspondientes a profesores TP durante el periodo evaluado.', 'PDF / ZIP'),
                  evidence('3', 'Contratos de profesores TP', 'Contratos que indiquen horas, valor, vigencia y actividad docente.', 'PDF / ZIP'),
                  evidence('4', 'Cálculo del indicador', 'Matriz con variables, fórmula aplicada y resultado de remuneración promedio por hora.', 'PDF / XLSX'),
                ],
              },
            ],
          },
        ],
      },
      {
        id: '4',
        name: 'CRITERIO 4: DOCENCIA',
        subCriteria: [
          {
            id: '4.1',
            name: '4.1 Formación académica',
            indicators: [
              {
                code: '4.1.1',
                name: 'Programas de estudio de las asignaturas',
                status: 'Pendiente',
                description:
                  'Evalúa pertinencia, estructura, actualización y aplicación de programas de estudio de asignaturas.',
                requirements: [
                  evidence('1', 'Programas de estudio vigentes', 'Sílabos o programas de asignaturas con objetivos, contenidos, metodología, evaluación y bibliografía.', 'PDF / ZIP'),
                  evidence('2', 'Procedimiento de elaboración y aprobación', 'Normativa, actas o resoluciones de aprobación y actualización de programas de estudio.'),
                  evidence('3', 'Matriz de correspondencia curricular', 'Relación entre asignaturas, resultados de aprendizaje, perfil de egreso y malla curricular.', 'PDF / XLSX'),
                  evidence('4', 'Seguimiento a la ejecución de programas', 'Informes, registros de avance, controles académicos o evidencias de cumplimiento.', 'PDF / XLSX'),
                ],
              },
              {
                code: '4.1.2',
                name: 'Afinidad formación-docencia',
                status: 'Pendiente',
                description:
                  'Mide la correspondencia entre formación académica de profesores y asignaturas que imparten.',
                requirements: [
                  evidence('1', 'Matriz formación-docencia', 'Relación profesor, título, campo de conocimiento, asignaturas y carrera.', 'PDF / XLSX'),
                  evidence('2', 'Títulos y registros de profesores', 'Documentación de formación académica y registros oficiales disponibles.', 'PDF / ZIP'),
                  evidence('3', 'Distributivos académicos', 'Asignación docente por periodo, carrera y asignatura.', 'PDF / XLSX'),
                ],
              },
              {
                code: '4.1.3',
                name: 'Asignaturas con cobertura bibliográfica adecuada',
                status: 'Pendiente',
                description:
                  'Evalúa disponibilidad y pertinencia de bibliografía física o digital para las asignaturas.',
                requirements: [
                  evidence('1', 'Matriz asignatura-bibliografía', 'Relación entre asignaturas, textos básicos, complementarios, disponibilidad y número de ejemplares o accesos.', 'PDF / XLSX'),
                  evidence('2', 'Catálogo bibliográfico institucional', 'Reportes del sistema bibliotecario, bases digitales, inventario o repositorio de recursos bibliográficos.', 'PDF / XLSX'),
                  evidence('3', 'Programas de estudio con bibliografía', 'Sílabos que evidencien bibliografía actualizada y alineada con contenidos.', 'PDF / ZIP'),
                  evidence('4', 'Adquisición o actualización bibliográfica', 'Facturas, contratos, licencias, donaciones o registros de adquisición de recursos.', 'PDF / ZIP'),
                ],
              },
              {
                code: '4.1.4',
                name: 'Formación de posgrado en curso',
                status: 'Pendiente',
                description:
                  'Valora profesores que cursan programas de posgrado pertinentes para elevar el nivel académico institucional.',
                requirements: [
                  evidence('1', 'Nómina de profesores en posgrado', 'Listado de profesores con programa, institución, nivel, estado y pertinencia.', 'PDF / XLSX'),
                  evidence('2', 'Certificados de matrícula o avance', 'Documentos que demuestren estudios de posgrado en curso durante el periodo evaluado.', 'PDF / ZIP'),
                  evidence('3', 'Plan de apoyo institucional', 'Becas, licencias, convenios, horarios o acciones de apoyo para estudios de posgrado.', 'PDF / XLSX'),
                ],
              },
              {
                code: '4.1.5',
                name: 'Evaluación del aprendizaje',
                status: 'Pendiente',
                description:
                  'Evalúa políticas, instrumentos, aplicación y retroalimentación de la evaluación del aprendizaje estudiantil.',
                requirements: [
                  evidence('1', 'Normativa de evaluación del aprendizaje', 'Reglamento o procedimiento académico sobre evaluación, calificación, recuperación y retroalimentación.'),
                  evidence('2', 'Instrumentos de evaluación aplicados', 'Rúbricas, pruebas, proyectos, portafolios y evidencias de aplicación en asignaturas.', 'PDF / ZIP'),
                  evidence('3', 'Registros de calificaciones y retroalimentación', 'Reportes del sistema académico, actas, muestras de retroalimentación y seguimiento.', 'PDF / XLSX / ZIP'),
                  evidence('4', 'Análisis de resultados de aprendizaje', 'Informes por carrera o asignatura con acciones de mejora derivadas.', 'PDF / XLSX'),
                ],
              },
              {
                code: '4.1.6',
                name: 'Seguimiento, control y evaluación del proceso docente',
                status: 'Pendiente',
                description:
                  'Revisa mecanismos institucionales para dar seguimiento al desarrollo del proceso docente.',
                requirements: [
                  evidence('1', 'Plan de seguimiento académico', 'Plan o procedimiento para monitoreo de clases, cumplimiento de sílabos y desempeño académico.', 'PDF / XLSX'),
                  evidence('2', 'Registros de seguimiento docente', 'Informes de observación, controles de avance, actas de coordinación y reportes de cumplimiento.', 'PDF / XLSX / ZIP'),
                  evidence('3', 'Acciones correctivas académicas', 'Planes de mejora, compromisos, seguimiento y cierre de acciones derivadas del monitoreo.', 'PDF / XLSX'),
                ],
              },
              {
                code: '4.1.7',
                name: 'Producción de libros de texto',
                status: 'Pendiente',
                description:
                  'Valora la producción, pertinencia y uso de libros de texto o materiales académicos desarrollados por profesores.',
                requirements: [
                  evidence('1', 'Libros o textos producidos', 'Textos publicados, manuales académicos, ISBN cuando aplique, o materiales institucionales formalizados.', 'PDF / ZIP'),
                  evidence('2', 'Aprobación y uso académico', 'Actas, resoluciones, programas de estudio o evidencias de uso en asignaturas.', 'PDF / ZIP'),
                  evidence('3', 'Autoría y pertinencia curricular', 'Matriz que relacione autores, asignaturas, carreras y contenidos cubiertos.', 'PDF / XLSX'),
                ],
              },
              {
                code: '4.1.8',
                name: 'Acompañamiento pedagógico a estudiantes',
                status: 'Pendiente',
                description:
                  'Evalúa tutorías, nivelación, acompañamiento y apoyo académico a estudiantes.',
                requirements: [
                  evidence('1', 'Plan de acompañamiento pedagógico', 'Plan de tutorías, nivelación, orientación académica y seguimiento a estudiantes.', 'PDF / XLSX'),
                  evidence('2', 'Registros de tutorías y acompañamiento', 'Listas de asistencia, fichas, reportes, agendas o evidencias de atención individual y grupal.', 'PDF / XLSX / ZIP'),
                  evidence('3', 'Resultados y seguimiento de casos', 'Informes de avance, permanencia, aprobación, deserción o mejora académica asociada.', 'PDF / XLSX'),
                ],
              },
              {
                code: '4.1.9',
                name: 'Relación con los graduados',
                status: 'Pendiente',
                description:
                  'Evalúa mecanismos de seguimiento, contacto, retroalimentación e inserción de graduados.',
                requirements: [
                  evidence('1', 'Base certificada de graduados', 'Listado actualizado de graduados por carrera, cohorte, contacto y situación laboral cuando esté disponible.', 'PDF / XLSX'),
                  evidence('2', 'Plan o sistema de seguimiento a graduados', 'Procedimiento, instrumentos, encuestas, entrevistas y responsables del seguimiento.', 'PDF / XLSX'),
                  evidence('3', 'Informes de resultados de seguimiento', 'Reportes de empleabilidad, pertinencia de formación, satisfacción y retroalimentación curricular.', 'PDF / XLSX'),
                  evidence('4', 'Actividades con graduados', 'Convocatorias, eventos, redes, bolsas de empleo, charlas o mecanismos de vinculación con graduados.', 'PDF / ZIP'),
                ],
              },
            ],
          },
          {
            id: '4.2',
            name: '4.2 Informatización del proceso de enseñanza',
            indicators: [
              {
                code: '4.2.1',
                name: 'Entorno virtual de aprendizaje',
                status: 'Pendiente',
                description:
                  'Evalúa disponibilidad, uso, soporte y calidad del entorno virtual de aprendizaje.',
                requirements: [
                  evidence('1', 'Reglamento o lineamientos del EVA', 'Normativa de uso, administración, seguridad, roles y soporte del entorno virtual.'),
                  evidence('2', 'Cursos activos en el EVA', 'Reportes por asignatura, carrera, profesor, estudiantes y recursos disponibles.', 'PDF / XLSX / PNG'),
                  evidence('3', 'Interacción y actividades virtuales', 'Capturas, reportes de tareas, foros, evaluaciones, recursos y participación de usuarios.', 'PDF / PNG / ZIP'),
                  evidence('4', 'Capacitación y soporte del EVA', 'Registros de capacitación, manuales, tickets de soporte y reportes de disponibilidad.', 'PDF / ZIP'),
                ],
              },
              {
                code: '4.2.2',
                name: 'Informatización en el aprendizaje',
                status: 'Pendiente',
                description:
                  'Valora la incorporación efectiva de herramientas TIC, software y recursos digitales en el aprendizaje.',
                requirements: [
                  evidence('1', 'Plan de informatización del aprendizaje', 'Plan institucional para uso de TIC, software, laboratorios virtuales o recursos digitales.', 'PDF / XLSX'),
                  evidence('2', 'Evidencias de uso de TIC en asignaturas', 'Programas de estudio, capturas, actividades, proyectos o evaluaciones que integran recursos digitales.', 'PDF / ZIP'),
                  evidence('3', 'Licencias, plataformas o software académico', 'Contratos, licencias, inventarios, accesos y manuales de herramientas utilizadas.', 'PDF / ZIP'),
                  evidence('4', 'Capacitación en herramientas digitales', 'Registros de formación de docentes y estudiantes para uso de tecnologías de aprendizaje.', 'PDF / ZIP'),
                ],
              },
            ],
          },
          {
            id: '4.3',
            name: '4.3 Formación ciudadana',
            indicators: [
              {
                code: '4.3.1',
                name: 'Educación ambiental y desarrollo sostenible',
                status: 'Pendiente',
                description:
                  'Evalúa la integración de educación ambiental y sostenibilidad en formación, actividades y cultura institucional.',
                requirements: [
                  evidence('1', 'Plan de educación ambiental', 'Plan, programa o política institucional de sostenibilidad y educación ambiental.', 'PDF / XLSX'),
                  evidence('2', 'Actividades ambientales ejecutadas', 'Campañas, proyectos, talleres, registros de asistencia, fotografías e informes de resultados.', 'PDF / ZIP'),
                  evidence('3', 'Integración curricular de sostenibilidad', 'Programas de estudio o proyectos académicos que incorporen ambiente y desarrollo sostenible.', 'PDF / ZIP'),
                  evidence('4', 'Gestión ambiental institucional', 'Evidencias de reciclaje, ahorro energético, manejo de residuos, señalética o indicadores ambientales.', 'PDF / XLSX / ZIP'),
                ],
              },
              {
                code: '4.3.2',
                name: 'Formación en valores y desarrollo de habilidades blandas',
                status: 'Pendiente',
                description:
                  'Valora acciones curriculares y extracurriculares de formación ética, ciudadana y habilidades blandas.',
                requirements: [
                  evidence('1', 'Plan de formación en valores y habilidades blandas', 'Planificación de actividades, talleres, proyectos o asignaturas relacionadas.', 'PDF / XLSX'),
                  evidence('2', 'Evidencias de actividades formativas', 'Registros, materiales, fotografías, certificados y reportes de talleres o proyectos.', 'PDF / ZIP'),
                  evidence('3', 'Integración curricular', 'Sílabos, resultados de aprendizaje o proyectos de aula que evidencien formación ciudadana y habilidades blandas.', 'PDF / ZIP'),
                  evidence('4', 'Evaluación de resultados', 'Encuestas, informes o evidencias de seguimiento del impacto de las actividades.', 'PDF / XLSX'),
                ],
              },
            ],
          },
          {
            id: '4.4',
            name: '4.4 Formación práctica',
            indicators: [
              {
                code: '4.4.1',
                name: 'Formación práctica en el entorno académico',
                status: 'Pendiente',
                description:
                  'Evalúa prácticas de aprendizaje realizadas en laboratorios, talleres, simuladores u otros entornos académicos.',
                requirements: [
                  evidence('1', 'Plan de prácticas en entorno académico', 'Planificación de prácticas por asignatura, laboratorio, taller, recursos y resultados esperados.', 'PDF / XLSX'),
                  evidence('2', 'Guías e instrumentos de práctica', 'Guías de laboratorio, rúbricas, bitácoras, informes de estudiantes y registros de evaluación.', 'PDF / ZIP'),
                  evidence('3', 'Inventario de laboratorios y talleres', 'Listado de equipos, herramientas, software, estado, mantenimiento y disponibilidad.', 'PDF / XLSX'),
                  evidence('4', 'Registros de ejecución de prácticas', 'Asistencia, reportes, fotografías, proyectos, productos o evidencias de prácticas realizadas.', 'PDF / ZIP'),
                ],
              },
              {
                code: '4.4.2',
                name: 'Formación práctica en el entorno laboral real',
                status: 'Pendiente',
                description:
                  'Valora prácticas preprofesionales o formación práctica desarrollada en escenarios laborales reales.',
                requirements: [
                  evidence('1', 'Normativa de prácticas preprofesionales', 'Reglamento, procedimiento o instructivo de prácticas en entorno laboral real.'),
                  evidence('2', 'Convenios o acuerdos para prácticas', 'Convenios con entidades receptoras, cartas de compromiso o documentos equivalentes.', 'PDF / ZIP'),
                  evidence('3', 'Plan y asignación de prácticas', 'Cronogramas, tutores, estudiantes, entidades, actividades y resultados de aprendizaje esperados.', 'PDF / XLSX'),
                  evidence('4', 'Informes y evaluación de prácticas', 'Informes de estudiantes, rúbricas, certificados, evaluaciones de tutores y actas de cierre.', 'PDF / ZIP'),
                  evidence('5', 'Seguimiento institucional de prácticas', 'Visitas, reportes, comunicaciones y acciones de mejora del proceso de prácticas.', 'PDF / XLSX / ZIP'),
                ],
              },
            ],
          },
          {
            id: '4.5',
            name: '4.5 Biblioteca',
            indicators: [
              {
                code: '4.5.1',
                name: 'Funcionamiento de la biblioteca',
                status: 'Pendiente',
                description:
                  'Evalúa organización, servicios, horarios, personal, uso y gestión de la biblioteca institucional.',
                requirements: [
                  evidence('1', 'Reglamento y manual de biblioteca', 'Normativa de servicios, préstamos, usuarios, horarios, catalogación y responsabilidades.'),
                  evidence('2', 'Plan de gestión bibliotecaria', 'Plan de servicios, adquisición, actualización, capacitación, promoción y mejora de biblioteca.', 'PDF / XLSX'),
                  evidence('3', 'Registros de uso de biblioteca', 'Reportes de préstamos, consultas, usuarios, visitas, bases digitales y servicios prestados.', 'PDF / XLSX'),
                  evidence('4', 'Personal y capacitación bibliotecaria', 'Nómina, perfiles, funciones, capacitación y evidencias de atención a usuarios.', 'PDF / ZIP'),
                  evidence('5', 'Infraestructura y servicios bibliotecarios', 'Fotografías, horarios, señalética, puestos de consulta, equipos y accesibilidad.', 'PDF / JPG / PNG / ZIP'),
                ],
              },
              {
                code: '4.5.2',
                name: 'Acervo de la biblioteca y relación de la biblioteca con las asignaturas y carreras',
                status: 'Pendiente',
                description:
                  'Valora suficiencia, actualización y pertinencia del acervo bibliográfico respecto a carreras y asignaturas.',
                requirements: [
                  evidence('1', 'Inventario del acervo bibliográfico', 'Catálogo de libros, recursos digitales, bases de datos, ejemplares, fecha de edición y disponibilidad.', 'PDF / XLSX'),
                  evidence('2', 'Matriz acervo-asignaturas-carreras', 'Relación entre bibliografía disponible, asignaturas, carreras y programas de estudio.', 'PDF / XLSX'),
                  evidence('3', 'Adquisición y actualización del acervo', 'Facturas, licencias, donaciones, contratos o actas de ingreso de recursos bibliográficos.', 'PDF / ZIP'),
                  evidence('4', 'Uso de recursos bibliográficos', 'Reportes de préstamos, accesos digitales, consultas y uso por carrera o asignatura.', 'PDF / XLSX'),
                ],
              },
            ],
          },
        ],
      },
      {
        id: '5',
        name: 'CRITERIO 5: INVESTIGACIÓN + DESARROLLO E INNOVACIÓN',
        subCriteria: [
          {
            id: '5.1',
            name: '5.1 I+D y publicaciones científicas y técnicas',
            indicators: [
              {
                code: '5.1.1',
                name: 'Investigación y desarrollo',
                status: 'Pendiente',
                description:
                  'Evalúa planificación, ejecución, resultados y pertinencia de actividades de investigación y desarrollo.',
                requirements: [
                  evidence('1', 'Política o normativa de investigación y desarrollo', 'Reglamento, líneas, procedimientos y responsables de la gestión de I+D institucional.'),
                  evidence('2', 'Plan de investigación y desarrollo', 'Planificación de proyectos, líneas, responsables, cronograma, presupuesto y resultados esperados.', 'PDF / XLSX'),
                  evidence('3', 'Proyectos de I+D ejecutados', 'Perfiles, aprobaciones, informes de avance, productos, participantes y cierre de proyectos.', 'PDF / ZIP'),
                  evidence('4', 'Vinculación de estudiantes y docentes en I+D', 'Registros de participación, horas, roles, productos formativos o evidencias de integración académica.', 'PDF / XLSX'),
                  evidence('5', 'Resultados o productos de I+D', 'Prototipos, informes técnicos, publicaciones, transferencia, registros o documentos de impacto.', 'PDF / ZIP'),
                ],
              },
              {
                code: '5.1.2',
                name: 'Publicaciones y eventos científicos y técnicos',
                status: 'Pendiente',
                description:
                  'Valora publicaciones, ponencias, eventos y producción científica o técnica generada por la institución.',
                requirements: [
                  evidence('1', 'Listado certificado de publicaciones', 'Matriz de artículos, libros, capítulos, memorias, autores, filiación, fecha e indexación cuando aplique.', 'PDF / XLSX'),
                  evidence('2', 'Soportes de publicaciones', 'Copias, enlaces, DOI, certificados editoriales, portadas, índices o evidencias de publicación.', 'PDF / ZIP'),
                  evidence('3', 'Participación en eventos científicos o técnicos', 'Certificados, programas, ponencias, memorias, fotografías e informes de participación.', 'PDF / ZIP'),
                  evidence('4', 'Eventos organizados por la institución', 'Planificación, convocatorias, programas, registros de asistencia, memorias y resultados.', 'PDF / ZIP'),
                ],
              },
            ],
          },
          {
            id: '5.2',
            name: '5.2 Innovación',
            indicators: [
              {
                code: '5.2.1',
                name: 'Innovación y capacidad de absorción',
                status: 'Pendiente',
                description:
                  'Evalúa procesos de innovación, transferencia, aprendizaje institucional y capacidad para incorporar conocimiento externo.',
                requirements: [
                  evidence('1', 'Política o plan de innovación', 'Documento institucional que define objetivos, responsables, procesos y líneas de innovación.'),
                  evidence('2', 'Proyectos o iniciativas de innovación', 'Fichas, informes, prototipos, validaciones, pruebas piloto o resultados de innovación.', 'PDF / ZIP'),
                  evidence('3', 'Relación con actores externos para innovación', 'Convenios, actas, asesorías, transferencia tecnológica o colaboración con empresas y organizaciones.', 'PDF / ZIP'),
                  evidence('4', 'Capacitación y aprendizaje para innovación', 'Evidencias de formación, asistencia técnica, vigilancia tecnológica o incorporación de conocimiento externo.', 'PDF / ZIP'),
                  evidence('5', 'Resultados de innovación aplicados', 'Productos, procesos, mejoras, registros, uso institucional o impacto en carreras y entorno.', 'PDF / ZIP'),
                ],
              },
            ],
          },
        ],
      },
      {
        id: '6',
        name: 'CRITERIO 6: VINCULACIÓN CON LA SOCIEDAD',
        subCriteria: [
          {
            id: '6.1',
            name: '6.1 Planificación y ejecución de la vinculación',
            indicators: [
              {
                code: '6.1.1',
                name: 'Planificación y ejecución de vinculación con la sociedad',
                status: 'Pendiente',
                description:
                  'Evalúa planificación, pertinencia, ejecución, seguimiento y resultados de programas y proyectos de vinculación.',
                requirements: [
                  evidence('1', 'Normativa de vinculación con la sociedad', 'Reglamento, política o procedimiento institucional para programas, proyectos, seguimiento y evaluación.'),
                  evidence('2', 'Plan de vinculación con la sociedad', 'Plan institucional con diagnóstico, líneas, proyectos, beneficiarios, responsables, cronograma y presupuesto.', 'PDF / XLSX'),
                  evidence('3', 'Proyectos de vinculación ejecutados', 'Perfiles, aprobaciones, informes de avance, informes finales, productos y resultados por proyecto.', 'PDF / ZIP'),
                  evidence('4', 'Participación de docentes y estudiantes', 'Listados, asignaciones, horas, roles, tutorías y evidencias de intervención en proyectos.', 'PDF / XLSX'),
                  evidence('5', 'Beneficiarios y resultados de vinculación', 'Registros de beneficiarios, encuestas, actas, evidencias de entrega, impacto y satisfacción.', 'PDF / XLSX / ZIP'),
                  evidence('6', 'Seguimiento y evaluación de proyectos', 'Matrices, informes, indicadores, acciones de mejora y cierre de proyectos.', 'PDF / XLSX'),
                ],
              },
            ],
          },
          {
            id: '6.2',
            name: '6.2 Presencia en la comunidad',
            indicators: [
              {
                code: '6.2.1',
                name: 'Presencia de la institución en la comunidad',
                status: 'Pendiente',
                description:
                  'Valora acciones institucionales de presencia, comunicación, orientación y promoción de carreras o servicios ante la comunidad.',
                requirements: [
                  evidence('1', 'Plan de presencia institucional en la comunidad', 'Planificación de actividades, públicos, territorios, responsables, cronograma y objetivos.', 'PDF / XLSX'),
                  evidence('2', 'Actividades de promoción y orientación', 'Charlas, ferias, visitas, campañas, material audiovisual, registros e informes de resultados.', 'PDF / ZIP'),
                  evidence('3', 'Relación con instituciones educativas y comunidad', 'Convenios, invitaciones, actas, comunicaciones y evidencias de interacción con actores comunitarios.', 'PDF / ZIP'),
                  evidence('4', 'Evidencias audiovisuales y comunicacionales', 'Fotografías, videos, publicaciones, piezas gráficas y reportes de difusión, cuidando autorizaciones aplicables.', 'PDF / JPG / PNG / ZIP'),
                  evidence('5', 'Evaluación de impacto o alcance comunitario', 'Informes de participantes, beneficiarios, encuestas, estadísticas y resultados de presencia institucional.', 'PDF / XLSX'),
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
