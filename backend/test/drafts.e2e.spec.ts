import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { loadConfig } from '../src/config/env';

const PASSWORD = 'Prueba.12345';
const P1 = 'period-2025-aug-feb';
const P2 = 'period-2025-feb-aug';
const sections = [{ id: 's1', title: 'Datos', instruction: 'Completa', placeholder: '...', content: 'Contenido inicial' }];
const body = (baseVersion: number, extra: Record<string, unknown> = {}) =>
  ({ baseVersion, requirementLabel: 'PEDI', templateId: 'tpl-1', sections, status: 'BORRADOR_GUARDADO', ...extra });

describe('Borradores de evidencia', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  const tokens: Record<string, string> = {};
  const auth = (who: string) => ({ Authorization: `Bearer ${tokens[who]}` });
  const put = (who: string, period: string, payload: object, number = 1) =>
    http.put(`/api/periods/${period}/drafts/1.1.1/${number}`).set(auth(who)).send(payload);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication(), loadConfig());
    await app.init();
    http = request(app.getHttpServer());
    for (const [who, email] of [
      ['admin', 'admin@edusudamericano.edu.ec'],
      ['coord', 'coordinador@edusudamericano.edu.ec'],
      ['eval', 'evaluador@edusudamericano.edu.ec'],
      ['docente', 'docente@edu.ec'],
    ]) {
      tokens[who] = (await http.post('/api/auth/login').send({ email, password: PASSWORD })).body.token;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('solo el coordinador escribe; coordinador y administrador leen', async () => {
    for (const who of ['admin', 'eval', 'docente']) expect((await put(who, P1, body(0))).status).toBe(403);
    for (const who of ['eval', 'docente']) expect((await http.get(`/api/periods/${P1}/drafts`).set(auth(who))).status).toBe(403);
    expect((await http.get(`/api/periods/${P1}/drafts`).set(auth('admin'))).status).toBe(200);
    expect((await http.get(`/api/periods/${P1}/drafts`)).status).toBe(401);
  });

  it('crea, versiona y detecta conflictos de edicion simultanea', async () => {
    const first = await put('coord', P1, body(0));
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ version: 1, requirementId: '1', indicatorCode: '1.1.1' });
    const second = await put('coord', P1, body(1, { observations: 'Revisar' }));
    expect(second.body).toMatchObject({ version: 2, observations: 'Revisar' });
    expect((await put('coord', P1, body(1))).status).toBe(409); // version desactualizada
    expect((await put('coord', P1, body(0))).status).toBe(409); // creacion duplicada
  });

  it('separa por periodo y lista lo guardado', async () => {
    expect((await http.get(`/api/periods/${P2}/drafts`).set(auth('coord'))).body).toEqual([]);
    const list = await http.get(`/api/periods/${P1}/drafts`).set(auth('admin'));
    expect(list.body).toHaveLength(1);
    expect(list.body[0].sections[0].content).toBe('Contenido inicial');
  });

  it('valida entrada, evidencia inexistente y periodo', async () => {
    expect((await put('coord', P1, body(0, { status: 'OTRO' }), 2)).status).toBe(400);
    expect((await put('coord', P1, body(0, { sections: [{ id: 'x' }] }), 2)).status).toBe(400);
    expect((await put('coord', P1, body(0, { sections: [{ ...sections[0], content: 'x'.repeat(50_001) }] }), 2)).status).toBe(400);
    expect((await put('coord', P1, body(0), 999)).status).toBe(404);
    expect((await put('coord', 'no-existe', body(0))).status).toBe(404);
  });

  it('elimina solo el coordinador', async () => {
    expect((await http.delete(`/api/periods/${P1}/drafts/1.1.1/1`).set(auth('admin'))).status).toBe(403);
    expect((await http.delete(`/api/periods/${P1}/drafts/1.1.1/1`).set(auth('coord'))).status).toBe(204);
    expect((await http.get(`/api/periods/${P1}/drafts`).set(auth('coord'))).body).toEqual([]);
  });
});
