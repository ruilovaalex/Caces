# Guía para el equipo de la versión móvil (EduSudamericano CACES)

Fecha de esta guía: 2026-11-06. Estado: backend en línea (plan gratuito), web en producción.
**Este documento no contiene claves.** Las credenciales se piden al responsable del proyecto (ver sección 9).

## 1. Qué existe hoy
| Pieza | Dónde | Notas |
|---|---|---|
| Web (React + Vite) | https://caces.vercel.app | Vercel, se despliega desde `main` |
| Backend (NestJS 11 + Prisma 6) | https://caces-api.onrender.com | Render, plan gratuito, Docker |
| Documentación interactiva (Swagger) | https://caces-api.onrender.com/api/docs | Contrato de la API, fuente de verdad |
| Base de datos | Supabase (PostgreSQL 16) | Solo la usa el backend; **la móvil nunca se conecta directo** |
| Archivos (evidencias) | Supabase Storage, bucket privado `evidencias` | Solo el backend lee/escribe; la móvil descarga por la API |
| Código | https://github.com/ruilovaalex/Caces | Backend en `backend/`, web en la raíz |

**La app móvil usa el mismo backend que la web.** Esto es lo normal y no rompe nada: web y móvil son dos clientes de una misma API.

## 2. Regla de oro: la móvil solo habla con la API
- Base URL: `https://caces-api.onrender.com/api` (todas las rutas llevan el prefijo `/api`).
- La móvil **no necesita** cuenta de Supabase, ni de Render, ni claves S3, ni `DATABASE_URL`. Esas son secretas y quedan solo en Render.
- Lo único que necesita un compañero: la URL de la API y **un usuario de prueba** (lo crea el administrador desde Usuarios y roles).

## 3. Autenticación
1. `POST /api/auth/login` con `{ "email": "...", "password": "..." }` → responde `{ "token": "...", "user": { ... } }`.
2. Enviar en cada petición: `Authorization: Bearer <token>`.
3. `GET /api/auth/me` devuelve el usuario y su rol (comprobar sesión al abrir la app).
4. El token **vence a las 8 horas** y **no existe refresh token**. Al recibir `401`, la app debe volver al login. *Mejora pendiente acordada con backend: endpoint de refresco si la móvil lo necesita.*
5. Guardar el token en almacenamiento seguro (Keychain en iOS, Keystore/EncryptedSharedPreferences en Android), nunca en texto plano.
6. Límites contra abuso: login 10 intentos por minuto por cliente; recuperación de clave 5 por minuto; el resto 300 por minuto **por sesión** (token). Mostrar un mensaje claro ante `429`.
   Detrás de Render el servidor identifica al cliente por la cabecera `cf-connecting-ip` que pone Cloudflare (`CLIENT_IP_HEADER`); la app no debe enviarla.
7. `GET /api/auth/options` (público) devuelve `{ passwordRecovery: "email" | "admin", minPasswordLength: 12 }`. Si es `admin`, no muestres "¿Olvidó su clave?" con formulario: indica que la restablece el administrador.
8. Claves: **mínimo 12 caracteres** al crear, restablecer o cambiar.
9. Roles: `ADMIN`, `COORDINADOR`, `EVALUADOR`, `DOCENTE`. **Los permisos los aplica el servidor**; la móvil solo debe ocultar lo que no corresponde por comodidad, nunca como seguridad.

