# Estado (actualizado 2026-11-05)

**Rama:** `feature/finalizacion` (desde `main` cbc4d80). **PR:** pendiente.

## Completado
- Línea base verificada: frontend `lint` y `build` OK; backend `typecheck` OK; `npm test` 27/27 (BD temporal propia).
- Configuración de proyecto (`.claude/settings.json` → sonnet), `CLAUDE.md`, plan de finalización.
- **I1 hecha:** config de producción validada (JWT, CORS https), cabeceras de seguridad, seed de producción solo con admin (`SEED_ADMIN_EMAIL`), demo solo explícita (`VITE_ENABLE_DEMO`) y pantalla de error si falta `VITE_API_URL`. Backend 34/34 pruebas.
- **I2 hecha (backend verificado, UI sin verificación visual):** recuperación de clave (`/auth/forgot-password`, `/auth/reset-password`, token SHA-256 de un uso, 1 h, puerto `Mailer` con adaptadores `console`/`none`), pantalla de usuarios para ADMIN (crear, rol, activar, restablecer clave) y flujo de recuperación en el login. Backend 39/39 pruebas; frontend lint+build OK. Falta adaptador SMTP (requiere proveedor).
- **I3 parcial:** tareas docentes en servidor (modelo `TeacherTask`, `/periods/:p/tasks`, `/teachers`, `/tasks/:id/status`; coordinador asigna, docente avanza solo las suyas, notificaciones) con vista de coordinador y actividades del docente conectadas en modo servidor. Backend 45/45 pruebas.

## Pendiente (ver plan, iteraciones I1–I6)
(I1, I2 completadas) · I3 persistencia en servidor
(plantillas, carpetas, asignaciones, borradores, docente) · I4 almacenamiento S3 + despliegue · I5 UI/a11y/móvil · I6 verificación final.

## Bloqueos / intervención del usuario
- Sin credenciales del PostgreSQL local (puerto 5432): las pruebas usan un clúster temporal en el puerto 5440 (fuera del repo).
- Producción necesita de ti: proveedor SMTP, bucket S3, hosting/BD, secretos reales (ver plan §7).

## Siguiente paso
I3 restante: plantillas (con archivo), carpetas organizativas, borradores (EvidenceDraft) y archivos/entregas del docente en servidor; luego I4–I6.
