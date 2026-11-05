import { Actor } from '../src/shared/domain/actor';
import { ForbiddenError, ValidationError } from '../src/shared/domain/errors';
import { assertAssessmentInput, assertVerificationInput, RATING_SCORES } from '../src/modules/evaluation/domain/evaluation';
import { assertReviewDecision, EvidencePolicy, EvidenceVersion } from '../src/modules/evidence/domain/evidence';
import { getAllowedExtensions, sanitizeFileName, validateEvidenceFile } from '../src/modules/evidence/domain/file-rules';

const PDF = Buffer.from('%PDF-1.7\n...contenido');
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const actor = (role: Actor['role'], id = `${role}-1`): Actor => ({ id, role, name: role, email: `${role}@x.ec` });

describe('Reglas de archivos', () => {
  it('traduce el formato del requerimiento a extensiones', () => {
    expect(getAllowedExtensions('PDF')).toEqual(['pdf']);
    expect(getAllowedExtensions('WORD / EXCEL')).toEqual(['doc', 'docx', 'xls', 'xlsx']);
  });

  it('acepta un PDF real', () => {
    expect(validateEvidenceFile({ originalName: 'plan.pdf', size: PDF.length, content: PDF }, 'PDF', 1024).mimeType).toBe('application/pdf');
  });

  it('rechaza extension no permitida, archivo vacio, exceso de tamano y contenido falso', () => {
    expect(() => validateEvidenceFile({ originalName: 'foto.png', size: PNG.length, content: PNG }, 'PDF', 1024)).toThrow(ValidationError);
    expect(() => validateEvidenceFile({ originalName: 'a.pdf', size: 0, content: Buffer.alloc(0) }, 'PDF', 1024)).toThrow('vacio');
    expect(() => validateEvidenceFile({ originalName: 'a.pdf', size: 5000, content: PDF }, 'PDF', 1024)).toThrow('maximo');
    expect(() => validateEvidenceFile({ originalName: 'virus.pdf', size: PNG.length, content: PNG }, 'PDF', 1024)).toThrow('no corresponde');
  });

  it('elimina rutas y caracteres peligrosos del nombre', () => {
    expect(sanitizeFileName('..\\..\\windows\\system32\\a.pdf')).toBe('a.pdf');
    expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFileName('in<for>me:final?.pdf')).toBe('informefinal.pdf');
  });
});

describe('Politica de evidencias', () => {
  const version = { uploadedById: 'COORDINADOR-1' } as EvidenceVersion;

  it('solo el coordinador carga y solo el evaluador revisa', () => {
    expect(() => EvidencePolicy.assertCanUpload(actor('COORDINADOR'))).not.toThrow();
    for (const role of ['ADMIN', 'EVALUADOR', 'DOCENTE'] as const) {
      expect(() => EvidencePolicy.assertCanUpload(actor(role))).toThrow(ForbiddenError);
    }
    expect(() => EvidencePolicy.assertCanReview(actor('EVALUADOR'))).not.toThrow();
    expect(() => EvidencePolicy.assertCanReview(actor('COORDINADOR'))).toThrow(ForbiddenError);
  });

  it('el docente no consulta el repositorio oficial', () => {
    expect(() => EvidencePolicy.assertCanView(actor('DOCENTE'))).toThrow(ForbiddenError);
  });

  it('un coordinador solo retira sus propias versiones', () => {
    expect(() => EvidencePolicy.assertCanDelete(actor('COORDINADOR'), version)).not.toThrow();
    expect(() => EvidencePolicy.assertCanDelete(actor('COORDINADOR', 'otro'), version)).toThrow(ForbiddenError);
  });

  it('observar o rechazar exige motivo', () => {
    expect(() => assertReviewDecision('VALIDADO')).not.toThrow();
    expect(() => assertReviewDecision('OBSERVADO', '  ')).toThrow(ValidationError);
    expect(() => assertReviewDecision('RECHAZADO')).toThrow(ValidationError);
  });
});

describe('Verificaciones y valoraciones', () => {
  it('la verificacion presencial solo aplica a evidencias presenciales', () => {
    expect(() => assertVerificationInput('PRESENCIAL', 'Se entrevisto al responsable')).not.toThrow();
    expect(() => assertVerificationInput('DOCUMENTAL', 'nota')).toThrow(ValidationError);
    expect(() => assertVerificationInput('PRESENCIAL', ' ')).toThrow(ValidationError);
  });

  it('la valoracion usa la escala del modelo y solo aplica a indicadores cualitativos', () => {
    expect(RATING_SCORES).toEqual({ SATISFACTORIO: 1, CUASI_SATISFACTORIO: 0.7, POCO_SATISFACTORIO: 0.35, DEFICIENTE: 0 });
    expect(() => assertAssessmentInput('CUANTITATIVO', 'SATISFACTORIO', 'logros', '')).toThrow(ValidationError);
    expect(() => assertAssessmentInput('CUALITATIVO', 'SATISFACTORIO', 'logros', '')).not.toThrow();
    expect(() => assertAssessmentInput('CUALITATIVO', 'DEFICIENTE', 'logros', '')).toThrow('deficiencias');
    expect(() => assertAssessmentInput('CUALITATIVO', 'DEFICIENTE', '', 'x')).toThrow('logros');
  });
});
