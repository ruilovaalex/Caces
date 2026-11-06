import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { loadConfig } from '../src/config/env';

const PASSWORD = 'Prueba.12345';
const PERIOD = 'period-2025-aug-feb';

describe('Tareas docentes', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  const tokens: Record<string, string> = {};
  const ids: Record<string, string> = {};
  const auth = (who: string) => ({ Authorization: `Bearer ${tokens[who]}` });
  const body = (assigneeId: string) => ({ assigneeId, indicatorCode: '1.1.1', title: 'Preparar PEDI', evidenceLabel: 'PEDI aprobado', dueDate: '2026-06-05' });
  const create = (who: string, assigneeId: string) => http.post(`/api/periods/${PERIOD}/tasks`).set(auth(who)).send(body(assigneeId));

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
      const response = await http.post('/api/auth/login').send({ email, password: PASSWORD });
      expect(response.status).toBe(200);
      tokens[who] = response.body.token;
      ids[who] = response.body.user.id;
    }
    const other = await http.post('/api/users').set(auth('admin'))
      .send({ email: 'docente2@edu.ec', name: 'Docente Dos', role: 'DOCENTE', password: PASSWORD });
    ids.docente2 = other.body.id;
    tokens.docente2 = (await http.post('/api/auth/login').send({ email: 'docente2@edu.ec', password: PASSWORD })).body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('solo el coordinador asigna tareas y consulta docentes', async () => {
    for (const who of ['admin', 'eval', 'docente']) {
      expect((await create(who, ids.docente)).status).toBe(403);
      expect((await http.get('/api/teachers').set(auth(who))).status).toBe(403);
    }
    const teachers = await http.get('/api/teachers').set(auth('coord'));
    expect(teachers.status).toBe(200);
    expect(teachers.body.map((t: { id: string }) => t.id)).toContain(ids.docente);
  });

  it('valida destinatario, indicador, fecha y campos', async () => {
    expect((await create('coord', ids.eval)).status).toBe(400); // no es docente
    expect((await http.post(`/api/periods/${PERIOD}/tasks`).set(auth('coord')).send({ ...body(ids.docente), indicatorCode: '9.9.9' })).status).toBe(404);
    expect((await http.post(`/api/periods/${PERIOD}/tasks`).set(auth('coord')).send({ ...body(ids.docente), dueDate: '2026-13-45' })).status).toBe(400);
    expect((await http.post(`/api/periods/${PERIOD}/tasks`).set(auth('coord')).send({ ...body(ids.docente), title: '' })).status).toBe(400);
    expect((await http.post('/api/periods/no-existe/tasks').set(auth('coord')).send(body(ids.docente))).status).toBe(404);
  });

  it('crea la tarea, notifica al docente y cada docente ve solo las suyas', async () => {
    const created = await create('coord', ids.docente);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ status: 'NUEVA', indicatorCode: '1.1.1', dueDate: '2026-06-05', assigneeId: ids.docente });
    const own = await http.get(`/api/periods/${PERIOD}/tasks`).set(auth('docente'));
    expect(own.body.map((t: { id: string }) => t.id)).toContain(created.body.id);
    const others = await http.get(`/api/periods/${PERIOD}/tasks`).set(auth('docente2'));
    expect(others.body).toEqual([]);
    expect((await http.get(`/api/periods/${PERIOD}/tasks`).set(auth('eval'))).status).toBe(403);
    const notes = await http.get('/api/notifications?pageSize=100').set(auth('docente'));
    expect(notes.body.items.some((n: { title: string }) => n.title === 'Nueva tarea asignada')).toBe(true);
  });

  it('el docente solo avanza sus tareas, un paso a la vez, y el coordinador es notificado', async () => {
    const task = (await create('coord', ids.docente)).body;
    const patch = (who: string, status: string) => http.patch(`/api/tasks/${task.id}/status`).set(auth(who)).send({ status });
    expect((await patch('docente2', 'EN_PROGRESO')).status).toBe(403);
    expect((await patch('eval', 'EN_PROGRESO')).status).toBe(403);
    expect((await patch('docente', 'ENTREGADA')).status).toBe(400); // salta un paso
    expect((await patch('docente', 'INVALIDO')).status).toBe(400);
    expect((await patch('docente', 'EN_PROGRESO')).status).toBe(200);
    expect((await patch('docente', 'ENTREGADA')).status).toBe(200);
    expect((await patch('docente', 'NUEVA')).status).toBe(400); // no retrocede
    expect((await patch('coord', 'NUEVA')).status).toBe(200); // el coordinador corrige
    const notes = await http.get('/api/notifications?pageSize=100').set(auth('coord'));
    expect(notes.body.items.some((n: { title: string }) => n.title === 'Tarea entregada')).toBe(true);
  });

  it('solo el coordinador elimina tareas', async () => {
    const task = (await create('coord', ids.docente)).body;
    expect((await http.delete(`/api/tasks/${task.id}`).set(auth('docente'))).status).toBe(403);
    expect((await http.delete(`/api/tasks/${task.id}`).set(auth('coord'))).status).toBe(204);
    expect((await http.delete(`/api/tasks/${task.id}`).set(auth('coord'))).status).toBe(404);
  });

  it('exige sesion', async () => {
    expect((await http.get(`/api/periods/${PERIOD}/tasks`)).status).toBe(401);
  });
});