## 4. Endpoints principales (resumen; el detalle completo está en `/api/docs`)
| Área | Rutas |
|---|---|
| Sesión | `POST /auth/login`, `GET /auth/options`, `GET /auth/me`, `POST /auth/change-password`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Usuarios (admin) | `GET/POST /users`, `PATCH /users/:id` (nombre, rol, activo, clave; **el correo no se puede cambiar**) |
| Catálogo | `GET /periods`, `GET /catalog` (criterios → subcriterios → indicadores → requerimientos) |
| Evidencias | `GET /periods/:periodCode/evidences`, `POST /periods/:periodCode/evidences` (multipart), `POST /evidences/:id/reviews`, `DELETE /evidences/:id`, `GET /evidences/:id/content?download=1` |
| Evaluación | `GET/POST /periods/:periodCode/verifications`, `GET/POST /periods/:periodCode/assessments` |
| Tareas docentes | `GET /teachers`, `GET/POST /periods/:periodCode/tasks`, `PATCH /tasks/:id/status`, `DELETE /tasks/:id` |
| Borradores | `GET /periods/:periodCode/drafts`, `PUT/DELETE /periods/:periodCode/drafts/:indicatorCode/:requirementNumber` |
| Notificaciones | `GET /notifications`, `POST /notifications/read-all`, `POST /notifications/:id/read`, `DELETE /notifications`, `DELETE /notifications/:id` |
| Salud | `GET /health` → `{ "status": "ok" }` |

### Subir una evidencia
`POST /api/periods/{periodCode}/evidences` como `multipart/form-data` con los campos:
- `file`: el archivo (un solo archivo; límite por defecto **20 MB**, configurable con `MAX_UPLOAD_MB`).
- `indicatorCode`: por ejemplo `1.1.1`.
- `requirementNumber`: entero ≥ 1.
- `note` (opcional, máx. 1000 caracteres).

Cada subida crea una **nueva versión**; solo una es la vigente. Los nombres de archivo con tildes viajan en UTF-8.
Descarga/visualización: `GET /api/evidences/{id}/content` (agrega `?download=1` para forzar descarga). Necesita el `Authorization` en la petición, así que en móvil se descarga con la API (no como enlace público).

### Códigos de periodo
Los obtiene de `GET /periods`. Hoy existen dos: Agosto 2024 – Febrero 2025 y Febrero 2025 – Agosto 2025.

## 5. Particularidades del entorno gratuito (importante para pruebas)
- **Render se duerme tras ~15 minutos sin uso.** La primera petición puede tardar ~50 s a 1 min. En la móvil: pantalla de carga con tiempo de espera de al menos 60–90 s y un reintento amable; no mostrar "error de red" de inmediato.
- **Supabase gratuito:** ~500 MB de base de datos, ~1 GB de archivos, límite de 50 MB por archivo, y el proyecto se **pausa tras ~7 días sin actividad** (hay que reactivarlo desde el panel).
- **HTTPS es obligatorio.** Android bloquea tráfico sin cifrar por defecto; la URL de Render ya es HTTPS.
- **CORS:** solo afecta a navegadores. Una app nativa (iOS/Android, React Native, Flutter) no está sujeta a CORS. **Si la versión móvil es web/PWA en otro dominio**, hay que añadir ese dominio (https) a `CORS_ORIGINS` en Render; lo hace el responsable del proyecto.

## 6. Cómo trabajar sin dañar los datos reales (recomendado)
Aunque compartir el backend es correcto, **todo lo que se cree contra producción queda en la base real**. Para desarrollar:
1. Cada integrante levanta su **backend local** (sección 7) con su propia base de datos de desarrollo. El seed de desarrollo crea usuarios de ejemplo (ver `backend/prisma/seed.ts` y `README.md`).
2. En la app móvil, la URL de la API se configura por entorno (`dev` → `http://...` local, `prod` → Render). Nunca escribir la URL fija en el código.
3. Solo se prueba contra Render para validar la integración final, con un usuario de prueba y sin subir documentos reales.
4. Emulador Android: el equipo anfitrión es `http://10.0.2.2:4000`. Simulador iOS: `http://localhost:4000`. Teléfono físico: la IP de tu PC en la red (`http://192.168.x.x:4000`) y permitirlo en CORS si aplica.
5. **Si el equipo prefiere no usar el entorno del proyecto original, puede crear el suyo propio** (su propia base, archivos y servidor). Está explicado paso a paso en la sección 12.

