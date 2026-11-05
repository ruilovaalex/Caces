# Sistema de acreditacion CACES — Edu Sudamericano

Aplicacion para organizar, preparar y revisar las evidencias institucionales del
*Modelo de Evaluacion Externa 2024 con Fines de Acreditacion para los ISTT* (CACES):
periodo academico → criterio → subcriterio → indicador → evidencia → versiones de archivos.

El catalogo cargado tiene 6 criterios, 15 subcriterios, 43 indicadores (15 cuantitativos, 28 cualitativos)
y 266 evidencias, de las cuales 32 se verifican en la visita in situ. Estos datos se transcribieron del PDF
del modelo; no constituyen una verificacion independiente de la version vigente publicada por el CACES.

## Modos de funcionamiento

| Modo | Cuando | Datos | Acceso |
|---|---|---|---|
| **Servidor** | `VITE_API_URL` definida | PostgreSQL + almacenamiento de archivos del backend, compartidos entre computadoras | Inicio de sesion real (correo y contrasena), permisos verificados en el servidor |
| **Local (demostracion)** | `VITE_API_URL` vacia u omitida | `localStorage` e IndexedDB de cada navegador | Seleccion de perfil sin contrasena y cambio libre de rol |

El modo local se conserva para la demostracion publicada; no es seguro ni comparte datos.

## Estructura del repositorio

```
/                 Frontend (React 19 + Vite 6 + Tailwind 4) — sin cambios de ubicacion
  src/services/api/   Capa de acceso a la API (cliente HTTP y mapeo a los tipos de la interfaz)
backend/          API NestJS + Prisma + PostgreSQL (monolito modular, arquitectura hexagonal)
docker-compose.yml  PostgreSQL para desarrollo (opcional)
```

### Arquitectura del backend

Cada modulo funcional separa:

- `domain/` — entidades, reglas y politicas de acceso, y los **puertos** (interfaces). No depende de NestJS, Prisma, HTTP ni del disco.
- `application/` — casos de uso. Reciben el usuario autenticado (`Actor`) y aplican los permisos sobre cada recurso.
- `infrastructure/` — adaptadores: repositorios Prisma, almacenamiento de archivos, bcrypt, JWT.
- `http/` (o el archivo `*.module.ts`) — controladores, DTO validados y composicion por inyeccion de dependencias.

| Modulo | Responsabilidad |
|---|---|
| `identity` | Inicio de sesion, sesiones JWT, usuarios y roles (solo ADMIN los gestiona) |
| `catalog` | Periodos academicos y catalogo CACES (solo lectura) |
| `evidence` | Versiones de evidencias, revision, retiro logico, descarga protegida, validacion de archivos |
| `evaluation` | Verificaciones presenciales y valoraciones de indicadores (agregados independientes) |
| `notifications` | Notificaciones por destinatario; cada usuario solo ve, marca y borra las suyas |
| `import` | Importacion explicita e idempotente de los datos guardados en el navegador |

Reglas que garantiza la base de datos:

- Claves naturales sin colisiones: una evidencia es `(indicador, numero)`; el trabajo se separa por **periodo**.
- Una sola version vigente por `(periodo, evidencia)` (indice unico parcial) y numeracion sin repetidos, serializada con un bloqueo transaccional.
- Al cargar una version nueva, la anterior se conserva intacta hasta que la nueva quede guardada; la nueva vuelve a estado *Cargado*.
- Retirar una version es logico (se conserva registro y archivo); si era la vigente, vuelve a serlo la anterior.
- Historial de revisiones por version y bitacora de acciones (`AuditLog`).

## Instalacion en Windows

Requisitos: **Node.js 22** y **PostgreSQL 16 o superior** (instalado, o Docker Desktop).

### 1. Base de datos

Con PostgreSQL instalado, abre PowerShell y entra con el usuario administrador:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost
```

```sql
CREATE ROLE caces LOGIN PASSWORD 'elige-una-contrasena' CREATEDB;
CREATE DATABASE caces_dev OWNER caces;
CREATE DATABASE caces_test OWNER caces;
```

`CREATEDB` es necesario para las migraciones de desarrollo y para las pruebas automaticas.

Alternativa con Docker: `docker compose up -d` (PostgreSQL en el puerto 5433, usuario `caces`).

### 2. Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env   # luego edita DATABASE_URL, TEST_DATABASE_URL, JWT_SECRET y SEED_DEFAULT_PASSWORD
npm run prisma:deploy         # aplica las migraciones
npm run seed                  # catalogo CACES, periodos y usuarios iniciales (idempotente)
npm run dev                   # http://localhost:4000/api  ·  documentacion OpenAPI: http://localhost:4000/api/docs
```

