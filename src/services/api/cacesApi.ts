import {
  IndicatorAssessment,
  IndicatorRating,
  EvidenceDraft,
  Notification,
  PresentialVerification,
  Status,
  UploadedFile,
  User,
  UserRole,
  VerificationResult,
} from '../../types';
import { getDisplayFileType } from '../../utils/evidenceFormatUtils';
import { api, tokenStore } from './apiClient';

// --- Contratos de la API ---

type ApiEvidenceStatus = 'CARGADO' | 'VALIDADO' | 'OBSERVADO' | 'RECHAZADO';

interface ApiEvidence {
  id: string;
  periodCode: string;
  indicatorCode: string;
  requirementNumber: number;
  version: number;
  isCurrent: boolean;
  status: ApiEvidenceStatus;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  note: string | null;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  lastComment: string | null;
  reviews: { id: string; status: ApiEvidenceStatus; comment: string | null; reviewerName: string; createdAt: string }[];
}

interface ApiVerification {
  id: string;
  indicatorCode: string;
  requirementNumber: number;
  result: 'VERIFICADA' | 'CON_OBSERVACIONES';
  notes: string;
  verifiedByName: string;
  verifiedAt: string;
}

interface ApiAssessment {
  id: string;
  indicatorCode: string;
  rating: IndicatorRating;
  score: number;
  achievements: string;
  deficiencies: string;
  assessedByName: string;
  assessedAt: string;
}

interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface ApiPeriod {
  id: string;
  code: string;
  label: string;
  year: number;
  active: boolean;
}

// --- Conversion a los tipos que ya usa la interfaz ---

const STATUS_FROM_API: Record<ApiEvidenceStatus, Status> = {
  CARGADO: 'Cargado',
  VALIDADO: 'Validado',
  OBSERVADO: 'Observado',
  RECHAZADO: 'Rechazado',
};

const STATUS_TO_API: Partial<Record<Status, Exclude<ApiEvidenceStatus, 'CARGADO'>>> = {
  Validado: 'VALIDADO',
  Observado: 'OBSERVADO',
  Rechazado: 'RECHAZADO',
};

const toUploadedFile = (evidence: ApiEvidence): UploadedFile => ({
  id: evidence.id,
  indicatorCode: evidence.indicatorCode,
  requirementId: String(evidence.requirementNumber),
  requirementLabel: '',
  fileName: evidence.fileName,
  fileType: getDisplayFileType(evidence.fileName, evidence.mimeType),
  fileSize: `${(evidence.sizeBytes / 1024).toFixed(1)} KB`,
  uploadDate: new Date(evidence.uploadedAt).toLocaleString(),
  uploadedBy: evidence.uploadedByName,
  version: evidence.version,
  status: STATUS_FROM_API[evidence.status],
  observation: evidence.lastComment ?? evidence.note ?? undefined,
  isCurrentVersion: evidence.isCurrent,
  periodCode: evidence.periodCode,
  source: 'api',
});

const toVerification = (record: ApiVerification): PresentialVerification => ({
  id: record.id,
  indicatorCode: record.indicatorCode,
  requirementId: String(record.requirementNumber),
  requirementLabel: '',
  result: record.result === 'VERIFICADA' ? 'Verificada' : 'Con observaciones',
  notes: record.notes,
  verifiedBy: record.verifiedByName,
  verifiedAt: record.verifiedAt,
});

const toAssessment = (record: ApiAssessment): IndicatorAssessment => ({
  id: record.id,
  indicatorCode: record.indicatorCode,
  rating: record.rating,
  score: record.score,
  achievements: record.achievements,
  deficiencies: record.deficiencies,
  assessedBy: record.assessedByName,
  assessedAt: record.assessedAt,
});

const toNotification = (record: ApiNotification): Notification => ({
  id: record.id,
  title: record.title,
  message: record.message,
  type: record.type.toLowerCase() as Notification['type'],
  timestamp: new Date(record.createdAt).toLocaleString(),
  isRead: Boolean(record.readAt),
  link: record.link ?? undefined,
});

const period = (code: string) => `/periods/${encodeURIComponent(code)}`;

// --- Operaciones ---

