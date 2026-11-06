import { createHash, randomBytes } from 'crypto';
import { APP_CONFIG, AppConfig } from '../../../config/env';
import { Inject, Injectable } from '@nestjs/common';
import { Actor } from '../../../shared/domain/actor';
import { UnauthorizedError, ValidationError } from '../../../shared/domain/errors';
import { MAILER, Mailer, PASSWORD_HASHER, PASSWORD_RESET_REPOSITORY, PasswordHasher, PasswordResetRepository, TOKEN_SERVICE, TokenService, USER_REPOSITORY, UserRepository } from '../domain/ports';
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

const RESET_TTL_MS = 60 * 60 * 1000;
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_RESET_REPOSITORY) private readonly resets: PasswordResetRepository,
    @Inject(MAILER) private readonly mailer: Mailer,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  // Nunca revela si el correo existe: el resultado es siempre el mismo.
  async execute(email: string): Promise<void> {
    const user = await this.users.findByEmail(normalizeEmail(email));
    if (!user || !user.active) return;
    const token = randomBytes(32).toString('base64url');
    await this.resets.invalidateAllFor(user.id);
    await this.resets.create({ userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) });
    try {
      await this.mailer.sendPasswordReset({ email: user.email, name: user.name }, `${this.config.frontendUrl}/?reset=${token}`);
    } catch {
      // Un fallo del proveedor no debe distinguir correos existentes de inexistentes.
    }
  }
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_RESET_REPOSITORY) private readonly resets: PasswordResetRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(`La nueva contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
    }
    const userId = await this.resets.consume(hashToken(token), new Date());
    const user = userId ? await this.users.findById(userId) : null;
    if (!user || !user.active) throw new ValidationError('El enlace de recuperacion no es valido o ya expiro');
    await this.users.update(user.id, { passwordHash: await this.hasher.hash(newPassword) });
    await this.resets.invalidateAllFor(user.id);
  }
}
