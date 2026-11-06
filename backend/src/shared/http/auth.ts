import { CanActivate, createParamDecorator, ExecutionContext, Inject, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Actor } from '../domain/actor';
import { UnauthorizedError } from '../domain/errors';

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

export interface AuthenticatedRequest extends Request {
  actor?: Actor;
}

// Puerto que el guard usa para resolver el token; lo implementa el modulo de identidad.
export interface TokenAuthenticator {
  execute(token: string): Promise<Actor>;
}
export const TOKEN_AUTHENTICATOR = Symbol('TokenAuthenticator');

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_AUTHENTICATOR) private readonly authenticator: TokenAuthenticator,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedError('Debes iniciar sesión');

    request.actor = await this.authenticator.execute(token);
    return true;
  }
}

export const CurrentActor = createParamDecorator((_data: unknown, context: ExecutionContext): Actor => {
  const actor = context.switchToHttp().getRequest<AuthenticatedRequest>().actor;
  if (!actor) throw new UnauthorizedError('Debes iniciar sesión');
  return actor;
});
