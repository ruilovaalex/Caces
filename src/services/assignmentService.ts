import { Assignment } from '../types';
import { INITIAL_ASSIGNMENTS } from '../data/assignments';
import { StorageService } from './storageService';

const STORAGE_KEY = 'edusudamericano_assignments_v1';

export const AssignmentService = {
  getAll: (): Assignment[] => {
    StorageService.set(STORAGE_KEY, INITIAL_ASSIGNMENTS);
    return INITIAL_ASSIGNMENTS;
  },

  saveAll: (assignments: Assignment[]): void => {
    StorageService.set(STORAGE_KEY, assignments);
  },

  clearAll: (): void => {
    StorageService.set(STORAGE_KEY, []);
  }
};
