export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
  storageDriver: 'local';
  storageLocalDir: string;
  mailDriver: 'console' | 'none';
  frontendUrl: string;
  maxUploadBytes: number;
}

// Valida la configuracion al arrancar: si falta algo critico, el proceso no inicia.
export const loadConfig = (env: NodeJS.ProcessEnv = process.env): AppConfig => {
  const errors: string[] = [];
  const required = (key: string) => {
    const value = env[key];
    if (!value) errors.push(`Falta la variable de entorno ${key}`);
    return value || '';
  };

  const jwtSecret = required('JWT_SECRET');
  if (jwtSecret && jwtSecret.length < 32) errors.push('JWT_SECRET debe tener al menos 32 caracteres');

  const isProduction = (env.NODE_ENV || 'development') === 'production';
  if (isProduction) {
    if (/(cambia|change|dev-only|example|secret-dev|password)/i.test(jwtSecret) || new Set(jwtSecret).size < 12) {
      errors.push('JWT_SECRET parece un valor de ejemplo o de baja entropia; genera uno aleatorio para produccion');
    }
    const origins = (env.CORS_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean);
    if (!origins.length) errors.push('Define CORS_ORIGINS con el origen HTTPS del frontend en produccion');
    for (const origin of origins) {
      if (origin === '*' || /localhost|127\.0\.0\.1/.test(origin) || !origin.startsWith('https://')) {
        errors.push(`CORS_ORIGINS no admite "${origin}" en produccion (usa origenes https:// explicitos)`);
      }
    }
  }

  const storageDriver = env.STORAGE_DRIVER || 'local';
  if (storageDriver !== 'local') errors.push(`STORAGE_DRIVER no soportado: ${storageDriver}`);

  const mailDriver = env.MAIL_DRIVER || (isProduction ? 'none' : 'console');
  if (mailDriver !== 'console' && mailDriver !== 'none') errors.push(`MAIL_DRIVER no soportado: ${mailDriver}`);
  if (isProduction && mailDriver === 'console') errors.push('MAIL_DRIVER=console no se permite en produccion (filtraria enlaces de recuperacion en los logs)');

  const maxUploadMb = Number(env.MAX_UPLOAD_MB || 20);
  if (!Number.isFinite(maxUploadMb) || maxUploadMb <= 0) errors.push('MAX_UPLOAD_MB debe ser un numero positivo');

  const config: AppConfig = {
    nodeEnv: env.NODE_ENV || 'development',
    port: Number(env.PORT || 4000),
    databaseUrl: required('DATABASE_URL'),
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '8h',
    corsOrigins: (env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(origin => origin.trim()).filter(Boolean),
    storageDriver: 'local',
    storageLocalDir: env.STORAGE_LOCAL_DIR || './storage',
    mailDriver: mailDriver as 'console' | 'none',
    frontendUrl: (env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, ''),
    maxUploadBytes: Math.round(maxUploadMb * 1024 * 1024),
  };

  if (errors.length) throw new Error(`Configuracion invalida:\n- ${errors.join('\n- ')}`);
  return config;
};

export const APP_CONFIG = Symbol('AppConfig');
