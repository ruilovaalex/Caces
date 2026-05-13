export type UserRole = 'ADMIN' | 'COORDINADOR' | 'EVALUADOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type Permission = 'upload' | 'validate' | 'delete' | 'edit_obs' | 'request_ai';
