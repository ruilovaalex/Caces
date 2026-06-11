import { useCallback, useEffect, useState } from 'react';
import { Assignment, AssignmentState } from '../types';
import { AssignmentService } from '../services/assignmentService';

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const refreshAssignments = useCallback(() => {
    setAssignments(AssignmentService.getAll());
  }, []);

  useEffect(() => {
    refreshAssignments();
  }, [refreshAssignments]);

  const createAssignment = useCallback((assignment: Assignment) => {
    AssignmentService.create(assignment);
    refreshAssignments();
  }, [refreshAssignments]);

  const updateAssignmentState = useCallback((id: string, state: AssignmentState) => {
    AssignmentService.updateState(id, state);
    refreshAssignments();
  }, [refreshAssignments]);

  return {
    assignments,
    createAssignment,
    updateAssignmentState,
    refreshAssignments
  };
};
