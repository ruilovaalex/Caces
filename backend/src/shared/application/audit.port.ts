export interface AuditEntry {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  periodId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AuditLog {
  record(entry: AuditEntry): Promise<void>;
}

export const AUDIT_LOG = Symbol('AuditLog');
