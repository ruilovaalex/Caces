export type UserRole = 'ADMIN' | 'COORDINADOR' | 'EVALUADOR' | 'DOCENTE';

export type RoleCapability =
  | 'access_repository'
  | 'access_templates'
  | 'access_assignments'
  | 'upload_evidence'
  | 'delete_evidence'
  | 'review_evidence'
  | 'edit_observations'
  | 'manage_roles'
  | 'manage_teachers'
  | 'supervise_system';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type Permission = 'upload' | 'validate' | 'delete' | 'edit_obs' | 'assign';
