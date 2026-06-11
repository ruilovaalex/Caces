import { RoleCapability, UserRole } from '../types';

export const ROLE_CAPABILITIES: Record<UserRole, RoleCapability[]> = {
  ADMIN: [
    'access_repository',
    'access_templates',
    'access_assignments',
    'manage_roles',
    'supervise_system'
  ],
  COORDINADOR: [
    'access_repository',
    'access_templates',
    'access_assignments',
    'upload_evidence',
    'delete_evidence',
    'manage_teachers'
  ],
  EVALUADOR: [
    'access_repository',
    'review_evidence',
    'edit_observations'
  ],
  DOCENTE: []
};

export const hasCapability = (role: UserRole, capability: RoleCapability) =>
  ROLE_CAPABILITIES[role].includes(capability);

export const canAccessRepository = (role: UserRole) => hasCapability(role, 'access_repository');
export const canAccessTemplates = (role: UserRole) => hasCapability(role, 'access_templates');
export const canAccessAssignments = (role: UserRole) => hasCapability(role, 'access_assignments');
export const canReviewEvidence = (role: UserRole) => hasCapability(role, 'review_evidence');
export const canUserUpload = (role: UserRole) => hasCapability(role, 'upload_evidence');
export const canUserValidate = canReviewEvidence;
export const canUserDelete = (role: UserRole) => hasCapability(role, 'delete_evidence');
export const canUserEditObs = (role: UserRole) => hasCapability(role, 'edit_observations');
export const canUserAssign = (role: UserRole) => role === 'COORDINADOR';
export const canUserManageRoles = (role: UserRole) => hasCapability(role, 'manage_roles');
export const canUserManageTeachers = (role: UserRole) => hasCapability(role, 'manage_teachers');
export const canSuperviseSystem = (role: UserRole) => hasCapability(role, 'supervise_system');
