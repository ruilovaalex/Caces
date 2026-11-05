# Despliegue (guía; nada se ha desplegado)

## Componentes
1. **PostgreSQL 16+** gestionado, con respaldos automáticos.
2. **Backend** (`backend/Dockerfile`, puerto 4000) detrás de HTTPS (proxy o plataforma).
3. **Almacenamiento de archivos:** `STORAGE_DRIVER=s3` (AWS S3, MinIO, R2…) o un volumen persistente con `STORAGE_LOCAL_DIR`.
4. **Frontend estático** (`npm run build` → `dist/`) en cualquier hosting estático/CDN.

## Variables del backend en producción
| Variable | Notas |
|---|---|
| `NODE_ENV=production` | Activa las validaciones estrictas de arranque |
| `DATABASE_URL` | Con usuario de mínimos privilegios |
| `JWT_SECRET` | Aleatorio, ≥32 caracteres; no puede contener texto de ejemplo |
| `CORS_ORIGINS` | Solo `https://` explícitos (sin `*` ni localhost) |
| `FRONTEND_URL` | Base del enlace de recuperación de clave |
| `STORAGE_DRIVER=s3`, `S3_BUCKET`, `S3_REGION`, opc. `S3_ENDPOINT`, `S3_FORCE_PATH_STYLE=true`, `S3_PREFIX` | Credenciales por `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` o rol IAM. El bucket debe ser privado |
| `MAIL_DRIVER=none` | Aún no hay adaptador SMTP: el administrador restablece claves desde Usuarios |
| `SEED_ADMIN_EMAIL`, `SEED_DEFAULT_PASSWORD` (≥12) | Solo para el primer seed; cambiar la clave después |

## Pasos
1. `docker build -t caces-backend backend/`
2. Migrar: `docker run --rm --env-file <env> caces-backend npx prisma migrate deploy`
3. Primer seed (catálogo, periodos y administrador): `docker run --rm --env-file <env> caces-backend npx tsx prisma/seed.ts`
4. Iniciar el contenedor; comprobar `GET /api/health`.
5. Frontend: construir con `VITE_API_URL=https://api.tu-dominio` (sin `VITE_ENABLE_DEMO`).
6. Iniciar sesión como administrador, cambiar la clave y crear los usuarios reales.

## Pendiente antes de producción real
SMTP (recuperación por correo), política de respaldos y restauración probada, monitoreo/logs, límites de tamaño en el proxy,
revisión de CORS/HTTPS, prueba de carga de archivos con el bucket real. La imagen Docker no se construyó en este entorno (Docker no está instalado).
