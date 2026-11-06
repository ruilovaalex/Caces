// Traduce al espanol los mensajes que genera el framework (class-validator, Multer, Throttler, rutas),
// porque el frontend los muestra tal cual a las personas usuarias.

const FIELD_NAMES: Record<string, string> = {
  email: 'correo',
  password: 'contraseña',
  currentPassword: 'contraseña actual',
  newPassword: 'nueva contraseña',
  name: 'nombre',
  role: 'rol',
  active: 'activo',
  token: 'enlace de recuperación',
  title: 'título',
  evidenceLabel: 'evidencia solicitada',
  dueDate: 'fecha límite',
  assigneeId: 'docente',
  indicatorCode: 'código de indicador',
  requirementNumber: 'número de evidencia',
  note: 'observación',
  comment: 'comentario',
  status: 'estado',
  result: 'resultado',
  rating: 'valoración',
  achievements: 'logros',
  deficiencies: 'deficiencias',
  baseVersion: 'versión base',
  sections: 'secciones',
  page: 'página',
  pageSize: 'tamaño de página',
  file: 'archivo',
};

const field = (raw: string) => {
  const key = raw.split('.').pop() ?? raw;
  return FIELD_NAMES[key] ?? key;
};

const RULES: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^property (\S+) should not exist$/, m => `El campo «${field(m[1])}» no está permitido`],
  [/^(\S+) must be longer than or equal to (\d+) characters?$/, m => `«${field(m[1])}» debe tener al menos ${m[2]} caracteres`],
  [/^(\S+) must be shorter than or equal to (\d+) characters?$/, m => `«${field(m[1])}» debe tener como máximo ${m[2]} caracteres`],
  [/^(\S+) must be an email$/, m => `«${field(m[1])}» no es un correo válido`],
  [/^(\S+) should not be empty$/, m => `«${field(m[1])}» es obligatorio`],
  [/^(\S+) must be a string$/, m => `«${field(m[1])}» debe ser texto`],
  [/^(\S+) must be a boolean value$/, m => `«${field(m[1])}» debe ser verdadero o falso`],
  [/^(\S+) must be an integer number$/, m => `«${field(m[1])}» debe ser un número entero`],
  [/^(\S+) must be a number conforming to the specified constraints$/, m => `«${field(m[1])}» debe ser un número`],
  [/^(\S+) must not be less than (\S+)$/, m => `«${field(m[1])}» no puede ser menor que ${m[2]}`],
  [/^(\S+) must not be greater than (\S+)$/, m => `«${field(m[1])}» no puede ser mayor que ${m[2]}`],
  [/^(\S+) must be one of the following values: (.+)$/, m => `«${field(m[1])}» debe ser uno de estos valores: ${m[2]}`],
  [/^(\S+) must be a UUID$/, m => `«${field(m[1])}» no es un identificador válido`],
  [/^(\S+) must be a valid ISO 8601 date string$/, m => `«${field(m[1])}» debe ser una fecha válida`],
  [/^(\S+) must match .+ regular expression$/, m => `«${field(m[1])}» no tiene el formato esperado`],
  [/^(\S+) must be an array$/, m => `«${field(m[1])}» debe ser una lista`],
  [/^(\S+) must be an object$/, m => `«${field(m[1])}» debe ser un objeto`],
];

export const translateValidationMessage = (message: string): string => {
  for (const [pattern, render] of RULES) {
    const match = message.match(pattern);
    if (match) return render(match);
  }
  return message;
};

// Mensajes de errores HTTP genericos (no de validacion).
export const translateHttpMessage = (statusCode: number, message: string): string => {
  if (statusCode === 413 || /file too large/i.test(message)) return 'El archivo supera el tamaño máximo permitido';
  if (statusCode === 429 || /too many requests/i.test(message)) return 'Demasiados intentos seguidos. Espera un minuto e inténtalo de nuevo.';
  if (/^Cannot (GET|POST|PUT|PATCH|DELETE) /.test(message)) return 'Recurso no encontrado';
  if (/^Unexpected field/i.test(message)) return 'Campo de archivo no esperado: adjunta el archivo en el campo «file»';
  if (/^Validation failed \(uuid/i.test(message)) return 'Identificador no válido';
  if (/^Validation failed \(numeric string/i.test(message)) return 'Se esperaba un número';
  if (/^Unauthorized$/i.test(message)) return 'Debes iniciar sesión';
  if (/^Forbidden( resource)?$/i.test(message)) return 'No tienes permiso para esta acción';
  if (/^Not Found$/i.test(message)) return 'Recurso no encontrado';
  if (/^Bad Request$/i.test(message)) return 'Solicitud no válida';
  return message;
};
