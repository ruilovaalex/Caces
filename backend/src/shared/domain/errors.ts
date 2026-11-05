// Errores de dominio independientes de HTTP. La capa HTTP los traduce a codigos de estado.
export abstract class DomainError extends Error {
  abstract readonly code: string;
  constructor(message: string, readonly details?: unknown) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
}