## 7. Levantar el backend en tu PC
Requisitos: Node 24 (npm 11), PostgreSQL 16 local, Git.
```
git clone https://github.com/ruilovaalex/Caces.git
cd Caces/backend
npm ci
npx prisma generate            # obligatorio tras npm ci
cp .env.example .env           # edita DATABASE_URL (tu Postgres local) y JWT_SECRET
npx prisma migrate deploy
npm run seed                   # catálogo, periodos y usuarios de ejemplo (solo fuera de producción)
npm run dev                    # http://localhost:4000, docs en /api/docs
```
- Pruebas: `npm test` (crea y borra una base temporal `caces_test_run_*`; el usuario de Postgres necesita permiso CREATEDB y `TEST_DATABASE_URL`).
- Nunca subir `.env` a Git. Solo se versiona `.env.example`.

## 8. Cómo proponer cambios al backend
1. Rama nueva desde `main` (`feature/movil-...`). **No hacer push directo a `main`, ni force push.**
2. Si necesitas un endpoint nuevo o cambiar uno existente, **avisa antes** al responsable del backend: la web ya depende de lo que existe.
3. Cambios de base de datos: migración nueva de Prisma (`npm run prisma:migrate -- --name x`) y prueba e2e en `backend/test/`. Nunca editar la base de producción a mano.
4. PR con CI en verde (frontend + backend). Al fusionar a `main`, Vercel despliega la web; **el backend en Render se actualiza desde la rama configurada en el servicio** (ver pendientes).

## 9. Accesos: quién los tiene y cómo pedirlos
| Qué | Quién | Para qué |
|---|---|---|
| Usuario de prueba (docente, coordinador, evaluador) | Administrador, desde "Usuarios y roles" | Probar la móvil contra la API |
| Panel de Render / Supabase / Vercel | Solo el dueño del proyecto | Variables y despliegues |
| `DATABASE_URL`, llaves S3, `JWT_SECRET` | Solo en Render | **No se comparten por chat ni se guardan en el repositorio** |

Las claves usadas durante la puesta en marcha quedaron en una conversación de trabajo: antes de usar datos reales hay que **rotarlas** (contraseña de la base y llave S3 en Supabase, clave del administrador desde la app) y actualizar las variables en Render.

## 10. Pendientes conocidos que afectan a la móvil
- **Render sigue desplegando desde la rama `feature/finalizacion`**; debe cambiarse a `main` (Render → servicio `caces-api` → Settings → Branch).
- Sin refresh token (ver sección 3).
- Recuperación de clave por correo: falta el proveedor SMTP. Hoy el administrador restablece claves desde Usuarios.
- Plantillas, carpetas y archivos de docente de la web aún viven en el navegador (localStorage); no tienen API todavía. Si la móvil los necesita, hay que diseñar esos endpoints primero.
- Pantallas de docente en la web (Dashboard, Mis archivos) aún usan datos de demostración; el flujo real de docente es "Mis tareas".
- No hay notificaciones push; solo la lista en `/notifications` (consultar al abrir la app).
- Mejoras de interfaz detectadas en la web (tildes, etiquetas en iconos, textos largos en mayúsculas) también aplican a la móvil.
- Pruebas de carga y política de respaldos de la base de datos: pendientes antes de uso real.

## 11. Contactos y documentos del repositorio
- `README.md`: arquitectura, roles y variables de entorno.
- `docs/ESTADO.md`: estado del proyecto. `docs/PLAN_FINALIZACION.md`: plan. `docs/DESPLIEGUE.md`: despliegue.
- Swagger: `/api/docs` (contrato siempre actualizado con el código).

## 12. Crear un entorno propio del equipo (Supabase + Render nuevos)
Úsalo si no quieres depender de la cuenta del responsable del proyecto original, o si el equipo móvil necesita un entorno de pruebas separado. Es el mismo procedimiento con el que se montó el entorno actual.

