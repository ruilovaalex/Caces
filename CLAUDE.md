# EduSudamericano CACES

App de acreditación CACES 2024 (ISTT): periodo → criterio → subcriterio → indicador → evidencia → versiones.
Detalle de arquitectura, roles y variables: `README.md`. Plan: `docs/PLAN_FINALIZACION.md`. Estado: `docs/ESTADO.md`.

## Arquitectura (comprobada)
- Frontend (raíz): React 19 + Vite 6 + Tailwind 4. `src/services/api/` = cliente HTTP; `src/hooks/` decide API vs local con `isApiMode` (`VITE_API_URL`).
- Backend (`backend/`): NestJS 11 + Prisma 6 + PostgreSQL, hexagonal por módulo (`domain/application/infrastructure/http`).
  Módulos: identity, catalog, evidence, evaluation, notifications, import. Los permisos se aplican en los casos de uso del servidor.
- Modo local (localStorage/IndexedDB) = demostración explícita; nunca es respaldo silencioso de producción.

## Comandos
- Frontend (raíz): `npm ci`, `npm run dev` (3000), `npm run lint` (tsc), `npm run build`.
- Backend (`backend/`): `npm ci`, `npx prisma generate`, `npm run typecheck`, `npm test` (crea y borra una BD temporal
  `caces_test_run_*`; requiere `TEST_DATABASE_URL` con rol CREATEDB), `npm run prisma:deploy`, `npm run seed`,
  `npm run dev` (4000, docs en /api/docs).
- Tras `npm ci` del backend ejecutar `prisma generate`, o el typecheck falla.

## Seguridad y cambios ajenos
- Nunca leer, imprimir ni commitear `.env*` (solo `.env.example`), claves ni contraseñas. `backend/storage/` fuera de Git.
- No force push, no tocar `main` directamente, no descartar cambios de compañeros; trabajar en rama y PR.
- Sin credenciales de demostración en producción. La autorización va siempre en el servidor, no solo en la UI.
- No desplegar ni contratar servicios sin aprobación explícita.

## Forma de trabajo
- Iteraciones: PLANIFICAR → IMPLEMENTAR → PROBAR → CORREGIR → DOCUMENTAR. Commits pequeños por iteración.
- Actualizar `docs/PLAN_FINALIZACION.md` y `docs/ESTADO.md`; no crear informes nuevos.
- Lectura selectiva: buscar por ruta/símbolo (Grep/Glob) antes de leer; no leer `node_modules`, `dist`, logs ni
  `backend/prisma/data/caces-catalog.json` completos. Respuestas concisas; sin agentes paralelos salvo necesidad.
- Cambios de esquema Prisma → migración nueva (`npm run prisma:migrate -- --name x`) y pruebas e2e en `backend/test/`.