export const AuthApi = {
  login: async (email: string, password: string): Promise<User> => {
    const result = await api.post<{ token: string; user: { id: string; email: string; name: string; role: UserRole } }>(
      '/auth/login',
      { email, password },
    );
    tokenStore.set(result.token);
    return { id: result.user.id, email: result.user.email, name: result.user.name, role: result.user.role };
  },
  me: () => api.get<User>('/auth/me'),
  // Publico: indica si la recuperacion de clave es por correo o la hace el administrador.
  options: () => api.get<{ passwordRecovery: 'email' | 'admin'; minPasswordLength: number }>('/auth/options'),
  forgotPassword: (email: string) => api.post<void>('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post<void>('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<void>('/auth/change-password', { currentPassword, newPassword }),
  logout: () => tokenStore.clear(),
};

export const CatalogApi = {
  periods: () => api.get<ApiPeriod[]>('/periods'),
};

export const EvidenceApi = {
  list: async (periodCode: string) => (await api.get<ApiEvidence[]>(`${period(periodCode)}/evidences`)).map(toUploadedFile),

  upload: (periodCode: string, indicatorCode: string, requirementId: string, file: File, note?: string) => {
    const form = new FormData();
    form.append('indicatorCode', indicatorCode);
    form.append('requirementNumber', requirementId);
    if (note?.trim()) form.append('note', note.trim());
    form.append('file', file);
    return api.post<ApiEvidence>(`${period(periodCode)}/evidences`, form);
  },

  review: (evidenceId: string, status: Status, comment?: string) => {
    const apiStatus = STATUS_TO_API[status];
    if (!apiStatus) throw new Error(`Estado de revision no valido: ${status}`);
    return api.post<ApiEvidence>(`/evidences/${evidenceId}/reviews`, { status: apiStatus, comment: comment?.trim() || undefined });
  },

  remove: (evidenceId: string) => api.delete(`/evidences/${evidenceId}`),

  content: (evidenceId: string) => api.blob(`/evidences/${evidenceId}/content`),

  importLocal: (periodCode: string, local: UploadedFile, blob: Blob) => {
    const form = new FormData();
    form.append('legacyId', local.id);
    form.append('indicatorCode', local.indicatorCode);
    form.append('requirementNumber', local.requirementId);
    if (local.observation) form.append('note', local.observation.slice(0, 1000));
    form.append('legacyStatus', local.status);
    form.append('legacyUploadedBy', local.uploadedBy.slice(0, 120));
    form.append('legacyUploadDate', local.uploadDate.slice(0, 60));
    form.append('file', blob, local.fileName);
    return api.post<{ outcome: 'imported' | 'skipped' }>(`${period(periodCode)}/imports/evidences`, form);
  },
};

export const EvaluationApi = {
  verifications: async (periodCode: string) =>
    (await api.get<ApiVerification[]>(`${period(periodCode)}/verifications`)).map(toVerification),

  registerVerification: (periodCode: string, indicatorCode: string, requirementId: string, result: VerificationResult, notes: string) =>
    api.post(`${period(periodCode)}/verifications`, {
      indicatorCode,
      requirementNumber: Number(requirementId),
      result: result === 'Verificada' ? 'VERIFICADA' : 'CON_OBSERVACIONES',
      notes,
    }),

  assessments: async (periodCode: string) =>
    (await api.get<ApiAssessment[]>(`${period(periodCode)}/assessments`)).map(toAssessment),

  registerAssessment: (periodCode: string, indicatorCode: string, rating: IndicatorRating, achievements: string, deficiencies: string) =>
    api.post(`${period(periodCode)}/assessments`, { indicatorCode, rating, achievements, deficiencies: deficiencies || undefined }),

  importVerification: (periodCode: string, local: PresentialVerification) =>
    api.post<{ outcome: 'imported' | 'skipped' }>(`${period(periodCode)}/imports/verifications`, {
      legacyId: local.id,
      indicatorCode: local.indicatorCode,
      requirementNumber: Number(local.requirementId),
      result: local.result === 'Verificada' ? 'VERIFICADA' : 'CON_OBSERVACIONES',
      notes: local.notes,
      legacyVerifiedBy: local.verifiedBy.slice(0, 120),
    }),

  importAssessment: (periodCode: string, local: IndicatorAssessment) =>
    api.post<{ outcome: 'imported' | 'skipped' }>(`${period(periodCode)}/imports/assessments`, {
      legacyId: local.id,
      indicatorCode: local.indicatorCode,
      rating: local.rating,
      achievements: local.achievements,
      deficiencies: local.deficiencies || undefined,
    }),
};

export const NotificationApi = {
  list: async () => {
    const page = await api.get<{ items: ApiNotification[] }>('/notifications?pageSize=50');
    return page.items.map(toNotification);
  },
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  remove: (id: string) => api.delete(`/notifications/${id}`),
  clearMine: () => api.delete('/notifications'),
};

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export const UsersApi = {
  list: async (): Promise<ManagedUser[]> =>
    (await api.get<{ items: ManagedUser[] }>('/users?page=1&pageSize=100')).items,
  create: (data: { email: string; name: string; role: UserRole; password: string }) =>
    api.post<ManagedUser>('/users', data),
  update: (id: string, data: Partial<{ name: string; role: UserRole; active: boolean; password: string }>) =>
    api.patch<ManagedUser>(`/users/${id}`, data),
};

export type TaskStatus = 'NUEVA' | 'EN_PROGRESO' | 'ENTREGADA';

export interface TeacherTask {
  id: string;
  periodCode: string;
  assigneeId: string;
  assigneeName: string;
  createdByName: string;
  indicatorCode: string;
  title: string;
  evidenceLabel: string;
  dueDate: string;
  status: TaskStatus;
}

export const TasksApi = {
  teachers: () => api.get<{ id: string; name: string; email: string }[]>('/teachers'),
  list: (periodCode: string) => api.get<TeacherTask[]>(`${period(periodCode)}/tasks`),
  create: (periodCode: string, data: { assigneeId: string; indicatorCode: string; title: string; evidenceLabel: string; dueDate: string }) =>
    api.post<TeacherTask>(`${period(periodCode)}/tasks`, data),
  changeStatus: (id: string, status: TaskStatus) => api.patch<TeacherTask>(`/tasks/${id}/status`, { status }),
  remove: (id: string) => api.delete(`/tasks/${id}`),
};

export const DraftsApi = {
  list: (periodCode: string) => api.get<EvidenceDraft[]>(`${period(periodCode)}/drafts`),
  save: (periodCode: string, draft: EvidenceDraft, baseVersion: number) =>
    api.put<EvidenceDraft>(`${period(periodCode)}/drafts/${encodeURIComponent(draft.indicatorCode)}/${encodeURIComponent(draft.requirementId)}`, {
      baseVersion,
      requirementLabel: draft.requirementLabel,
      templateId: draft.templateId,
      sections: draft.sections,
      status: draft.status,
      observations: draft.observations,
    }),
  remove: (periodCode: string, indicatorCode: string, requirementId: string) =>
    api.delete(`${period(periodCode)}/drafts/${encodeURIComponent(indicatorCode)}/${encodeURIComponent(requirementId)}`),
};
