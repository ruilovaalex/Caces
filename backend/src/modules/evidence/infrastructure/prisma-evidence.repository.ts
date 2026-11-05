import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../../../shared/domain/errors';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { AppendVersionInput, EvidenceRepository, EvidenceVersion, ReviewDecision } from '../domain/evidence';

const INCLUDE = {
  period: { select: { code: true } },
  requirement: { select: { number: true, indicator: { select: { code: true } } } },
  uploadedBy: { select: { name: true } },
  reviews: { orderBy: { createdAt: 'desc' }, include: { reviewer: { select: { name: true } } } },
} satisfies Prisma.EvidenceVersionInclude;

type Row = Prisma.EvidenceVersionGetPayload<{ include: typeof INCLUDE }>;

const toDomain = (row: Row): EvidenceVersion => ({
  id: row.id,
  periodId: row.periodId,
  periodCode: row.period.code,
  requirementId: row.requirementId,
  indicatorCode: row.requirement.indicator.code,
  requirementNumber: row.requirement.number,
  version: row.version,
  isCurrent: row.isCurrent,
  status: row.status,
  fileName: row.fileName,
  mimeType: row.mimeType,
  sizeBytes: row.sizeBytes,
  storageKey: row.storageKey,
  note: row.note,
  uploadedById: row.uploadedById,
  uploadedByName: row.uploadedBy.name,
  uploadedAt: row.uploadedAt,
  lastComment: row.reviews[0]?.comment ?? null,
  reviews: row.reviews.map(review => ({
    id: review.id,
    status: review.status,
    comment: review.comment,
    reviewerName: review.reviewer.name,
    createdAt: review.createdAt,
  })),
});

@Injectable()
export class PrismaEvidenceRepository implements EvidenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByPeriod(periodId: string): Promise<EvidenceVersion[]> {
    const rows = await this.prisma.evidenceVersion.findMany({
      where: { periodId, deletedAt: null },
      orderBy: [{ requirementId: 'asc' }, { version: 'desc' }],
      include: INCLUDE,
    });
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<EvidenceVersion | null> {
    const row = await this.prisma.evidenceVersion.findFirst({ where: { id, deletedAt: null }, include: INCLUDE });
    return row ? toDomain(row) : null;
  }

  async findByLegacyId(legacyId: string): Promise<EvidenceVersion | null> {
    const row = await this.prisma.evidenceVersion.findFirst({ where: { legacyId }, include: INCLUDE });
    return row ? toDomain(row) : null;
  }

  async appendVersion(input: AppendVersionInput): Promise<EvidenceVersion> {
    const row = await this.prisma.$transaction(async tx => {
      await this.lockSlot(tx, input.periodId, input.requirementId);
      // La numeracion considera tambien las versiones retiradas: un numero nunca se reutiliza.
      const last = await tx.evidenceVersion.aggregate({
        where: { periodId: input.periodId, requirementId: input.requirementId },
        _max: { version: true },
      });
      await tx.evidenceVersion.updateMany({
        where: { periodId: input.periodId, requirementId: input.requirementId, isCurrent: true },
        data: { isCurrent: false },
      });
      return tx.evidenceVersion.create({
        data: {
          periodId: input.periodId,
          requirementId: input.requirementId,
          version: (last._max.version ?? 0) + 1,
          isCurrent: true,
          status: 'CARGADO',
          fileName: input.fileName,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          sha256: input.sha256,
          storageKey: input.storageKey,
          note: input.note,
          uploadedById: input.uploadedById,
          legacyId: input.legacyId ?? null,
        },
        include: INCLUDE,
      });
    });
    return toDomain(row);
  }

  async addReview(versionId: string, status: ReviewDecision, comment: string | null, reviewerId: string): Promise<EvidenceVersion> {
    const row = await this.prisma.$transaction(async tx => {
      await tx.evidenceReview.create({ data: { evidenceVersionId: versionId, status, comment, reviewerId } });
      return tx.evidenceVersion.update({ where: { id: versionId }, data: { status }, include: INCLUDE });
    });
    return toDomain(row);
  }

  async softDelete(versionId: string, actorId: string): Promise<void> {
    await this.prisma.$transaction(async tx => {
      const version = await tx.evidenceVersion.findFirst({ where: { id: versionId, deletedAt: null } });
      if (!version) throw new NotFoundError('Evidencia no encontrada');
      await this.lockSlot(tx, version.periodId, version.requirementId);

      await tx.evidenceVersion.update({
        where: { id: versionId },
        data: { deletedAt: new Date(), deletedById: actorId, isCurrent: false },
      });
      if (!version.isCurrent) return;

      const previous = await tx.evidenceVersion.findFirst({
        where: { periodId: version.periodId, requirementId: version.requirementId, deletedAt: null },
        orderBy: { version: 'desc' },
      });
      if (previous) await tx.evidenceVersion.update({ where: { id: previous.id }, data: { isCurrent: true } });
    });
  }

  // Bloqueo transaccional por (periodo, requerimiento): serializa cargas y retiros concurrentes.
  private async lockSlot(tx: Prisma.TransactionClient, periodId: string, requirementId: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${periodId}:${requirementId}`}, 0))`;
  }
}
