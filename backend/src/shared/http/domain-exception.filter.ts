import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../domain/errors';
import { translateHttpMessage, translateValidationMessage } from './error-messages';

const STATUS_BY_CODE: Record<string, number> = {
  NOT_FOUND: HttpStatus.NOT_FOUND,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  CONFLICT: HttpStatus.CONFLICT,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
};

// Formato único de error: { statusCode, code, message, details? }
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errors');

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof DomainError) {
      const statusCode = STATUS_BY_CODE[exception.code] ?? HttpStatus.BAD_REQUEST;
      response.status(statusCode).json({ statusCode, code: exception.code, message: exception.message, details: exception.details });
      return;
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const body = exception.getResponse() as string | { message?: string | string[] };
      const rawMessage = typeof body === 'string' ? body : body.message;
      const message = Array.isArray(rawMessage)
        ? 'Datos de entrada inválidos'
        : translateHttpMessage(statusCode, rawMessage || exception.message);
      const details = Array.isArray(rawMessage) ? rawMessage.map(translateValidationMessage) : undefined;
      const code = statusCode === 400 ? 'VALIDATION_ERROR'
        : statusCode === 401 ? 'UNAUTHORIZED'
        : statusCode === 403 ? 'FORBIDDEN'
        : statusCode === 404 ? 'NOT_FOUND'
        : statusCode === 413 ? 'PAYLOAD_TOO_LARGE'
        : statusCode === 429 ? 'TOO_MANY_REQUESTS'
        : 'HTTP_ERROR';
      response.status(statusCode).json({ statusCode, code, message, details });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    response.status(500).json({ statusCode: 500, code: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
  }
}
