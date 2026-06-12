import {
  CoordinatorAssignmentSummary,
  CoordinatorProfile,
  IndicatorCoordinatorAssignment
} from '../types';
import { StorageService } from './storageService';

const COORDINATORS_KEY = 'edusudamericano_local_coordinators_v1';
const ASSIGNMENTS_KEY = 'edusudamericano_coordinator_indicator_assignments_v1';

const DEFAULT_COORDINATOR: CoordinatorProfile = {
  id: 'coord-1',
  name: 'Coord. Academico',
  email: 'coordinador@edusudamericano.edu.ec',
  area: 'Coordinacion general',
  active: true
};

type CreateCoordinatorPayload = Omit<CoordinatorProfile, 'id' | 'active'> & {
  id?: string;
  active?: boolean;
};

interface AssignIndicatorPayload {
  coordinatorId: string;
  coordinatorName: string;
  indicatorCode: string;
  indicatorName: string;
  createdBy: string;
}

const ensureDefaultCoordinator = (coordinators: CoordinatorProfile[]) => {
  if (coordinators.some(coordinator => coordinator.id === DEFAULT_COORDINATOR.id)) {
    return coordinators;
  }

  return [DEFAULT_COORDINATOR, ...coordinators];
};

export const CoordinatorAssignmentService = {
  getCoordinators: (): CoordinatorProfile[] => {
    const saved = StorageService.get<CoordinatorProfile[]>(COORDINATORS_KEY);

    if (!saved) {
      StorageService.set(COORDINATORS_KEY, [DEFAULT_COORDINATOR]);
      return [DEFAULT_COORDINATOR];
    }

    const coordinators = ensureDefaultCoordinator(saved);
    if (coordinators.length !== saved.length) {
      StorageService.set(COORDINATORS_KEY, coordinators);
    }

    return coordinators;
  },

  saveCoordinators: (coordinators: CoordinatorProfile[]): void => {
    StorageService.set(COORDINATORS_KEY, ensureDefaultCoordinator(coordinators));
  },

  createCoordinator: (payload: CreateCoordinatorPayload): CoordinatorProfile => {
    const coordinators = CoordinatorAssignmentService.getCoordinators();
    const coordinator: CoordinatorProfile = {
      id: payload.id || crypto.randomUUID(),
      name: payload.name.trim(),
      email: payload.email.trim(),
      area: payload.area?.trim() || 'Sin area asignada',
      active: payload.active ?? true
    };

    if (!coordinator.name || !coordinator.email) {
      return coordinator;
    }

    const exists = coordinators.some(item => item.id === coordinator.id || item.email === coordinator.email);
    if (!exists) {
      CoordinatorAssignmentService.saveCoordinators([coordinator, ...coordinators]);
    }

    return coordinator;
  },

  getAssignments: (): IndicatorCoordinatorAssignment[] =>
    StorageService.get<IndicatorCoordinatorAssignment[]>(ASSIGNMENTS_KEY) || [],

  saveAssignments: (assignments: IndicatorCoordinatorAssignment[]): void => {
    StorageService.set(ASSIGNMENTS_KEY, assignments);
  },

  assignIndicator: (payload: AssignIndicatorPayload): IndicatorCoordinatorAssignment => {
    const assignments = CoordinatorAssignmentService.getAssignments();
    const existing = assignments.find(
      assignment =>
        assignment.coordinatorId === payload.coordinatorId &&
        assignment.indicatorCode === payload.indicatorCode
    );

    if (existing) return existing;

    const assignment: IndicatorCoordinatorAssignment = {
      id: crypto.randomUUID(),
      coordinatorId: payload.coordinatorId,
      coordinatorName: payload.coordinatorName,
      indicatorCode: payload.indicatorCode,
      indicatorName: payload.indicatorName,
      createdAt: new Date().toISOString(),
      createdBy: payload.createdBy
    };

    CoordinatorAssignmentService.saveAssignments([assignment, ...assignments]);
    return assignment;
  },

  removeAssignment: (assignmentId: string): void => {
    const assignments = CoordinatorAssignmentService.getAssignments();
    CoordinatorAssignmentService.saveAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
  },

  getAssignmentsByCoordinator: (coordinatorId: string): IndicatorCoordinatorAssignment[] =>
    CoordinatorAssignmentService.getAssignments().filter(
      assignment => assignment.coordinatorId === coordinatorId
    ),

  getAssignedIndicatorCodes: (coordinatorId: string): string[] =>
    CoordinatorAssignmentService.getAssignmentsByCoordinator(coordinatorId).map(
      assignment => assignment.indicatorCode
    ),

  getSummaryByCoordinator: (coordinatorId: string): CoordinatorAssignmentSummary => {
    const coordinator = CoordinatorAssignmentService.getCoordinators().find(item => item.id === coordinatorId);
    const assignments = CoordinatorAssignmentService.getAssignmentsByCoordinator(coordinatorId);

    return {
      coordinatorId,
      coordinatorName: coordinator?.name || 'Coordinador local',
      totalAssigned: assignments.length,
      assignedIndicatorCodes: assignments.map(assignment => assignment.indicatorCode)
    };
  }
};
