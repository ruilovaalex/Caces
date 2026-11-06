import { Page, PageRequest } from '../../../shared/application/pagination';
import { Role } from '../../../shared/domain/actor';
import { User } from './user';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(page: PageRequest): Promise<Page<User>>;
  create(data: { email: string; name: string; role: Role; passwordHash: string }): Promise<User>;
  update(id: string, data: Partial<Pick<User, 'name' | 'role' | 'active' | 'passwordHash'>>): Promise<User>;
  countActiveByRole(role: Role): Promise<number>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export interface TokenService {
  issue(userId: string): Promise<string>;
  verify(token: string): Promise<{ userId: string } | null>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
export const PASSWORD_HASHER = Symbol('PasswordHasher');
export const TOKEN_SERVICE = Symbol('TokenService');

export interface PasswordResetRepository {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  // Consume el token de forma atomica: devuelve el usuario solo si existia, no expiro y no estaba usado.
  consume(tokenHash: string, now: Date): Promise<string | null>;
  invalidateAllFor(userId: string): Promise<void>;
}

export interface Mailer {
  sendPasswordReset(to: { email: string; name: string }, link: string): Promise<void>;
}

export const PASSWORD_RESET_REPOSITORY = Symbol('PasswordResetRepository');
export const MAILER = Symbol('Mailer');
