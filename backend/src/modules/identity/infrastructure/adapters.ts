import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { Page, PageRequest } from '../../../shared/application/pagination';
import { Role } from '../../../shared/domain/actor';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { PasswordHasher, TokenService, UserRepository } from '../domain/ports';
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
