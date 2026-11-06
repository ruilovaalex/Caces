import { createHash } from 'node:crypto';

type TrackedRequest = { headers?: Record<string, string | string[] | undefined>; ip?: string };

const firstValue = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.split(',')[0]?.trim() || undefined;

/**
 * Clave con la que se cuentan las peticiones para el limite de uso.
 * - Con sesion (Authorization: Bearer): cada sesion tiene su propio cupo, aunque varias personas
 *   compartan la misma IP (por ejemplo, la red del instituto).
 * - Sin sesion (login, recuperacion de clave): la IP real del cliente. Detras de un proxy de borde
 *   (Cloudflare en Render) req.ip es la del proxy y todos los usuarios compartirian el cupo; por eso
 *   se usa la cabecera configurada en CLIENT_IP_HEADER, que el proxy sobrescribe y el cliente no puede falsificar.
 */
export const throttleTracker = (req: TrackedRequest, clientIpHeader?: string): string => {
  const authorization = firstValue(req.headers?.authorization);
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (token) return `token:${createHash('sha256').update(token).digest('hex').slice(0, 32)}`;

  const forwardedIp = clientIpHeader ? firstValue(req.headers?.[clientIpHeader]) : undefined;
  return `ip:${forwardedIp || req.ip || 'desconocida'}`;
};
