export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
  storageDriver: 'local';
  storageLocalDir: string;
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

  const storageDriver = env.STORAGE_DRIVER || 'local';
  if (storageDriver !== 'local') errors.push(`STORAGE_DRIVER no soportado: ${storageDriver}`);

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
    maxUploadBytes: Math.round(maxUploadMb * 1024 * 1024),
  };

  if (errors.length) throw new Error(`Configuracion invalida:\n- ${errors.join('\n- ')}`);
  return config;
};

export const APP_CONFIG = Symbol('AppConfig');
