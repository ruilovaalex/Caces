import { useEffect, useState } from 'react';
import { Assignment } from '../types';
import { AssignmentService } from '../services/assignmentService';

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    AssignmentService.clearAll();
    setAssignments(AssignmentService.getAll());
  }, []);

  return {
    assignments
  };
};
