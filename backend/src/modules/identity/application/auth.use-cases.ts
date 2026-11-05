import { Inject, Injectable } from '@nestjs/common';
import { Actor } from '../../../shared/domain/actor';
import { UnauthorizedError, ValidationError } from '../../../shared/domain/errors';
import { PASSWORD_HASHER, PasswordHasher, TOKEN_SERVICE, TokenService, USER_REPOSITORY, UserRepository } from '../domain/ports';
import { MIN_PASSWORD_LENGTH, normalizeEmail, PublicUser, toActor, toPublicUser } from '../domain/user';

const INVALID_CREDENTIALS = 'Correo o contrasena incorrectos';

@Injectable()
export class LoginUseCase {
  private dummyHash: Promise<string> | null = null;

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(email: string, password: string): Promise<{ token: string; user: PublicUser }> {
    const user = await this.users.findByEmail(normalizeEmail(email));
    // Si el correo no existe se compara contra un hash ficticio para no revelar por el tiempo de respuesta si existe.
    this.dummyHash ??= this.hasher.hash('usuario-inexistente');
    const valid = await this.hasher.verify(password, user?.passwordHash ?? (await this.dummyHash));
    if (!user || !valid || !user.active) throw new UnauthorizedError(INVALID_CREDENTIALS);
    return { token: await this.tokens.issue(user.id), user: toPublicUser(user) };
  }
}

@Injectable()
export class AuthenticateTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  // Se consulta el usuario en cada solicitud: un cambio de rol o una desactivacion aplican de inmediato.
  async execute(token: string): Promise<Actor> {
    const payload = await this.tokens.verify(token);
    if (!payload) throw new UnauthorizedError('Sesion invalida o expirada');
    const user = await this.users.findById(payload.userId);
    if (!user || !user.active) throw new UnauthorizedError('Sesion invalida o expirada');
    return toActor(user);
  }
}

@Injectable()
export class ChangeOwnPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(actor: Actor, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.users.findById(actor.id);
    if (!user || !(await this.hasher.verify(currentPassword, user.passwordHash))) {
      throw new ValidationError('La contrasena actual no es correcta');
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(`La nueva contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
    }
    await this.users.update(user.id, { passwordHash: await this.hasher.hash(newPassword) });
  }
}
