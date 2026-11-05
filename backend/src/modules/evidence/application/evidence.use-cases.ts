import { Inject, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { APP_CONFIG, AppConfig } from '../../../config/env';
import { AUDIT_LOG, AuditLog } from '../../../shared/application/audit.port';
import { NOTIFIER, Notifier } from '../../../shared/application/notifier.port';
import { Actor } from '../../../shared/domain/actor';
import { NotFoundError } from '../../../shared/domain/errors';
import { resolvePeriod, resolveRequirement, resolveWritablePeriod } from '../../catalog/application/resolve';
import { CATALOG_LOOKUP, CatalogLookup } from '../../catalog/domain/catalog';
import {
  assertReviewDecision,
  EVIDENCE_REPOSITORY,
  EvidencePolicy,
  EvidenceRepository,
  EvidenceVersion,
  FILE_STORAGE,
  FileStorage,
  ReviewDecision,
} from '../domain/evidence';
import { IncomingFile, validateEvidenceFile } from '../domain/file-rules';

const STATUS_LABEL: Record<ReviewDecision, string> = { VALIDADO: 'Validado', OBSERVADO: 'Observado', RECHAZADO: 'Rechazado' };

export interface UploadEvidenceCommand {
  periodCode: string;
  indicatorCode: string;
  requirementNumber: number;
  note?: string;
  file: IncomingFile;
  legacyId?: string;
}

@Injectable()
export class EvidenceUseCases {
  constructor(
    @Inject(EVIDENCE_REPOSITORY) private readonly evidences: EvidenceRepository,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
    @Inject(CATALOG_LOOKUP) private readonly catalog: CatalogLookup,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(AUDIT_LOG) private readonly audit: AuditLog,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async listForPeriod(actor: Actor, periodCode: string): Promise<EvidenceVersion[]> {
    EvidencePolicy.assertCanView(actor);
    const period = await resolvePeriod(this.catalog, periodCode);
    return this.evidences.listByPeriod(period.id);
  }

  async upload(actor: Actor, command: UploadEvidenceCommand, options: { notify?: boolean } = {}): Promise<EvidenceVersion> {
    EvidencePolicy.assertCanUpload(actor);
    const period = await resolveWritablePeriod(this.catalog, command.periodCode);
    const requirement = await resolveRequirement(this.catalog, command.indicatorCode, command.requirementNumber);
    const validated = validateEvidenceFile(command.file, requirement.format, this.config.maxUploadBytes);

    // La clave de almacenamiento no contiene datos del usuario: no hay rutas inseguras posibles.
    const storageKey = `${period.code}/${randomUUID()}.${validated.extension}`;
    await this.storage.put(storageKey, command.file.content);

    let version: EvidenceVersion;
    try {
      version = await this.evidences.appendVersion({
        periodId: period.id,
        requirementId: requirement.id,
        fileName: validated.fileName,
        mimeType: validated.mimeType,
        sizeBytes: validated.size,
        sha256: createHash('sha256').update(command.file.content).digest('hex'),
        storageKey,
        note: command.note?.trim() || null,
        uploadedById: actor.id,
        legacyId: command.legacyId,
      });
    } catch (error) {
      // La version anterior sigue intacta; solo se descarta el archivo nuevo.
      await this.storage.remove(storageKey).catch(() => undefined);
      throw error;
    }

    await this.audit.record({
      actorId: actor.id,
      action: 'evidence.uploaded',
      entityType: 'EvidenceVersion',
      entityId: version.id,
      periodId: period.id,
      metadata: { indicatorCode: requirement.indicatorCode, requirementNumber: requirement.number, version: version.version },
    });
    if (options.notify !== false) {
      await this.notifier.toRoles(['EVALUADOR'], {
        title: 'Nueva evidencia para revisar',
        message: `${period.label} · Indicador ${requirement.indicatorCode}, evidencia ${requirement.number}: version ${version.version} de ${validated.fileName}.`,
        type: 'INFO',
      });
    }
    return version;
  }

  async review(actor: Actor, versionId: string, status: ReviewDecision, comment?: string): Promise<EvidenceVersion> {
    EvidencePolicy.assertCanReview(actor);
    assertReviewDecision(status, comment);
    const version = await this.findVisible(versionId);
    const updated = await this.evidences.addReview(version.id, status, comment?.trim() || null, actor.id);

    await this.audit.record({
      actorId: actor.id,
      action: 'evidence.reviewed',
      entityType: 'EvidenceVersion',
      entityId: version.id,
      periodId: version.periodId,
      metadata: { status, comment: comment?.trim() || null },
    });
    await this.notifier.toUsers([version.uploadedById], {
      title: `Evidencia ${STATUS_LABEL[status].toLowerCase()}`,
      message: `Indicador ${version.indicatorCode}, evidencia ${version.requirementNumber} (v${version.version}): ${STATUS_LABEL[status]}${comment?.trim() ? ` — ${comment.trim()}` : ''}`,
      type: status === 'VALIDADO' ? 'SUCCESS' : status === 'OBSERVADO' ? 'WARNING' : 'ERROR',
    });
    return updated;
  }

  async remove(actor: Actor, versionId: string): Promise<void> {
    const version = await this.findVisible(versionId);
    EvidencePolicy.assertCanDelete(actor, version);
    await resolveWritablePeriod(this.catalog, version.periodCode);
    await this.evidences.softDelete(version.id, actor.id);
    await this.audit.record({
      actorId: actor.id,
      action: 'evidence.deleted',
      entityType: 'EvidenceVersion',
      entityId: version.id,
      periodId: version.periodId,
      metadata: { version: version.version, fileName: version.fileName },
    });
  }

  async openContent(actor: Actor, versionId: string) {
    EvidencePolicy.assertCanView(actor);
    const version = await this.findVisible(versionId);
    return { version, stream: await this.storage.open(version.storageKey) };
  }

  private async findVisible(versionId: string) {
    const version = await this.evidences.findById(versionId);
    if (!version) throw new NotFoundError('Evidencia no encontrada');
    return version;
  }
}
