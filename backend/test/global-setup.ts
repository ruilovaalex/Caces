import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Cada ejecucion crea su propia base temporal: no se borra ni reinicia ninguna base existente.
// TEST_DATABASE_URL solo se usa como conexion de servicio para crear esa base (requiere permiso CREATEDB).
export default async function globalSetup() {
  config({ path: join(__dirname, '..', '.env') });
  const baseUrl = process.env.TEST_DATABASE_URL;
  if (!baseUrl) throw new Error('Define TEST_DATABASE_URL en backend/.env para ejecutar las pruebas');

  const runDb = `caces_test_run_${Date.now()}`;
  const admin = new PrismaClient({ datasourceUrl: baseUrl });
  await admin.$executeRawUnsafe(`CREATE DATABASE "${runDb}"`);
  await admin.$disconnect();

  const runUrl = new URL(baseUrl);
  runUrl.pathname = `/${runDb}`;
  process.env.TEST_RUN_DATABASE = runDb;
  process.env.TEST_RUN_DATABASE_URL = runUrl.toString();

  const env = { ...process.env, DATABASE_URL: runUrl.toString(), SEED_DEFAULT_PASSWORD: 'Prueba.12345' };
  const cwd = join(__dirname, '..');
  execSync('npx prisma migrate deploy', { cwd, env, stdio: 'pipe' });
  execSync('npx tsx prisma/seed.ts', { cwd, env, stdio: 'pipe' });
}
