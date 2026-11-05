import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import {
  AssessmentRepository,
  IndicatorAssessment,
  IndicatorRating,
  PresentialVerification,
  VerificationRepository,
  VerificationResult,
} from '../domain/evaluation';

const VERIFICATION_INCLUDE = {
  period: { select: { code: true } },
  requirement: { select: { number: true, indicator: { select: { code: true } } } },
  verifiedBy: { select: { name: true } },
} satisfies Prisma.PresentialVerificationInclude;

const ASSESSMENT_INCLUDE = {
  period: { select: { code: true } },
  indicator: { select: { code: true } },
  assessedBy: { select: { name: true } },
} satisfies Prisma.IndicatorAssessmentInclude;

const toVerification = (row: Prisma.PresentialVerificationGetPayload<{ include: typeof VERIFICATION_INCLUDE }>): PresentialVerification => ({
  id: row.id,
  periodCode: row.period.code,
  indicatorCode: row.requirement.indicator.code,
  requirementNumber: row.requirement.number,
  result: row.result,
  notes: row.notes,
  verifiedByName: row.verifiedBy.name,
  verifiedAt: row.verifiedAt,
});

const toAssessment = (row: Prisma.IndicatorAssessmentGetPayload<{ include: typeof ASSESSMENT_INCLUDE }>): IndicatorAssessment => ({
  id: row.id,
  periodCode: row.period.code,
  indicatorCode: row.indicator.code,
  rating: row.rating,
  score: Number(row.score),
  achievements: row.achievements,
  deficiencies: row.deficiencies,
  assessedByName: row.assessedBy.name,
  assessedAt: row.assessedAt,
});

@Injectable()
export class PrismaVerificationRepository implements VerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByPeriod(periodId: string) {
    const rows = await this.prisma.presentialVerification.findMany({
      where: { periodId },
      orderBy: { verifiedAt: 'desc' },
      include: VERIFICATION_INCLUDE,
    });
    return rows.map(toVerification);
  }

  async create(data: { periodId: string; requirementId: string; result: VerificationResult; notes: string; verifiedById: string; legacyId?: string }) {
    return toVerification(await this.prisma.presentialVerification.create({ data, include: VERIFICATION_INCLUDE }));
  }

  async existsLegacy(legacyId: string) {
    return (await this.prisma.presentialVerification.count({ where: { legacyId } })) > 0;
  }
}

@Injectable()
export class PrismaAssessmentRepository implements AssessmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByPeriod(periodId: string) {
    const rows = await this.prisma.indicatorAssessment.findMany({
      where: { periodId },
      orderBy: { assessedAt: 'desc' },
      include: ASSESSMENT_INCLUDE,
    });
    return rows.map(toAssessment);
  }

  async create(data: {
    periodId: string;
    indicatorId: string;
    rating: IndicatorRating;
    score: number;
    achievements: string;
    deficiencies: string;
    assessedById: string;
    legacyId?: string;
  }) {
    const row = await this.prisma.indicatorAssessment.create({
      data: { ...data, score: new Prisma.Decimal(data.score) },
      include: ASSESSMENT_INCLUDE,
    });
    return toAssessment(row);
  }

  async existsLegacy(legacyId: string) {
    return (await this.prisma.indicatorAssessment.count({ where: { legacyId } })) > 0;
  }
}
