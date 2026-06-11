import { Assignment, AssignmentState } from '../types';
import { INITIAL_ASSIGNMENTS } from '../data/assignments';
import { StorageService } from './storageService';

const STORAGE_KEY = 'edusudamericano_assignments_v1';

type LegacyAssignment = Partial<Assignment> & {
  assignedTo?: string;
  assignedRole?: string;
  teacherId?: string;
  teacherName?: string;
  evidenceLabel?: string;
};

const normalizeAssignment = (assignment: LegacyAssignment): Assignment | null => {
  if (!assignment.id || !assignment.indicatorCode || !assignment.dueDate) return null;

  const assignedTeacherIds = assignment.assignedTeacherIds?.length
    ? assignment.assignedTeacherIds
    : assignment.teacherId
      ? [assignment.teacherId]
      : assignment.assignedTo
        ? [assignment.assignedTo]
        : [];

  const assignedTeacherNames = assignment.assignedTeacherNames?.length
    ? assignment.assignedTeacherNames
    : assignment.teacherName
      ? [assignment.teacherName]
      : [];

  return {
    id: assignment.id,
    title: assignment.title || 'Tarea sin titulo',
    periodId: assignment.periodId || 'local-period',
    periodLabel: assignment.periodLabel || 'Periodo local',
    indicatorCode: assignment.indicatorCode,
    requirementId: assignment.requirementId || assignment.evidenceLabel || 'local-requirement',
    requirementLabel: assignment.requirementLabel || assignment.evidenceLabel || 'Evidencia local',
    assignedTeacherIds,
    assignedTeacherNames,
    assignmentMode: assignment.assignmentMode || (assignedTeacherIds.length > 1 ? 'MULTIPLE' : 'SINGLE'),
    dueDate: assignment.dueDate,
    state: assignment.state || 'CREAR',
    note: assignment.note
  };
};

const readStoredAssignments = (): Assignment[] | null => {
  const stored = StorageService.get<LegacyAssignment[]>(STORAGE_KEY);
  if (!stored) return null;
  return stored
    .map(normalizeAssignment)
    .filter((assignment): assignment is Assignment => Boolean(assignment));
};

export const AssignmentService = {
  getAll: (): Assignment[] => {
    const stored = readStoredAssignments();
    if (stored) return stored;

    StorageService.set(STORAGE_KEY, INITIAL_ASSIGNMENTS);
    return INITIAL_ASSIGNMENTS;
  },

  create: (assignment: Assignment): Assignment => {
    const assignments = AssignmentService.getAll();
    const nextAssignments = [assignment, ...assignments];
    AssignmentService.saveAll(nextAssignments);
    return assignment;
  },

  updateState: (id: string, state: AssignmentState): void => {
    const assignments = AssignmentService.getAll().map(assignment =>
      assignment.id === id ? { ...assignment, state } : assignment
    );
    AssignmentService.saveAll(assignments);
  },

  saveAll: (assignments: Assignment[]): void => {
    StorageService.set(STORAGE_KEY, assignments);
  },

  clearAll: (): void => {
    StorageService.set(STORAGE_KEY, []);
  }
};
