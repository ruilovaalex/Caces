import { translateHttpMessage, translateValidationMessage } from '../src/shared/http/error-messages';

describe('Mensajes de error en español', () => {
  it.each([
    ['property role should not exist', 'El campo «rol» no está permitido'],
    ['password must be longer than or equal to 12 characters', '«contraseña» debe tener al menos 12 caracteres'],
    ['title must be shorter than or equal to 200 characters', '«título» debe tener como máximo 200 caracteres'],
    ['email must be an email', '«correo» no es un correo válido'],
    ['requirementNumber must not be less than 1', '«número de evidencia» no puede ser menor que 1'],
    ['role must be one of the following values: ADMIN, DOCENTE', '«rol» debe ser uno de estos valores: ADMIN, DOCENTE'],
    ['indicatorCode must match /^\\d\\.\\d\\.\\d$/ regular expression', '«código de indicador» no tiene el formato esperado'],
  ])('traduce "%s"', (original, expected) => {
    expect(translateValidationMessage(original)).toBe(expected);
  });

  it('deja intactos los mensajes que ya están en español o que no reconoce', () => {
    expect(translateValidationMessage('Ya existe un usuario con ese correo')).toBe('Ya existe un usuario con ese correo');
  });

  it('traduce errores HTTP genéricos', () => {
    expect(translateHttpMessage(413, 'File too large')).toBe('El archivo supera el tamaño máximo permitido');
    expect(translateHttpMessage(429, 'ThrottlerException: Too Many Requests')).toMatch(/Demasiados intentos/);
    expect(translateHttpMessage(404, 'Cannot GET /api/no-existe')).toBe('Recurso no encontrado');
    expect(translateHttpMessage(400, 'Validation failed (uuid is expected)')).toBe('Identificador no válido');
  });
});
