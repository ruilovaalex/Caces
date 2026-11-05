export type Role = 'ADMIN' | 'COORDINADOR' | 'EVALUADOR' | 'DOCENTE';

export const ROLES: readonly Role[] = ['ADMIN', 'COORDINADOR', 'EVALUADOR', 'DOCENTE'];

// Usuario autenticado que ejecuta un caso de uso.
export interface Actor {
  id: string;
  name: string;
  email: string;
  role: Role;
}
