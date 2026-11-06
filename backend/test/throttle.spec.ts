import { loadConfig } from '../src/config/env';
import { throttleTracker } from '../src/shared/http/throttle-tracker';

describe('throttleTracker (cupo del limite de uso)', () => {
  const proxyIp = '10.0.0.1';

  it('con sesion, cada token tiene su propio cupo aunque compartan IP', () => {
    const a = throttleTracker({ ip: proxyIp, headers: { authorization: 'Bearer token-a' } });
    const b = throttleTracker({ ip: proxyIp, headers: { authorization: 'Bearer token-b' } });
    expect(a).toMatch(/^token:[0-9a-f]{32}$/);
    expect(a).not.toBe(b);
    expect(a).toBe(throttleTracker({ ip: '10.9.9.9', headers: { authorization: 'bearer token-a' } }));
    expect(a).not.toContain('token-a');
  });

  it('sin sesion usa la cabecera de IP real configurada (detras de Cloudflare/Render)', () => {
    const headers = { 'cf-connecting-ip': '200.1.2.3' };
    expect(throttleTracker({ ip: proxyIp, headers }, 'cf-connecting-ip')).toBe('ip:200.1.2.3');
    expect(throttleTracker({ ip: proxyIp, headers: { 'cf-connecting-ip': '200.1.2.4' } }, 'cf-connecting-ip'))
      .not.toBe(throttleTracker({ ip: proxyIp, headers }, 'cf-connecting-ip'));
  });

  it('sin cabecera configurada ignora lo que envie el cliente y usa la IP de la conexion', () => {
    expect(throttleTracker({ ip: proxyIp, headers: { 'cf-connecting-ip': '1.1.1.1' } })).toBe(`ip:${proxyIp}`);
    expect(throttleTracker({ ip: proxyIp, headers: {} }, 'cf-connecting-ip')).toBe(`ip:${proxyIp}`);
    expect(throttleTracker({ ip: proxyIp, headers: { authorization: 'Basic abc' } })).toBe(`ip:${proxyIp}`);
  });
});

describe('CLIENT_IP_HEADER', () => {
  const base = { DATABASE_URL: 'postgresql://u@h/db', JWT_SECRET: 'k9Xv2LmQ8rTz4WnB7cYd1HgJ5sPa6EfU' };

  it('se normaliza a minusculas y es opcional', () => {
    expect(loadConfig(base).clientIpHeader).toBeUndefined();
    expect(loadConfig({ ...base, CLIENT_IP_HEADER: ' CF-Connecting-IP ' }).clientIpHeader).toBe('cf-connecting-ip');
  });

  it('rechaza nombres de cabecera invalidos', () => {
    expect(() => loadConfig({ ...base, CLIENT_IP_HEADER: 'x ip;' })).toThrow(/CLIENT_IP_HEADER/);
  });
});
