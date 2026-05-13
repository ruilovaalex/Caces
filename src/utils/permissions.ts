import { UserRole } from '../types';

export const canUserUpload = (role: UserRole) => role === 'ADMIN' || role === 'COORDINADOR';
export const canUserValidate = (role: UserRole) => role === 'ADMIN' || role === 'EVALUADOR';
export const canUserDelete = (role: UserRole) => role === 'ADMIN';
export const canUserEditObs = (role: UserRole) => role === 'ADMIN' || role === 'EVALUADOR';
export const canUserRequestAI = (role: UserRole) => role === 'ADMIN' || role === 'COORDINADOR';