### 12.1 Cuentas
- Crea las cuentas con un **correo del equipo o de la institución**, no con cuentas personales, y activa la verificación en dos pasos.
- Supabase (https://supabase.com), Render (https://render.com) y, si la móvil tiene parte web, Vercel. Para Render conviene registrarse con GitHub.
- Planes gratuitos: no hace falta tarjeta. Si algún paso la pide, detente y consulta antes de pagar nada.
- Supabase gratuito permite un número limitado de proyectos activos por cuenta (2 al momento de escribir esto). Los proyectos pausados no cuentan.

### 12.2 Base de datos y archivos (Supabase)
1. **New project**: nombre `caces-movil` (o similar), región cercana, contraseña de base de datos larga (**solo letras y números** evita problemas de codificación). Guárdala en un gestor de contraseñas.
2. En el formulario, desactiva **Enable Data API**: el backend se conecta directo a PostgreSQL y no se expone ninguna API pública de tablas.
3. Espera 2–5 minutos a que el estado deje de decir "Coming up". Mientras tanto, algunas secciones del panel redirigen al inicio; es normal.
4. **Storage → New bucket**: nombre `evidencias`, **sin marcar "Public bucket"** (privado).
5. **Storage → S3**: anota el **Endpoint** y la **Region**. Pulsa **New access key** y guarda el *Access key ID* y el *Secret access key* (el secreto se muestra una sola vez).
6. **Connect → Direct → Session pooler**: copia la cadena. Usa **Session pooler** (funciona por IPv4, que es lo que ofrece Render); la conexión directa es solo IPv6.

### 12.3 La cadena `DATABASE_URL` (aquí se cometen los errores)
Formato exacto, con tus datos en lugar de los marcadores:
```
postgresql://postgres.<REF_DEL_PROYECTO>:<TU_CLAVE>@aws-0-<REGION>.pooler.supabase.com:5432/postgres
```
- `<REF_DEL_PROYECTO>`, host y región salen del panel **Connect → Session pooler**.
- `<TU_CLAVE>` va **entre `:` y `@`**, sin corchetes.
- **Sin espacios** al inicio o al final, sin comillas y sin el prefijo `DATABASE_URL=`. Un espacio inicial produce el error de Prisma `P1012: the URL must start with the protocol postgresql://`.
- Si la clave tiene `@ # / : ?`, codifícalos: `@`→`%40`, `#`→`%23`, `/`→`%2F`, `:`→`%3A`, `?`→`%3F`.

### 12.4 Backend en Render
1. En Render: **New → Blueprint**, elige el repositorio. La rama debe contener `render.yaml` (hoy, `main`). Si la lista de ramas no muestra la que quieres, escribe su nombre.
2. Render lee `render.yaml` y crea el servicio `caces-api` (Docker, plan Free). Te pide las variables secretas:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la cadena de 12.3 |
| `S3_BUCKET` | `evidencias` |
| `S3_REGION` | la región del paso 12.2.5 |
| `S3_ENDPOINT` | el endpoint del paso 12.2.5 (`https://<ref>.storage.supabase.co/storage/v1/s3`) |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | la llave S3 del paso 12.2.5 |

   `JWT_SECRET` lo genera Render solo. `CLIENT_IP_HEADER=cf-connecting-ip` también viene en `render.yaml`: sin ella todos los usuarios comparten el límite de intentos. `CORS_ORIGINS` y `FRONTEND_URL` vienen en `render.yaml` apuntando a la web actual: **cámbialos a tus dominios (solo `https://`, sin `*` ni localhost)** si usas otra web.
3. Pulsa **Deploy Blueprint**. El arranque aplica las migraciones solas (el `CMD` del `Dockerfile` ejecuta `prisma migrate deploy` y luego inicia el servidor).
4. Comprueba `https://<tu-servicio>.onrender.com/api/health` → `{"status":"ok"}`.
5. Para que los despliegues sigan a `main`: Render → tu servicio → **Settings → Branch**.

### 12.5 Primer administrador y catálogo
La base nueva está vacía. Desde tu PC, **tú** ejecutas esto una vez (con tus valores; la clave del administrador es nueva y distinta de la de la base):
```
cd backend
NODE_ENV=production \
DATABASE_URL='<la misma cadena de 12.3>' \
SEED_ADMIN_EMAIL='<correo del administrador>' \
SEED_DEFAULT_PASSWORD='<clave de 12 o más caracteres>' \
npx tsx prisma/seed.ts
```
Resultado esperado: `Seed completado` con 6 criterios, 15 subcriterios, 43 indicadores, 266 requerimientos, 32 presenciales y 2 periodos.
- El seed **nunca sobrescribe usuarios existentes**: volver a ejecutarlo con el mismo correo no cambia su clave.
- El correo de un usuario **no se puede editar** en la app. Para cambiarlo, crea otro usuario y desactiva el anterior desde **Usuarios y roles**.
- Después entra a la web, crea los usuarios de prueba (docente, coordinador, evaluador) desde **Usuarios y roles** y cambia la clave del administrador.

### 12.6 Conectar la web o la móvil a tu backend nuevo
- Web (Vercel): variable `VITE_API_URL=https://<tu-servicio>.onrender.com` en el entorno **Production** y un nuevo despliegue. Sin esa variable, la web en producción muestra "Configuración incompleta" a propósito (nunca cae en modo local).
- Móvil: la URL base de la API (`https://<tu-servicio>.onrender.com/api`) va en la configuración por entorno de la app.

### 12.7 Problemas ya vistos al montar el entorno original
| Síntoma | Causa y solución |
|---|---|
| Render: `Exited with status 127`, "not found" | Un `dockerCommand` guardado en el servicio sobrescribía el `CMD` del Dockerfile. Déjalo **vacío** en Settings → Deploy → Docker Command |
| Render: `P1012 ... must start with postgresql://` | `DATABASE_URL` con espacio al inicio o la clave mal colocada (ver 12.3) |
| Guardar variables y "no pasa nada" | Usa **Save, rebuild, and deploy**, o lanza **Manual Deploy → Deploy latest commit** |
| Supabase redirige al inicio al abrir Storage | El proyecto sigue arrancando; espera unos minutos |
| `npm ci` falla en el backend | Hace falta Node 24 (npm 11); con npm 10 rechaza el lockfile |
| Typecheck del backend falla tras `npm ci` | Falta `npx prisma generate` |
| Login: "correo o contraseña incorrecto" | El usuario no existe o la clave está mal escrita; el correo no distingue mayúsculas |

## 13. Trabajar con Claude (Claude Code) en este repositorio
El repositorio ya trae instrucciones para Claude en `CLAUDE.md` (arquitectura, comandos, reglas de seguridad) y `.claude/settings.json` (modelo del proyecto). Claude las lee solo al abrir el proyecto.

**Buenas prácticas con el equipo**
- Pídele que lea primero `CLAUDE.md`, `README.md` y `docs/ESTADO.md`, y que use la documentación Swagger (`/api/docs`) como contrato de la API.
- Trabaja siempre en una **rama propia** y con PR. Claude no hace force push ni toca `main` directamente, y conviene mantener esa regla.
- **Las claves nunca se pegan en el chat** (contraseña de base de datos, llaves S3, `JWT_SECRET`, claves de usuarios reales). Todo lo que se pegue en una conversación queda registrado; si ocurre, rota esa clave.
- Claude **no escribe contraseñas ni crea cuentas** en servicios reales. Cuando haga falta (variables secretas en Render, el administrador inicial, iniciar sesión), el comando o el formulario lo ejecuta una persona. En la terminal de Claude Code un comando con `!` al inicio (como primer carácter) se ejecuta en tu equipo y su salida queda en la conversación.
- Para revisar la web publicada, Claude puede usar la extensión de Chrome: **tú** inicias sesión en esa pestaña y él navega. Si las pestañas dejan de responder, abre una nueva desde Claude y vuelve a iniciar sesión.
- Antes de que Claude toque algo que despliega o contrata, pídele que explique qué hará y apruébalo tú.

**Qué conviene pedirle**
1. Implementar las pantallas móviles contra los endpoints de la sección 4, empezando por login y lista de tareas del docente.
2. Revisar contra el código del backend cualquier duda del contrato antes de asumir campos.
3. Escribir las pruebas de lo que añada, y ejecutar el lint/typecheck antes de subir.
4. Actualizar `docs/ESTADO.md` al terminar cada bloque de trabajo (no crear informes nuevos).
