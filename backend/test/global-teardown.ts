import { PrismaClient } from '@prisma/client';

// Elimina unicamente la base temporal creada por esta misma ejecucion en global-setup.
export default async function globalTeardown() {
  const runDb = process.env.TEST_RUN_DATABASE;
  const baseUrl = process.env.TEST_DATABASE_URL;
  if (!runDb || !baseUrl || !/^caces_test_run_\d+$/.test(runDb)) return;
  const admin = new PrismaClient({ datasourceUrl: baseUrl });
  await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${runDb}" WITH (FORCE)`);
  await admin.$disconnect();
}
