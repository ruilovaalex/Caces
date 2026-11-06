# Estado (actualizado 2026-11-06)

**En producción** desde `main@fe8fd04` (PR #4 y #5). Render despliega desde `main`. **Rama en curso:** `feat/mejoras-interfaz`.

## En línea
| Pieza | Dónde | Estado |
|---|---|---|
| Web | https://caces.vercel.app (Vercel, desde `main`) | Modo servidor (`VITE_API_URL` en Production). Sin modo demo |
| Backend | https://caces-api.onrender.com (Render Free, Docker) | `/api/health` OK; migraciones al arrancar |
| Base de datos | Supabase (PostgreSQL, Session pooler) | Catálogo cargado: 6 criterios, 43 indicadores, 266 requerimientos, 32 presenciales, 2 periodos |
| Archivos | Supabase Storage, bucket privado `evidencias` (S3) | **Sin probar con una carga real** |

## Completado (resumen)
- Producción sin caída silenciosa a modo local; demo solo explícita (`VITE_ENABLE_DEMO`); seed de producción solo crea el administrador.
- Identidad: login JWT, usuarios y roles (ADMIN), recuperación de clave (sin SMTP aún), cambio de clave por API.
- Tareas docentes y borradores en servidor; evidencias con versiones, revisiones, notificaciones, verificaciones y valoraciones.
- UX: siguiente paso por rol, ubicación en cabecera, menú móvil, modal accesible.
- CI (frontend + backend) en GitHub Actions; guía para el equipo móvil en `docs/GUIA_MOVIL.md`.

## PR #5 `fix/produccion-seguridad` (en producción)
- **Límite de intentos compartido por todos:** detrás de Cloudflare/Render todas las peticiones llegaban con la IP del proxy, así que el cupo (10 logins/min, 300 peticiones/min) era común a toda la institución. Ahora se cuenta por sesión (hash del token) y, sin sesión, por la IP real de `CLIENT_IP_HEADER=cf-connecting-ip`. Prueba de integración incluida.
- **"¿Olvidó su clave?" engañoso:** con `MAIL_DRIVER=none` el formulario prometía un correo que nunca llegaba. Nuevo `GET /api/auth/options`; sin correo, el login indica que la clave la restablece el administrador.
- **Arranque lento sin aviso:** el cliente HTTP tiene tiempo de espera (90 s; 10 min para cargas) y mensaje para `429`; el login avisa "Activando el servidor" y consulta `/auth/options` al abrir, lo que despierta el backend.
- **Claves débiles:** mínimo 12 caracteres para crear, restablecer y cambiar claves (antes 8), también en el seed de desarrollo.
- **S3:** sumas de verificación solo cuando la operación las exige (`WHEN_REQUIRED`); el SDK ≥ 3.729 las agrega por defecto y varios servicios compatibles con S3 las rechazan.
- Backend 64/64 pruebas, frontend lint + 6/6 pruebas. En producción: `/api/auth/options` responde, el cupo baja por cliente y Cloudflare bloquea (403) un `cf-connecting-ip` enviado por el cliente.

## Rama `feat/mejoras-interfaz` (revisión como coordinador)
- Tildes y ñ en ~200 textos visibles mediante un recorrido del árbol sintáctico (solo JSX, atributos y cadenas de interfaz; sin tocar identificadores ni valores de datos).
- Acciones de cada evidencia con texto visible en pantallas anchas (Guía, Historial, Plantillas, Revisar, Subir).
- Docentes y tareas: aviso cuando no hay docentes; indicadores agrupados por criterio.
- Un solo nombre por rol (`ROLE_LABEL`) en cabecera y menú.
- Notificaciones: cierran con Escape y clic fuera; botón con nombre accesible y número sin leer; ancho adaptado a móvil.
- Panel: chips "Falta/Corregir" legibles (sin mayúsculas ni cursiva, texto completo al pasar el ratón).
- Aviso de datos locales: botón "Ocultar aviso" (por navegador) y plurales correctos.
- Catálogo: "1.2 SUBRITERIO" → "1.2 SUBCRITERIO" en web y backend. **La base de producción se actualiza al volver a ejecutar el seed** (actualiza nombres sin tocar usuarios).
- Verificado en local con backend y base desechable: login, panel, indicador 1.1.1, tareas (6 grupos, 43 indicadores) y campana. Vista móvil no revisada en esta ronda.

## Requiere acción del responsable (paneles)
1. **Probar una carga real** de un PDF como coordinador y su descarga (el almacenamiento S3 no se ha probado en producción).
2. **Rotar claves** usadas durante la puesta en marcha: contraseña de la base y llave S3 (Supabase) y claves de administrador; actualizar Render.
3. **Cuentas de prueba en producción:** desactivar o cambiar la clave de usuarios con claves conocidas (administrador inicial con clave de ejemplo, usuario de pruebas de coordinador).
4. Respaldo: Supabase Free no ofrece restauración a un punto en el tiempo y pausa proyectos inactivos (~7 días); definir copia periódica.

## Pendiente de producto/código
- SMTP para recuperar la clave por correo.
- Plantillas, carpetas y archivos de docente siguen en el navegador (decisión pendiente: repositorio aparte de las versiones oficiales y quién los ve). Pestañas Dashboard/Mis archivos del docente con datos de demostración.
- Pantalla para cambiar la propia clave (la API existe); el correo de un usuario no se puede editar.
- Blueprint de Render: sigue apuntando a `feature/finalizacion` (el servicio ya usa `main`); conviene cambiarlo en Blueprints → caces-api → Settings.
- Token de 8 h sin renovación; sesión por pestaña (sessionStorage).
- Swagger público en `/api/docs` (opcional ocultarlo en producción).
- Pruebas como Docente y Evaluador en producción.

## Entorno de pruebas local
Las pruebas del backend usan un clúster PostgreSQL temporal en el puerto 5440 (fuera del repo); requieren `TEST_DATABASE_URL` con rol CREATEDB.
