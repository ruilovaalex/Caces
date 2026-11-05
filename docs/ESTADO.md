# Estado (actualizado 2026-11-05)

**Rama:** `feature/finalizacion` (desde `main` cbc4d80). **PR:** pendiente.

## Completado
- Línea base verificada: frontend `lint` y `build` OK; backend `typecheck` OK; `npm test` 27/27 (BD temporal propia).
- Configuración de proyecto (`.claude/settings.json` → sonnet), `CLAUDE.md`, plan de finalización.

## Pendiente (ver plan, iteraciones I1–I6)
I1 endurecimiento de producción · I2 usuarios + recuperación de clave · I3 persistencia en servidor
(plantillas, carpetas, asignaciones, borradores, docente) · I4 almacenamiento S3 + despliegue · I5 UI/a11y/móvil · I6 verificación final.

## Bloqueos / intervención del usuario
- Sin credenciales del PostgreSQL local (puerto 5432): las pruebas usan un clúster temporal en el puerto 5440 (fuera del repo).
- Producción necesita de ti: proveedor SMTP, bucket S3, hosting/BD, secretos reales (ver plan §7).

## Siguiente paso
I1: validación de configuración de producción y bloqueo del modo demostración en builds de producción.
