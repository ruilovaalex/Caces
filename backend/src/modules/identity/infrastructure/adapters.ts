import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { Page, PageRequest } from '../../../shared/application/pagination';
import { Role } from '../../../shared/domain/actor';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { Mailer, PasswordHasher, PasswordResetRepository, TokenService, UserRepository } from '../domain/ports';
import { User } from '../domain/user';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async list({ page, pageSize }: PageRequest): Promise<Page<User>> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ orderBy: [{ role: 'asc' }, { name: 'asc' }], skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.user.count(),
    ]);
    return { items, total, page, pageSize };
  }

  create(data: { email: string; name: string; role: Role; passwordHash: string }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: Partial<Pick<User, 'name' | 'role' | 'active' | 'passwordHash'>>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  countActiveByRole(role: Role): Promise<number> {
    return this.prisma.user.count({ where: { role, active: true } });
  }
}

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return hash(plain, 12);
  }

  verify(plain: string, passwordHash: string): Promise<boolean> {
    return compare(plain, passwordHash);
  }
}

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}

  issue(userId: string): Promise<string> {
    return this.jwt.signAsync({ sub: userId });
  }

  async verify(token: string): Promise<{ userId: string } | null> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub?: string }>(token);
      return payload.sub ? { userId: payload.sub } : null;
    } catch {
      return null;
    }
  }
}

@Injectable()
export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.prisma.passwordResetToken.create({ data });
  }

  async consume(tokenHash: string, now: Date): Promise<string | null> {
    // updateMany con condiciones garantiza un solo uso aunque lleguen solicitudes simultaneas.
    const result = await this.prisma.passwordResetToken.updateMany({
      where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (result.count !== 1) return null;
    const token = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    return token?.userId ?? null;
  }

  async invalidateAllFor(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
  }
}

// Solo desarrollo y pruebas: escribe el enlace en el log. En produccion no se permite (ver config).
@Injectable()
export class ConsoleMailer implements Mailer {
  async sendPasswordReset(to: { email: string }, link: string): Promise<void> {
    Logger.log(`[correo simulado] Recuperación de clave para ${to.email}: ${link}`, 'ConsoleMailer');
  }
}

// Sin proveedor de correo configurado: no se envia nada y se avisa al operador (sin registrar el enlace).
@Injectable()
export class DisabledMailer implements Mailer {
  async sendPasswordReset(to: { email: string }): Promise<void> {
    Logger.warn(`Se solicitó recuperar la clave de ${to.email} pero no hay proveedor de correo configurado (MAIL_DRIVER=none). Un administrador puede restablecerla desde Usuarios.`, 'DisabledMailer');
  }
}
