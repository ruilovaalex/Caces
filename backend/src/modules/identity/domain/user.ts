import { Actor, Role } from '../../../shared/domain/actor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  passwordHash: string;
  createdAt: Date;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export const toPublicUser = ({ passwordHash: _hash, ...user }: User): PublicUser => user;

export const toActor = (user: User): Actor => ({ id: user.id, name: user.name, email: user.email, role: user.role });

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const MIN_PASSWORD_LENGTH = 12;
