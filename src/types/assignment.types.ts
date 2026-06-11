export type AssignmentState = 'CREAR' | 'PAUSA' | 'PROGRESO' | 'COMPLETADO';
export type AssignmentMode = 'SINGLE' | 'MULTIPLE' | 'ALL';

export interface Assignment {
  id: string;
  title: string;
  periodId: string;
  periodLabel: string;
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
  assignedTeacherIds: string[];
  assignedTeacherNames: string[];
  assignmentMode: AssignmentMode;
  dueDate: string;
  state: AssignmentState;
  note?: string;
}
