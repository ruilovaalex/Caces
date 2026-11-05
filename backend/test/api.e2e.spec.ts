import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { loadConfig } from '../src/config/env';
import { PrismaService } from '../src/shared/infrastructure/prisma.service';

const PASSWORD = 'Prueba.12345';
const P1 = 'period-2025-aug-feb';
const P2 = 'period-2025-feb-aug';
const pdf = (text: string) => Buffer.from(`%PDF-1.7\n${text}`);

describe('API CACES (integracion)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;
  const tokens: Record<string, string> = {};
  const ids: Record<string, string> = {};

  const login = async (email: string, password = PASSWORD) => {
    const response = await http.post('/api/auth/login').send({ email, password });
    return response;
  };
  const auth = (who: string) => ({ Authorization: `Bearer ${tokens[who]}` });
  const upload = (who: string, period: string, indicatorCode: string, number: number, content: Buffer, name = 'evidencia.pdf') =>
    http.post(`/api/periods/${period}/evidences`).set(auth(who))
      .field('indicatorCode', indicatorCode).field('requirementNumber', String(number))
      .attach('file', content, name);
  const notificationsOf = async (who: string) =>
    (await http.get('/api/notifications?pageSize=100').set(auth(who))).body.items as { id: string; title: string; message: string }[];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication(), loadConfig());
    await app.init();
    prisma = app.get(PrismaService);
    http = request(app.getHttpServer());

    for (const [who, email] of [
      ['admin', 'admin@edusudamericano.edu.ec'],
      ['coord', 'coordinador@edusudamericano.edu.ec'],
      ['eval', 'evaluador@edusudamericano.edu.ec'],
      ['docente', 'docente@edu.ec'],
    ]) {
      const response = await login(email);
      expect(response.status).toBe(200);
      tokens[who] = response.body.token;
      ids[who] = response.body.user.id;
    }

    // Segundo coordinador creado por el administrador.
    const created = await http.post('/api/users').set(auth('admin'))
      .send({ email: 'coord2@edusudamericano.edu.ec', name: 'Coord. Dos', role: 'COORDINADOR', password: PASSWORD });
    expect(created.status).toBe(201);
    ids.coord2 = created.body.id;
    tokens.coord2 = (await login('coord2@edusudamericano.edu.ec')).body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Autenticacion y usuarios', () => {
    it('rechaza credenciales incorrectas y solicitudes sin sesion', async () => {
      expect((await login('coordinador@edusudamericano.edu.ec', 'otra-clave')).status).toBe(401);
      expect((await login('no-existe@edusudamericano.edu.ec')).status).toBe(401);
      expect((await http.get(`/api/periods/${P1}/evidences`)).status).toBe(401);
      expect((await http.get('/api/auth/me').set({ Authorization: 'Bearer token-falso' })).status).toBe(401);
    });

    it('nunca expone el hash de la contrasena', async () => {
      const response = await http.get('/api/users').set(auth('admin'));
      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).not.toContain('passwordHash');
    });

    it('solo el administrador gestiona usuarios y no puede quedarse sin administradores', async () => {
      expect((await http.get('/api/users').set(auth('coord'))).status).toBe(403);
      const response = await http.patch(`/api/users/${ids.admin}`).set(auth('admin')).send({ role: 'COORDINADOR' });
      expect(response.status).toBe(409);
    });

    it('desactivar un usuario invalida su sesion de inmediato', async () => {
      const temp = await http.post('/api/users').set(auth('admin'))
        .send({ email: 'temporal@edusudamericano.edu.ec', name: 'Temporal', role: 'EVALUADOR', password: PASSWORD });
      const token = (await login('temporal@edusudamericano.edu.ec')).body.token;
      expect((await http.get('/api/auth/me').set({ Authorization: `Bearer ${token}` })).status).toBe(200);
      await http.patch(`/api/users/${temp.body.id}`).set(auth('admin')).send({ active: false });
      expect((await http.get('/api/auth/me').set({ Authorization: `Bearer ${token}` })).status).toBe(401);
      expect((await login('temporal@edusudamericano.edu.ec')).status).toBe(401);
    });

    it('rechaza campos no permitidos en la entrada', async () => {
      const response = await http.post('/api/auth/login').send({ email: 'a@b.ec', password: 'x', role: 'ADMIN' });
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Evidencias, versiones y permisos', () => {
    it('solo el coordinador carga; formatos y contenido se validan en el servidor', async () => {
      expect((await upload('eval', P1, '1.1.1', 1, pdf('a'))).status).toBe(403);
      expect((await upload('admin', P1, '1.1.1', 1, pdf('a'))).status).toBe(403);
      expect((await upload('coord', P1, '1.1.1', 1, Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'foto.png')).status).toBe(400);
      expect((await upload('coord', P1, '1.1.1', 1, Buffer.from('no soy pdf'), 'falso.pdf')).status).toBe(400);
      expect((await upload('coord', P1, '1.1.1', 1, pdf('x'.repeat(1_100_000)))).status).toBe(413);
      expect((await upload('coord', P1, '9.9.9', 1, pdf('a'))).status).toBe(404);
      expect((await upload('coord', 'period-1999-x', '1.1.1', 1, pdf('a'))).status).toBe(404);
    });

    it('numera versiones y deja una unica version vigente', async () => {
      const v1 = await upload('coord', P1, '1.1.1', 1, pdf('version 1'));
      const v2 = await upload('coord', P1, '1.1.1', 1, pdf('version 2'));
      expect([v1.status, v2.status]).toEqual([201, 201]);
      expect([v1.body.version, v2.body.version]).toEqual([1, 2]);
      expect(v2.body.status).toBe('CARGADO');
      expect(v1.body.storageKey).toBeUndefined();

      const list = (await http.get(`/api/periods/${P1}/evidences`).set(auth('eval'))).body.filter((e: any) => e.indicatorCode === '1.1.1' && e.requirementNumber === 1);
      expect(list.filter((e: any) => e.isCurrent).map((e: any) => e.version)).toEqual([2]);
    });

    it('cargas simultaneas no producen numeros repetidos ni dos vigentes', async () => {
      const responses = await Promise.all([1, 2, 3, 4, 5].map(n => upload('coord', P1, '1.1.2', 1, pdf(`concurrente ${n}`))));
      expect(responses.every(r => r.status === 201)).toBe(true);
      expect(responses.map(r => r.body.version).sort()).toEqual([1, 2, 3, 4, 5]);
      const current = await prisma.evidenceVersion.count({ where: { isCurrent: true, requirement: { number: 1, indicator: { code: '1.1.2' } } } });
      expect(current).toBe(1);
    });

    it('separa las evidencias por periodo academico', async () => {
      await upload('coord', P2, '1.1.3', 1, pdf('solo periodo 2'));
      const p1 = (await http.get(`/api/periods/${P1}/evidences`).set(auth('coord'))).body;
      const p2 = (await http.get(`/api/periods/${P2}/evidences`).set(auth('coord'))).body;
      expect(p1.some((e: any) => e.indicatorCode === '1.1.3')).toBe(false);
      expect(p2.some((e: any) => e.indicatorCode === '1.1.3')).toBe(true);
      expect(p2.some((e: any) => e.indicatorCode === '1.1.1')).toBe(false);
    });

    it('revision: exige motivo, una version nueva vuelve a revision y conserva la trazabilidad', async () => {
      const list = (await http.get(`/api/periods/${P1}/evidences`).set(auth('eval'))).body;
      const v2 = list.find((e: any) => e.indicatorCode === '1.1.1' && e.requirementNumber === 1 && e.version === 2);

      expect((await http.post(`/api/evidences/${v2.id}/reviews`).set(auth('coord')).send({ status: 'VALIDADO' })).status).toBe(403);
      expect((await http.post(`/api/evidences/${v2.id}/reviews`).set(auth('eval')).send({ status: 'OBSERVADO' })).status).toBe(400);
      expect((await http.post(`/api/evidences/${v2.id}/reviews`).set(auth('eval')).send({ status: 'OBSERVADO', comment: 'Falta la firma' })).status).toBe(201);
      const validated = await http.post(`/api/evidences/${v2.id}/reviews`).set(auth('eval')).send({ status: 'VALIDADO' });
      expect(validated.body.status).toBe('VALIDADO');
      expect(validated.body.reviews.map((r: any) => r.status)).toEqual(['VALIDADO', 'OBSERVADO']);

      const v3 = await upload('coord', P1, '1.1.1', 1, pdf('version 3 corregida'));
      expect(v3.body).toMatchObject({ version: 3, status: 'CARGADO', isCurrent: true });
      const after = (await http.get(`/api/periods/${P1}/evidences`).set(auth('eval'))).body.find((e: any) => e.id === v2.id);
      expect(after).toMatchObject({ status: 'VALIDADO', isCurrent: false });
      expect(after.reviews).toHaveLength(2);
    });

    it('retiro: solo el autor, la anterior vuelve a ser vigente y los numeros no se reutilizan', async () => {
      const list = (await http.get(`/api/periods/${P1}/evidences`).set(auth('coord'))).body;
      const v3 = list.find((e: any) => e.indicatorCode === '1.1.1' && e.requirementNumber === 1 && e.version === 3);

      expect((await http.delete(`/api/evidences/${v3.id}`).set(auth('coord2'))).status).toBe(403);
      expect((await http.delete(`/api/evidences/${v3.id}`).set(auth('eval'))).status).toBe(403);
      expect((await http.delete(`/api/evidences/${v3.id}`).set(auth('coord'))).status).toBe(204);

      const after = (await http.get(`/api/periods/${P1}/evidences`).set(auth('coord'))).body.filter((e: any) => e.indicatorCode === '1.1.1' && e.requirementNumber === 1);
      expect(after.map((e: any) => e.version)).toEqual([2, 1]);
      expect(after.find((e: any) => e.version === 2).isCurrent).toBe(true);
      // El registro retirado se conserva en la base para trazabilidad.
      expect(await prisma.evidenceVersion.count({ where: { id: v3.id, deletedAt: { not: null } } })).toBe(1);
      expect((await upload('coord', P1, '1.1.1', 1, pdf('version 4'))).body.version).toBe(4);
    });

    it('descarga protegida: exige sesion y rol con acceso', async () => {
      const version = (await http.get(`/api/periods/${P1}/evidences`).set(auth('eval'))).body.find((e: any) => e.indicatorCode === '1.1.1' && e.isCurrent);
      expect((await http.get(`/api/evidences/${version.id}/content`)).status).toBe(401);
      expect((await http.get(`/api/evidences/${version.id}/content`).set(auth('docente'))).status).toBe(403);
      expect((await http.get(`/api/periods/${P1}/evidences`).set(auth('docente'))).status).toBe(403);

      const download = await http.get(`/api/evidences/${version.id}/content?download=1`).set(auth('eval')).buffer(true).parse((res, cb) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => cb(null, Buffer.concat(chunks)));
      });
      expect(download.status).toBe(200);
      expect(download.headers['content-type']).toBe('application/pdf');
      expect(download.headers['x-content-type-options']).toBe('nosniff');
      expect(download.headers['content-disposition']).toContain('attachment');
      expect((download.body as Buffer).toString()).toBe(pdf('version 4').toString());
    });
  });

  describe('Notificaciones por destinatario', () => {
    it('la carga avisa al evaluador y la revision avisa a quien cargo', async () => {
      expect((await notificationsOf('eval')).some(n => n.title === 'Nueva evidencia para revisar')).toBe(true);
      expect((await notificationsOf('coord')).some(n => n.title === 'Nueva evidencia para revisar')).toBe(false);
      expect((await notificationsOf('coord')).some(n => n.title === 'Evidencia observado' || n.title === 'Evidencia validado')).toBe(true);
      expect((await notificationsOf('coord2')).some(n => n.title.startsWith('Evidencia '))).toBe(false);
    });

    it('cada usuario solo marca y borra sus propias notificaciones', async () => {
      const evalNotification = (await notificationsOf('eval'))[0];
      expect((await http.delete(`/api/notifications/${evalNotification.id}`).set(auth('coord'))).status).toBe(404);
      expect((await http.post(`/api/notifications/${evalNotification.id}/read`).set(auth('coord'))).status).toBe(404);

      const coordBefore = (await notificationsOf('coord')).length;
      const cleared = await http.delete('/api/notifications').set(auth('eval'));
      expect(cleared.body.deleted).toBeGreaterThan(0);
      expect(await notificationsOf('eval')).toHaveLength(0);
      expect(await notificationsOf('coord')).toHaveLength(coordBefore);
    });
  });

  describe('Verificaciones presenciales y valoraciones', () => {
    it('la verificacion solo la registra el evaluador y solo en evidencias presenciales', async () => {
      const body = { indicatorCode: '1.1.1', requirementNumber: 6, result: 'CON_OBSERVACIONES', notes: 'Falta entrevistar al coordinador de carrera' };
      expect((await http.post(`/api/periods/${P1}/verifications`).set(auth('coord')).send(body)).status).toBe(403);
      expect((await http.post(`/api/periods/${P1}/verifications`).set(auth('eval')).send({ ...body, requirementNumber: 1 })).status).toBe(400);
      expect((await http.post(`/api/periods/${P1}/verifications`).set(auth('eval')).send(body)).status).toBe(201);
      await http.post(`/api/periods/${P1}/verifications`).set(auth('eval')).send({ ...body, result: 'VERIFICADA', notes: 'Corregido' });

      const p1 = (await http.get(`/api/periods/${P1}/verifications`).set(auth('coord'))).body;
      expect(p1.map((v: any) => v.result)).toEqual(['VERIFICADA', 'CON_OBSERVACIONES']);
      expect((await http.get(`/api/periods/${P2}/verifications`).set(auth('coord'))).body).toHaveLength(0);
      expect((await notificationsOf('coord')).some(n => n.title === 'Verificacion presencial con observaciones')).toBe(true);
      expect((await notificationsOf('coord2')).some(n => n.title === 'Verificacion presencial con observaciones')).toBe(true);
    });

    it('la valoracion es independiente del estado de los archivos', async () => {
      const statusesBefore = await prisma.evidenceVersion.findMany({ select: { id: true, status: true }, orderBy: { id: 'asc' } });
      const quantitative = await http.post(`/api/periods/${P1}/assessments`).set(auth('eval'))
        .send({ indicatorCode: '2.1.1', rating: 'SATISFACTORIO', achievements: 'x' });
      expect(quantitative.status).toBe(400);
      const missingDeficiencies = await http.post(`/api/periods/${P1}/assessments`).set(auth('eval'))
        .send({ indicatorCode: '1.1.1', rating: 'POCO_SATISFACTORIO', achievements: 'PEDI vigente' });
      expect(missingDeficiencies.status).toBe(400);

      const created = await http.post(`/api/periods/${P1}/assessments`).set(auth('eval'))
        .send({ indicatorCode: '1.1.1', rating: 'POCO_SATISFACTORIO', achievements: 'PEDI vigente', deficiencies: 'POA sin seguimiento' });
      expect(created.body).toMatchObject({ rating: 'POCO_SATISFACTORIO', score: 0.35, periodCode: P1 });
      expect((await http.get(`/api/periods/${P2}/assessments`).set(auth('eval'))).body).toHaveLength(0);
      expect(await prisma.evidenceVersion.findMany({ select: { id: true, status: true }, orderBy: { id: 'asc' } })).toEqual(statusesBefore);
      expect((await http.get(`/api/periods/${P1}/assessments`).set(auth('docente'))).status).toBe(403);
    });
  });

  describe('Importacion de datos locales', () => {
    it('es idempotente y las versiones importadas vuelven a revision', async () => {
      const send = () => http.post(`/api/periods/${P1}/imports/evidences`).set(auth('coord'))
        .field('legacyId', 'local-abc-1').field('indicatorCode', '1.1.4').field('requirementNumber', '1')
        .field('legacyStatus', 'Validado').field('legacyUploadedBy', 'Coord. Academico').field('legacyUploadDate', '3/11/2026')
        .attach('file', pdf('archivo del navegador'), 'reglamento.pdf');
      const first = await send();
      expect(first.status).toBe(201);
      expect(first.body.outcome).toBe('imported');
      expect(first.body.record.status).toBe('CARGADO');
      expect(first.body.record.note).toContain('estado local: Validado');
      expect((await send()).body.outcome).toBe('skipped');
      expect(await prisma.evidenceVersion.count({ where: { legacyId: 'local-abc-1' } })).toBe(1);
    });
  });
});
