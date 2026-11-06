import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { loadConfig } from '../src/config/env';

// Simula el despliegue detras de Cloudflare/Render: todas las conexiones llegan desde la misma IP (el proxy)
// y la IP real del cliente viaja en CLIENT_IP_HEADER.
describe('Limite de intentos detras de un proxy (integracion)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  const previous = process.env.CLIENT_IP_HEADER;

  beforeAll(async () => {
    process.env.CLIENT_IP_HEADER = 'cf-connecting-ip';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication(), loadConfig());
    await app.init();
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
    if (previous === undefined) delete process.env.CLIENT_IP_HEADER;
    else process.env.CLIENT_IP_HEADER = previous;
  });

  const attempt = (clientIp: string) =>
    http.post('/api/auth/login').set('cf-connecting-ip', clientIp).send({ email: 'nadie@edusudamericano.edu.ec', password: 'incorrecta' });

  it('cada cliente tiene su propio cupo de inicio de sesion aunque compartan proxy', async () => {
    for (let i = 1; i <= 12; i++) {
      expect((await attempt(`200.0.0.${i}`)).status).toBe(401);
    }
  });

  it('un mismo cliente queda limitado tras 10 intentos por minuto', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) statuses.push((await attempt('190.5.5.5')).status);
    expect(statuses.slice(0, 10).every(status => status === 401)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});
