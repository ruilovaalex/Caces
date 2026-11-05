# Estado (actualizado 2026-11-05)

**Rama:** `feature/finalizacion` (desde `main` cbc4d80). **PR:** pendiente.

## Completado
- Línea base verificada: frontend `lint` y `build` OK; backend `typecheck` OK; `npm test` 27/27 (BD temporal propia).
- Configuración de proyecto (`.claude/settings.json` → sonnet), `CLAUDE.md`, plan de finalización.
- **I1 hecha:** config de producción validada (JWT, CORS https), cabeceras de seguridad, seed de producción solo con admin (`SEED_ADMIN_EMAIL`), demo solo explícita (`VITE_ENABLE_DEMO`) y pantalla de error si falta `VITE_API_URL`. Backend 34/34 pruebas.
- **I2 hecha (backend verificado, UI sin verificación visual):** recuperación de clave (`/auth/forgot-password`, `/auth/reset-password`, token SHA-256 de un uso, 1 h, puerto `Mailer` con adaptadores `console`/`none`), pantalla de usuarios para ADMIN (crear, rol, activar, restablecer clave) y flujo de recuperación en el login. Backend 39/39 pruebas; frontend lint+build OK. Falta adaptador SMTP (requiere proveedor).
- **I3 parcial:** tareas docentes en servidor (modelo `TeacherTask`, `/periods/:p/tasks`, `/teachers`, `/tasks/:id/status`; coordinador asigna, docente avanza solo las suyas, notificaciones) con vista de coordinador y actividades del docente conectadas en modo servidor. Backend 45/45 pruebas.
- **I4 (código):** adaptador S3 (`STORAGE_DRIVER=s3`), `backend/Dockerfile` (sin construir: no hay Docker), CI en `.github/workflows/ci.yml` (no ejecutada aún) y `docs/DESPLIEGUE.md`. Backend 50/50 pruebas.
- **I3 borradores:** `EvidenceDraft` en servidor (`/periods/:p/drafts`, solo coordinador escribe, control de versión con 409). El frontend usa localStorage como caché y escribe/lee del servidor en modo servidor. Backend 55/55. El historial de borradores sigue local.

## Pendiente (ver plan, iteraciones I1–I6)
(I1, I2 completadas) · I3 persistencia en servidor
(plantillas, carpetas, asignaciones, borradores, docente) · I4 almacenamiento S3 + despliegue · I5 UI/a11y/móvil · I6 verificación final.

## Bloqueos / intervención del usuario
- Push de los 2 últimos commits (tareas docentes) rechazado por GitHub con `fatal error in commit_refs_rules` (sin rulesets visibles; el primer push sí funcionó). Reintentar `git push origin feature/finalizacion`.
- UI nueva (usuarios, recuperación, tareas) compila pero no se verificó visualmente en navegador.
- Sin credenciales del PostgreSQL local (puerto 5432): las pruebas usan un clúster temporal en el puerto 5440 (fuera del repo).
- Producción necesita de ti: proveedor SMTP, bucket S3, hosting/BD, secretos reales (ver plan §7).

## Siguiente paso
I3 restante: plantillas (con archivo), carpetas organizativas, borradores (EvidenceDraft) y archivos/entregas del docente en servidor; luego I4–I6.

## Verificación en ejecución (2026-11-05)
Backend + frontend levantados con BD temporal: login por rol, `/users`, `/teachers`, creación de tarea por coordinador y lectura por docente, `forgot-password` (204 sin revelar correo) y cabeceras de seguridad comprobados con peticiones reales. No hay herramientas de navegador en esta sesión: **la UI no se ha visto renderizada**.

## Bloqueos de decisión (I3 restante)
- **Carpetas organizativas, archivos de carpeta y plantillas con archivo:** no se migran todavía. Hay que decidir si los archivos de carpeta/plantilla son un repositorio aparte de las versiones oficiales de evidencia (ya en servidor) y quién los ve. Sin esa decisión se corre el riesgo de duplicar el modelo de evidencias.
- **Archivos/entregas del docente:** el servidor solo permite al coordinador cargar evidencias oficiales; definir el rol del docente (entrega para revisión del coordinador).
I5 iniciado: `Modal` con rol de diálogo, etiqueta, botón cerrar accesible y Escape. Falta auditoría visual/móvil (requiere navegador).
