# Estado (actualizado 2026-11-06)

**En producción** desde `main@0a8202f` (PR #4). **Rama en curso:** `fix/produccion-seguridad`.

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

## Rama `fix/produccion-seguridad` (revisión posterior al despliegue)
- **Límite de intentos compartido por todos:** detrás de Cloudflare/Render todas las peticiones llegaban con la IP del proxy, así que el cupo (10 logins/min, 300 peticiones/min) era común a toda la institución. Ahora se cuenta por sesión (hash del token) y, sin sesión, por la IP real de `CLIENT_IP_HEADER=cf-connecting-ip`. Prueba de integración incluida.
- **"¿Olvidó su clave?" engañoso:** con `MAIL_DRIVER=none` el formulario prometía un correo que nunca llegaba. Nuevo `GET /api/auth/options`; sin correo, el login indica que la clave la restablece el administrador.
- **Arranque lento sin aviso:** el cliente HTTP tiene tiempo de espera (90 s; 10 min para cargas) y mensaje para `429`; el login avisa "Activando el servidor" y consulta `/auth/options` al abrir, lo que despierta el backend.
- **Claves débiles:** mínimo 12 caracteres para crear, restablecer y cambiar claves (antes 8), también en el seed de desarrollo.
- **S3:** sumas de verificación solo cuando la operación las exige (`WHEN_REQUIRED`); el SDK ≥ 3.729 las agrega por defecto y varios servicios compatibles con S3 las rechazan.
- Backend 64/64 pruebas, frontend lint + 6/6 pruebas.

## Requiere acción del responsable (paneles)
1. **Render:** cambiar la rama del servicio y del Blueprint de `feature/finalizacion` a `main`, y añadir `CLIENT_IP_HEADER=cf-connecting-ip` (viene en `render.yaml`, pero el Blueprint solo sincroniza desde su rama).
2. **Probar una carga real** de un PDF como coordinador y su descarga (el almacenamiento S3 no se ha probado en producción).
3. **Rotar claves** usadas durante la puesta en marcha: contraseña de la base y llave S3 (Supabase) y claves de administrador; actualizar Render.
4. **Cuentas de prueba en producción:** desactivar o cambiar la clave de usuarios con claves conocidas (administrador inicial con clave de ejemplo, usuario de pruebas de coordinador).
5. Respaldo: Supabase Free no ofrece restauración a un punto en el tiempo y pausa proyectos inactivos (~7 días); definir copia periódica.

## Pendiente de producto/código
- SMTP para recuperar la clave por correo.
- Plantillas, carpetas y archivos de docente siguen en el navegador (decisión pendiente: repositorio aparte de las versiones oficiales y quién los ve). Pestañas Dashboard/Mis archivos del docente con datos de demostración.
- Pantalla para cambiar la propia clave (la API existe); el correo de un usuario no se puede editar.
- UX detectada como coordinador: faltan tildes/ñ en la interfaz, iconos sin texto (libro, historial, subir), textos CACES en mayúsculas, lista de 43 indicadores sin agrupar, notificaciones no cierran con Escape, rol nombrado de dos formas, aviso "Datos guardados en este navegador" visible a usuarios nuevos, "1.2 SUBRITERIO" (confirmar contra el PDF).
- Token de 8 h sin renovación; sesión por pestaña (sessionStorage).
- Swagger público en `/api/docs` (opcional ocultarlo en producción).
- Pruebas como Docente y Evaluador en producción.

## Entorno de pruebas local
Las pruebas del backend usan un clúster PostgreSQL temporal en el puerto 5440 (fuera del repo); requieren `TEST_DATABASE_URL` con rol CREATEDB.
