// Seed idempotente: se puede ejecutar varias veces sin duplicar datos ni cambiar contrasenas existentes.
import { PrismaClient, UserRole, IndicatorType, VerificationMode } from '@prisma/client';
import { hash } from 'bcryptjs';
import catalog from './data/caces-catalog.json';

const prisma = new PrismaClient();

// Mismos identificadores de periodo que genera el frontend (src/utils/academicPeriodUtils.ts).
const periodsForYear = (year: number) => [
  { code: `period-${year}-aug-feb`, label: `Agosto ${year - 1} - Febrero ${year}`, year, sortOrder: year * 10 + 1 },
  { code: `period-${year}-feb-aug`, label: `Febrero ${year} - Agosto ${year}`, year, sortOrder: year * 10 + 2 },
];

const DEMO_USERS: { email: string; name: string; role: UserRole }[] = [
  { email: 'admin@edusudamericano.edu.ec', name: 'Admin Sudamericano', role: 'ADMIN' },
  { email: 'coordinador@edusudamericano.edu.ec', name: 'Coord. Académico', role: 'COORDINADOR' },
  { email: 'evaluador@edusudamericano.edu.ec', name: 'Evaluador externo', role: 'EVALUADOR' },
  { email: 'docente@edu.ec', name: 'Prof. Pablo Mora', role: 'DOCENTE' },
];

async function seedCatalog() {
  for (const criterion of catalog) {
    const c = await prisma.criterion.upsert({
      where: { code: criterion.code },
      update: { name: criterion.name, sortOrder: criterion.sortOrder },
      create: { code: criterion.code, name: criterion.name, sortOrder: criterion.sortOrder },
    });
    for (const sub of criterion.subCriteria) {
      const s = await prisma.subCriterion.upsert({
        where: { code: sub.code },
        update: { name: sub.name, sortOrder: sub.sortOrder, criterionId: c.id },
        create: { code: sub.code, name: sub.name, sortOrder: sub.sortOrder, criterionId: c.id },
      });
      for (const indicator of sub.indicators) {
        const data = {
          name: indicator.name,
          description: indicator.description,
          type: indicator.type as IndicatorType,
          sortOrder: indicator.sortOrder,
          subCriterionId: s.id,
        };
        const i = await prisma.indicator.upsert({
          where: { code: indicator.code },
          update: data,
          create: { code: indicator.code, ...data },
        });
        for (const requirement of indicator.requirements) {
          const reqData = {
            label: requirement.label,
            description: requirement.description,
            format: requirement.format,
            mode: requirement.mode as VerificationMode,
          };
          await prisma.requirement.upsert({
            where: { indicatorId_number: { indicatorId: i.id, number: requirement.number } },
            update: reqData,
            create: { indicatorId: i.id, number: requirement.number, ...reqData },
          });
        }
      }
    }
  }
}

async function seedPeriods() {
  for (const period of periodsForYear(2025)) {
    await prisma.academicPeriod.upsert({
      where: { code: period.code },
      update: { label: period.label },
      create: period,
    });
  }
}

async function seedUsers() {
  const isProduction = process.env.NODE_ENV === 'production';
  const password = process.env.SEED_DEFAULT_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error(`Define SEED_DEFAULT_PASSWORD (minimo 12 caracteres) para crear los usuarios iniciales.`);
  }
  let users = DEMO_USERS;
  if (isProduction) {
    // En produccion no se crean usuarios de demostracion: solo el administrador inicial indicado.
    const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
    if (!adminEmail || !adminEmail.includes('@')) {
      throw new Error('En produccion define SEED_ADMIN_EMAIL (correo del administrador inicial).');
    }
    users = [{ email: adminEmail, name: 'Administrador', role: 'ADMIN' }];
  }
  const passwordHash = await hash(password, 12);
  for (const user of users) {
    // update vacio: no se sobrescriben contrasenas ni datos de usuarios existentes.
    await prisma.user.upsert({ where: { email: user.email }, update: {}, create: { ...user, passwordHash } });
  }
}

async function main() {
  await seedCatalog();
  await seedPeriods();
  await seedUsers();
  const counts = {
    criterios: await prisma.criterion.count(),
    subcriterios: await prisma.subCriterion.count(),
    indicadores: await prisma.indicator.count(),
    requerimientos: await prisma.requirement.count(),
    presenciales: await prisma.requirement.count({ where: { mode: 'PRESENCIAL' } }),
    periodos: await prisma.academicPeriod.count(),
    usuarios: await prisma.user.count(),
  };
  console.log('Seed completado', counts);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
