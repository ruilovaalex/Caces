import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_LOG, AuditLog } from '../../../shared/application/audit.port';
import { NOTIFIER, Notifier } from '../../../shared/application/notifier.port';
import { Actor } from '../../../shared/domain/actor';
import { resolveIndicator, resolvePeriod, resolveRequirement, resolveWritablePeriod } from '../../catalog/application/resolve';
import { CATALOG_LOOKUP, CatalogLookup } from '../../catalog/domain/catalog';
import {
  ASSESSMENT_REPOSITORY,
  AssessmentRepository,
  assertAssessmentInput,
  assertVerificationInput,
  EvaluationPolicy,
  IndicatorRating,
  RATING_SCORES,
  VERIFICATION_REPOSITORY,
  VerificationRepository,
  VerificationResult,
} from '../domain/evaluation';

const RATING_LABEL: Record<IndicatorRating, string> = {
  SATISFACTORIO: 'Satisfactorio',
  CUASI_SATISFACTORIO: 'Cuasi satisfactorio',
  POCO_SATISFACTORIO: 'Poco satisfactorio',
  DEFICIENTE: 'Deficiente',
};

@Injectable()
export class VerificationUseCases {
  constructor(
    @Inject(VERIFICATION_REPOSITORY) private readonly verifications: VerificationRepository,
    @Inject(CATALOG_LOOKUP) private readonly catalog: CatalogLookup,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(AUDIT_LOG) private readonly audit: AuditLog,
  ) {}

  async list(actor: Actor, periodCode: string) {
    EvaluationPolicy.assertCanView(actor);
    const period = await resolvePeriod(this.catalog, periodCode);
    return this.verifications.listByPeriod(period.id);
  }

  async register(
    actor: Actor,
    input: { periodCode: string; indicatorCode: string; requirementNumber: number; result: VerificationResult; notes: string; legacyId?: string },
  ) {
    EvaluationPolicy.assertIsEvaluator(actor);
    const period = await resolveWritablePeriod(this.catalog, input.periodCode);
    const requirement = await resolveRequirement(this.catalog, input.indicatorCode, input.requirementNumber);
    assertVerificationInput(requirement.mode, input.notes);

    const record = await this.verifications.create({
      periodId: period.id,
      requirementId: requirement.id,
      result: input.result,
      notes: input.notes.trim(),
      verifiedById: actor.id,
      legacyId: input.legacyId,
    });
    await this.audit.record({
      actorId: actor.id,
      action: 'verification.registered',
      entityType: 'PresentialVerification',
      entityId: record.id,
      periodId: period.id,
      metadata: { result: input.result, indicatorCode: requirement.indicatorCode, requirementNumber: requirement.number },
    });
    if (input.result === 'CON_OBSERVACIONES' && !input.legacyId) {
      await this.notifier.toRoles(['COORDINADOR'], {
        title: 'Verificacion presencial con observaciones',
        message: `${period.label} · Indicador ${requirement.indicatorCode}, evidencia ${requirement.number}: ${record.notes}`,
        type: 'WARNING',
      });
    }
    return record;
  }
}

@Injectable()
export class AssessmentUseCases {
  constructor(
    @Inject(ASSESSMENT_REPOSITORY) private readonly assessments: AssessmentRepository,
    @Inject(CATALOG_LOOKUP) private readonly catalog: CatalogLookup,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(AUDIT_LOG) private readonly audit: AuditLog,
  ) {}

  async list(actor: Actor, periodCode: string) {
    EvaluationPolicy.assertCanView(actor);
    const period = await resolvePeriod(this.catalog, periodCode);
    return this.assessments.listByPeriod(period.id);
  }

  // La valoracion la decide el evaluador: nunca se calcula a partir de archivos o verificaciones.
  async register(
    actor: Actor,
    input: { periodCode: string; indicatorCode: string; rating: IndicatorRating; achievements: string; deficiencies?: string; legacyId?: string },
  ) {
    EvaluationPolicy.assertIsEvaluator(actor);
    const period = await resolveWritablePeriod(this.catalog, input.periodCode);
    const indicator = await resolveIndicator(this.catalog, input.indicatorCode);
    const deficiencies = input.deficiencies?.trim() || '';
    assertAssessmentInput(indicator.type, input.rating, input.achievements, deficiencies);

    const record = await this.assessments.create({
      periodId: period.id,
      indicatorId: indicator.id,
      rating: input.rating,
      score: RATING_SCORES[input.rating],
      achievements: input.achievements.trim(),
      deficiencies,
      assessedById: actor.id,
      legacyId: input.legacyId,
    });
    await this.audit.record({
      actorId: actor.id,
      action: 'assessment.registered',
      entityType: 'IndicatorAssessment',
      entityId: record.id,
      periodId: period.id,
      metadata: { indicatorCode: indicator.code, rating: input.rating },
    });
    if (!input.legacyId) {
      await this.notifier.toRoles(['COORDINADOR'], {
        title: 'Indicador valorado',
        message: `${period.label} · El indicador ${indicator.code} fue valorado como ${RATING_LABEL[input.rating]}.`,
        type: input.rating === 'SATISFACTORIO' ? 'SUCCESS' : input.rating === 'DEFICIENTE' ? 'ERROR' : 'INFO',
      });
    }
    return record;
  }
}
