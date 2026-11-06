import { describe, expect, it } from 'vitest';
import { Indicator, UploadedFile } from '../types';
import { getNextAction } from './nextAction';

const indicator = (code: string, reqs: number): Indicator => ({
  id: code,
  code,
  name: `Indicador ${code}`,
  type: 'Cualitativo',
  requirements: Array.from({ length: reqs }, (_, i) => ({ id: String(i + 1), label: `Req ${i + 1}` })),
} as unknown as Indicator);

const file = (indicatorCode: string, requirementId: string, status: UploadedFile['status']): UploadedFile => ({
  id: `${indicatorCode}-${requirementId}`, indicatorCode, requirementId, requirementLabel: 'x', fileName: 'a.pdf', fileType: 'PDF',
  fileSize: '1 KB', uploadDate: '', uploadedBy: 'u', version: 1, status, isCurrentVersion: true,
} as UploadedFile);

const indicators = [indicator('9.9.1', 2), indicator('9.9.2', 1)];

describe('getNextAction', () => {
  it('coordinador: indica evidencias sin cargar y el primer indicador', () => {
    const action = getNextAction('COORDINADOR', indicators, [], 0);
    expect(action.target).toBe('indicator');
    expect(action.indicator?.code).toBeDefined();
    expect(action.title).toMatch(/Carga/);
    expect(action.detail).toMatch(/3 evidencias sin cargar en 2 indicadores/);
  });

  it('coordinador: prioriza corregir observadas', () => {
    const action = getNextAction('COORDINADOR', indicators, [file('9.9.1', '1', 'Observado')], 0);
    expect(action.title).toMatch(/Corrige/);
    expect(action.indicator?.code).toBe('9.9.1');
  });

  it('coordinador: todo cargado y validado', () => {
    const files = [file('9.9.1', '1', 'Validado'), file('9.9.1', '2', 'Validado'), file('9.9.2', '1', 'Validado')];
    expect(getNextAction('COORDINADOR', indicators, files, 0).tone).toBe('done');
  });

  it('evaluador: lleva al indicador con evidencias cargadas', () => {
    const action = getNextAction('EVALUADOR', indicators, [file('9.9.2', '1', 'Cargado')], 5);
    expect(action.indicator?.code).toBe('9.9.2');
    expect(action.title).toMatch(/1 evidencia espera tu revisión/);
  });

  it('evaluador: sin revisiones menciona verificaciones presenciales; sin nada, listo', () => {
    expect(getNextAction('EVALUADOR', indicators, [], 3).title).toMatch(/3 verificaciones presenciales pendientes/);
    expect(getNextAction('EVALUADOR', indicators, [], 0).tone).toBe('done');
  });

  it('administrador: apunta a usuarios', () => {
    expect(getNextAction('ADMIN', indicators, [], 0).target).toBe('assignments');
  });
});
