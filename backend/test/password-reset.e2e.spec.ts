import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { loadConfig } from '../src/config/env';
import { MAILER } from '../src/modules/identity/domain/ports';
import { PrismaService } from '../src/shared/infrastructure/prisma.service';

const OLD = 'Prueba.12345';
const NEW = 'Nueva.Clave.9876';

describe('Recuperacion de contrasena', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let prisma: PrismaService;
  const sent: { email: string; link: string }[] = [];

  const tokenFrom = (link: string) => new URL(link).searchParams.get('reset') as string;
  let ip = 0;
  const forgot = (email: string) => http.post('/api/auth/forgot-password').set('X-Forwarded-For', `10.0.0.${++ip}`).send({ email });
  const reset = (token: string, newPassword = NEW) => http.post('/api/auth/reset-password').send({ token, newPassword });
  const login = (email: string, password: string) => http.post('/api/auth/login').send({ email, password });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MAILER)
      .useValue({ sendPasswordReset: async (to: { email: string }, link: string) => void sent.push({ email: to.email, link }) })
      .compile();
    app = configureApp(moduleRef.createNestApplication(), loadConfig());
    (app.getHttpAdapter().getInstance() as { set: (k: string, v: boolean) => void }).set('trust proxy', true);
    await app.init();
    http = request(app.getHttpServer());
    prisma = app.get(PrismaService);
    const admin = (await login('admin@edusudamericano.edu.ec', OLD)).body.token;
    for (const email of ['reset1@edu.ec', 'reset2@edu.ec', 'inactivo@edu.ec']) {
      const created = await http.post('/api/users').set({ Authorization: `Bearer ${admin}` })
        .send({ email, name: 'Usuario Reset', role: 'DOCENTE', password: OLD });
      expect(created.status).toBe(201);
      if (email === 'inactivo@edu.ec') {
        await http.patch(`/api/users/${created.body.id}`).set({ Authorization: `Bearer ${admin}` }).send({ active: false });
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde igual exista o no el correo y solo envia a usuarios activos', async () => {
    const before = sent.length;
    expect((await forgot('no-existe@edu.ec')).status).toBe(204);
    expect((await forgot('inactivo@edu.ec')).status).toBe(204);
    expect(sent.length).toBe(before);
    expect((await forgot('reset1@edu.ec')).status).toBe(204);
    expect(sent.length).toBe(before + 1);
  });

  it('guarda solo el hash del token', async () => {
    const token = tokenFrom(sent[sent.length - 1].link);
    expect(await prisma.passwordResetToken.count({ where: { tokenHash: token } })).toBe(0);
    expect(await prisma.passwordResetToken.count()).toBeGreaterThan(0);
  });

  it('cambia la clave una sola vez y rechaza reutilizar el token', async () => {
    const token = tokenFrom(sent[sent.length - 1].link);
    expect((await reset(token)).status).toBe(204);
    expect((await login('reset1@edu.ec', NEW)).status).toBe(200);
    expect((await login('reset1@edu.ec', OLD)).status).toBe(401);
    expect((await reset(token, 'Otra.Clave.5555')).status).toBe(400);
  });

  it('rechaza tokens falsos, vencidos y claves cortas', async () => {
    expect((await reset('x'.repeat(43))).status).toBe(400);
    expect((await reset('corto')).status).toBe(400);
    await forgot('reset2@edu.ec');
    const token = tokenFrom(sent[sent.length - 1].link);
    expect((await reset(token, 'corta')).status).toBe(400);
    await prisma.passwordResetToken.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await reset(token)).status).toBe(400);
    expect((await login('reset2@edu.ec', OLD)).status).toBe(200);
  });

  it('una solicitud nueva invalida el enlace anterior', async () => {
    await forgot('reset2@edu.ec');
    const first = tokenFrom(sent[sent.length - 1].link);
    await forgot('reset2@edu.ec');
    const second = tokenFrom(sent[sent.length - 1].link);
    expect((await reset(first)).status).toBe(400);
    expect((await reset(second)).status).toBe(204);
  });
});