Variables (`backend/.env.example`, sin secretos reales):

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexion a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar sesiones (minimo 32 caracteres) |
| `JWT_EXPIRES_IN` | Duracion de la sesion (por defecto `8h`) |
| `CORS_ORIGINS` | Origenes del frontend permitidos, separados por coma |
| `STORAGE_LOCAL_DIR` | Carpeta de archivos (por defecto `backend/storage`, excluida de Git y fuera del frontend) |
| `MAX_UPLOAD_MB` | Tamano maximo por archivo (por defecto 20) |
| `SEED_DEFAULT_PASSWORD` | Contrasena inicial de los usuarios creados por el seed |
| `TEST_DATABASE_URL` | Conexion usada por `npm test` para crear su base temporal |

Usuarios iniciales (contrasena = `SEED_DEFAULT_PASSWORD`; cambiala despues con `POST /api/auth/change-password`):
`admin@edusudamericano.edu.ec`, `coordinador@edusudamericano.edu.ec`, `evaluador@edusudamericano.edu.ec`, `docente@edu.ec`.
El seed no modifica usuarios ni contrasenas que ya existan.

Para crear una migracion nueva tras cambiar `prisma/schema.prisma`: `npm run prisma:migrate -- --name descripcion`.

### 3. Frontend

```powershell
cd ..
npm install
Copy-Item .env.example .env.local   # deja VITE_API_URL="http://localhost:4000" para usar el backend
npm run dev                         # http://localhost:3000
```

Sin `VITE_API_URL` el frontend arranca en modo local, como antes.

### 4. Conservar los datos del navegador

Los datos locales **no se borran**. En modo servidor, el dashboard muestra la tarjeta
*Datos guardados en este navegador* cuando los hay:

- El **coordinador** importa las versiones de evidencias (con sus archivos de IndexedDB) al periodo seleccionado.
- El **evaluador** importa sus verificaciones presenciales y valoraciones.

La importacion es repetible sin duplicar (usa el id local). Las versiones importadas quedan en *Cargado*
para volver a revisarse, porque sus estados locales se registraron sin autenticacion; el estado original
queda anotado en la observacion de la version.

## Roles y permisos (verificados en el servidor)

| Accion | ADMIN | COORDINADOR | EVALUADOR | DOCENTE |
|---|:-:|:-:|:-:|:-:|
| Gestionar usuarios y roles | ✓ | | | |
| Consultar evidencias y descargar archivos | ✓ | ✓ | ✓ | |
| Cargar evidencias oficiales | | ✓ | | |
| Retirar una version (solo las propias) | | ✓ | | |
| Validar, observar o rechazar (observar/rechazar exige motivo) | | | ✓ | |
| Registrar verificaciones presenciales | | | ✓ | |
| Valorar indicadores cualitativos | | | ✓ | |
| Ver verificaciones y valoraciones | ✓ | ✓ | ✓ | |

## Comandos

| Donde | Comando | Que hace |
|---|---|---|
| raiz | `npm run dev` / `npm run build` | Frontend |
| raiz | `npm run lint` | Comprobacion de tipos (`tsc --noEmit`; no es un linter completo) |
| backend | `npm run dev` / `npm run build` / `npm start` | API |
| backend | `npm run typecheck` | Comprobacion de tipos |
| backend | `npm test` | Pruebas unitarias y de integracion. Crean una base temporal `caces_test_run_*` y la eliminan al terminar; no tocan ninguna base existente |

## Pendiente

- Plantillas, carpetas organizativas del coordinador, asignaciones, borradores y la vista del docente siguen guardandose en el navegador (siguientes etapas).
- Adaptador de almacenamiento compatible con S3 para produccion (el puerto `FileStorage` ya existe; hoy solo hay disco local).
- Interfaz de administracion de usuarios en el frontend (la API ya existe en `/api/users`).
- Recuperacion de contrasena por correo.
