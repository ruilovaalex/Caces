import { UserRole } from './auth.types';

export type AssignmentState = 'CREAR' | 'PAUSA' | 'PROGRESO' | 'COMPLETADO';

export interface Assignment {
  id: string;
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
  assignedTo: string;
  assignedRole: UserRole;
  dueDate: string;
  state: AssignmentState;
  note?: string;
}
