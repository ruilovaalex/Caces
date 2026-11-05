import { loadConfig } from '../src/config/env';

const base = {
  DATABASE_URL: 'postgresql://u@h/db',
  JWT_SECRET: 'k9Xv2LmQ8rTz4WnB7cYd1HgJ5sPa6EfU',
};

describe('loadConfig en produccion', () => {
  const prod = (extra: Record<string, string>) => () => loadConfig({ ...base, NODE_ENV: 'production', ...extra });

  it('acepta una configuracion completa con origenes https', () => {
    expect(prod({ CORS_ORIGINS: 'https://app.ejemplo.ec' })().corsOrigins).toEqual(['https://app.ejemplo.ec']);
  });

  it('exige CORS_ORIGINS', () => {
    expect(prod({})).toThrow(/CORS_ORIGINS/);
  });

  it.each(['*', 'http://app.ejemplo.ec', 'https://localhost:3000'])('rechaza el origen %s', origin => {
    expect(prod({ CORS_ORIGINS: origin })).toThrow(/CORS_ORIGINS no admite/);
  });

  it('rechaza secretos de ejemplo o de baja entropia', () => {
    expect(prod({ CORS_ORIGINS: 'https://a.ec', JWT_SECRET: 'cambia-este-secreto-por-uno-aleatorio-largo' })).toThrow(/JWT_SECRET/);
    expect(prod({ CORS_ORIGINS: 'https://a.ec', JWT_SECRET: 'a'.repeat(40) })).toThrow(/JWT_SECRET/);
  });

  it('en desarrollo no impone esas reglas', () => {
    expect(() => loadConfig({ ...base, NODE_ENV: 'development' })).not.toThrow();
  });
});
