# Plan de finalización — EduSudamericano CACES

## 1. Estado comprobado (2026-11-05, main@cbc4d80)
| Comprobación | Resultado |
|---|---|
| Frontend `npm run lint` / `npm run build` | OK |
| Backend `npm run typecheck` (tras `prisma generate`) | OK |
| Backend `npm test` (BD temporal PG18) | 27/27 pasan (e2e + dominio) |
| Frontend: pruebas automáticas | **No existen** |
| CI / Dockerfile / despliegue | **No existen** (solo `docker-compose.yml` de PostgreSQL) |

El servidor guarda: usuarios, periodos, catálogo, versiones de evidencia y revisiones, verificaciones, valoraciones,
notificaciones e importación. Todo lo demás vive en `localStorage` (ver §3).

## 2. Casos de uso críticos
1. ADMIN gestiona usuarios y roles. 2. Todo usuario inicia sesión, cambia o recupera su clave.
3. COORDINADOR carga/retira versiones y organiza plantillas, carpetas y asignaciones por periodo.
4. EVALUADOR revisa (validar/observar/rechazar), verifica in situ y valora indicadores.
5. DOCENTE ve sus asignaciones y sube borradores/archivos. 6. Notificaciones por usuario. 7. Importar datos locales.

## 3. Contraste con la lista del compañero
| Pendiente reportado | ¿Confirmado? | Evidencia |
|---|---|---|
| Plantillas, carpetas, asignaciones, borradores y docente en servidor | **Sí** | `templateService`, `RepositoryFolderService`, `assignmentService`, `draftService` usan `StorageService` (localStorage); no hay modelos Prisma para ello |
| Administración de usuarios en frontend | **Sí** | La API `/api/users` existe; no hay pantalla ni cliente en `cacesApi.ts` |
| Recuperación de contraseña | **Sí** | Solo `POST /auth/change-password`; el login muestra "Olvido su clave?" sin acción |
| Almacenamiento para producción | **Sí** | `STORAGE_DRIVER` solo admite `local`; el puerto `FileStorage` existe |
| Despliegue del backend | **Sí** | Sin Dockerfile, CI ni guía |

Hallazgos adicionales:
- **Caída silenciosa a local:** `isApiMode = Boolean(VITE_API_URL)`. Un build de producción sin la variable arranca en demo (perfil sin contraseña). → I1
- Config de producción débil: `JWT_SECRET` solo valida longitud; CORS por defecto a localhost; verificar cabeceras de seguridad y throttling en login. → I1
- El seed crea usuarios conocidos con `SEED_DEFAULT_PASSWORD`; no debe usarse así en producción. → I1
- `AssignmentService.getAll` sobrescribe el almacenamiento con datos semilla y `useAssignments` llama `clearAll()` al montar (pérdida de datos). → I3

## 4. Prioridades y dependencias
| It. | Contenido | Depende de |
|---|---|---|
| I1 | Endurecer config de producción; demo solo explícita (`VITE_ENABLE_DEMO`); build de producción exige `VITE_API_URL`; seed seguro | — |
| I2 | UI admin de usuarios (listar/crear/rol/activar); recuperación de clave (token de un uso con expiración, puerto `Mailer`) | I1 |
| I3 | Modelos Prisma + API + frontend: plantillas, carpetas, asignaciones, borradores, funciones del docente; permisos por rol | I1 |
| I4 | Adaptador S3 de `FileStorage`; Dockerfile del backend; guía de despliegue; CI | I1 (despliegue real requiere aprobación) |
| I5 | Accesibilidad, móvil, estados de carga/error | I2, I3 |
| I6 | Verificación general, README/ESTADO, PR | todas |

## 5. Criterios de aceptación
- Producción: sin `VITE_API_URL` el build falla; nunca demo implícita; sin credenciales demo visibles.
- El servidor responde 401/403 a toda acción fuera de rol, probado en e2e por cada endpoint nuevo.
- Plantillas, carpetas, asignaciones y borradores visibles desde otro navegador tras iniciar sesión.
- Recuperación: token inválido, expirado o reutilizado se rechaza; la respuesta no revela si el correo existe.
- Errores de red/servidor muestran mensaje y permiten reintentar sin perder el formulario.

## 6. Pruebas necesarias
Backend e2e por módulo nuevo (permisos por rol, validación, idempotencia); dominio para reglas puras; migraciones sobre BD vacía.
Frontend: sin runner hoy; añadir Vitest para servicios API críticos y comprobación manual por rol (build + ejecución).

## 7. Requisitos pendientes para producción (intervención del usuario)
SMTP o servicio de correo · bucket S3 compatible y credenciales · hosting y PostgreSQL gestionado con respaldos ·
secretos reales (`JWT_SECRET`, claves de BD) · dominio/HTTPS y `CORS_ORIGINS` · cambio de claves de usuarios semilla · aprobación de despliegue.
