import { UserRole } from '../types';

export const canUserUpload = (role: UserRole) => role === 'COORDINADOR';
export const canUserValidate = (role: UserRole) => role === 'EVALUADOR';
export const canUserDelete = (role: UserRole) => role === 'COORDINADOR';
export const canUserEditObs = (role: UserRole) => role === 'EVALUADOR';
export const canUserAssign = (role: UserRole) => role === 'COORDINADOR';
export const canUserManageRoles = (role: UserRole) => role === 'ADMIN';
export const canUserManageTeachers = (role: UserRole) => role === 'COORDINADOR';
