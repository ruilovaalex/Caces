import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_LOG, AuditLog } from '../../../shared/application/audit.port';
import { Page, PageRequest } from '../../../shared/application/pagination';
import { Actor, Role } from '../../../shared/domain/actor';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../../shared/domain/errors';
import { PASSWORD_HASHER, PasswordHasher, USER_REPOSITORY, UserRepository } from '../domain/ports';
import { MIN_PASSWORD_LENGTH, normalizeEmail, PublicUser, toPublicUser } from '../domain/user';

const assertAdmin = (actor: Actor) => {
  if (actor.role !== 'ADMIN') throw new ForbiddenError('Solo el administrador gestiona usuarios y roles');
};

const assertPassword = (password: string) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }
};

@Injectable()
export class ListUsersUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(actor: Actor, page: PageRequest): Promise<Page<PublicUser>> {
    assertAdmin(actor);
    const result = await this.users.list(page);
    return { ...result, items: result.items.map(toPublicUser) };
  }
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(AUDIT_LOG) private readonly audit: AuditLog,
  ) {}

  async execute(actor: Actor, input: { email: string; name: string; role: Role; password: string }): Promise<PublicUser> {
    assertAdmin(actor);
    assertPassword(input.password);
    const email = normalizeEmail(input.email);
    if (await this.users.findByEmail(email)) throw new ConflictError('Ya existe un usuario con ese correo');

    const user = await this.users.create({
      email,
      name: input.name.trim(),
      role: input.role,
      passwordHash: await this.hasher.hash(input.password),
    });
    await this.audit.record({ actorId: actor.id, action: 'user.created', entityType: 'User', entityId: user.id, metadata: { role: user.role } });
    return toPublicUser(user);
  }
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(AUDIT_LOG) private readonly audit: AuditLog,
  ) {}

  async execute(
    actor: Actor,
    userId: string,
    input: { name?: string; role?: Role; active?: boolean; password?: string },
  ): Promise<PublicUser> {
    assertAdmin(actor);
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('Usuario no encontrado');

    const losesAdmin = user.role === 'ADMIN' && user.active && ((input.role && input.role !== 'ADMIN') || input.active === false);
    if (losesAdmin && (await this.users.countActiveByRole('ADMIN')) <= 1) {
      throw new ConflictError('Debe quedar al menos un administrador activo');
    }
    if (input.password !== undefined) assertPassword(input.password);

    const updated = await this.users.update(userId, {
      name: input.name?.trim(),
      role: input.role,
      active: input.active,
      passwordHash: input.password ? await this.hasher.hash(input.password) : undefined,
    });
    await this.audit.record({
      actorId: actor.id,
      action: 'user.updated',
      entityType: 'User',
      entityId: userId,
      metadata: { role: input.role, active: input.active, passwordReset: Boolean(input.password) },
    });
    return toPublicUser(updated);
  }
}
