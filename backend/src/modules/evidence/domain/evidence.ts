import { Readable } from 'node:stream';
import { Actor } from '../../../shared/domain/actor';
import { ForbiddenError, ValidationError } from '../../../shared/domain/errors';

export type EvidenceStatus = 'CARGADO' | 'VALIDADO' | 'OBSERVADO' | 'RECHAZADO';
export type ReviewDecision = Exclude<EvidenceStatus, 'CARGADO'>;

export interface EvidenceReview {
  id: string;
  status: EvidenceStatus;
  comment: string | null;
  reviewerName: string;
  createdAt: Date;
}

export interface EvidenceVersion {
  id: string;
  periodId: string;
  periodCode: string;
  requirementId: string;
  indicatorCode: string;
  requirementNumber: number;
  version: number;
  isCurrent: boolean;
  status: EvidenceStatus;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  note: string | null;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: Date;
  lastComment: string | null;
  reviews: EvidenceReview[];
}

// --- Politica de acceso (dominio puro) ---

const VIEWER_ROLES = new Set(['ADMIN', 'COORDINADOR', 'EVALUADOR']);

export const EvidencePolicy = {
  assertCanView(actor: Actor) {
    // DOCENTE no consulta el repositorio oficial hasta que existan asignaciones en el backend.
    if (!VIEWER_ROLES.has(actor.role)) throw new ForbiddenError('No tienes acceso al repositorio de evidencias');
  },

  assertCanUpload(actor: Actor) {
    if (actor.role !== 'COORDINADOR') throw new ForbiddenError('Solo el coordinador carga evidencias oficiales');
  },

  assertCanReview(actor: Actor) {
    if (actor.role !== 'EVALUADOR') throw new ForbiddenError('Solo el evaluador revisa evidencias');
  },

  // Cada coordinador solo puede retirar versiones que el mismo cargo.
  assertCanDelete(actor: Actor, version: EvidenceVersion) {
    if (actor.role !== 'COORDINADOR') throw new ForbiddenError('Solo el coordinador puede retirar versiones');
    if (version.uploadedById !== actor.id) throw new ForbiddenError('Solo puedes retirar versiones que cargaste tu');
  },
};

export const assertReviewDecision = (status: ReviewDecision, comment?: string | null) => {
  if ((status === 'OBSERVADO' || status === 'RECHAZADO') && !comment?.trim()) {
    throw new ValidationError('Indica el motivo para que el coordinador sepa que corregir');
  }
};

// --- Puertos ---

export interface AppendVersionInput {
  periodId: string;
  requirementId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  storageKey: string;
  note: string | null;
  uploadedById: string;
  legacyId?: string;
}

export interface EvidenceRepository {
  listByPeriod(periodId: string): Promise<EvidenceVersion[]>;
  findById(id: string): Promise<EvidenceVersion | null>;
  findByLegacyId(legacyId: string): Promise<EvidenceVersion | null>;
  // Debe ser atomica: numera la version sin colisiones y deja una unica version vigente (la nueva).
  appendVersion(input: AppendVersionInput): Promise<EvidenceVersion>;
  addReview(versionId: string, status: ReviewDecision, comment: string | null, reviewerId: string): Promise<EvidenceVersion>;
  // Retiro logico: se conserva el registro y el archivo; si era la vigente, pasa a vigente la anterior.
  softDelete(versionId: string, actorId: string): Promise<void>;
}

export interface FileStorage {
  put(key: string, content: Buffer): Promise<void>;
  open(key: string): Promise<Readable>;
  remove(key: string): Promise<void>;
}

export const EVIDENCE_REPOSITORY = Symbol('EvidenceRepository');
export const FILE_STORAGE = Symbol('FileStorage');
