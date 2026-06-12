export interface CoordinatorProfile {
  id: string;
  name: string;
  email: string;
  area?: string;
  active: boolean;
}

export interface IndicatorCoordinatorAssignment {
  id: string;
  coordinatorId: string;
  coordinatorName: string;
  indicatorCode: string;
  indicatorName: string;
  createdAt: string;
  createdBy: string;
}

export interface CoordinatorAssignmentSummary {
  coordinatorId: string;
  coordinatorName: string;
  totalAssigned: number;
  assignedIndicatorCodes: string[];
}
