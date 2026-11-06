import { Body, Controller, Delete, Get, HttpCode, Inject, Injectable, Module, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { Actor } from '../../shared/domain/actor';
import { ConflictError, ForbiddenError, ValidationError } from '../../shared/domain/errors';
import { CurrentActor } from '../../shared/http/auth';
import { PrismaService } from '../../shared/infrastructure/prisma.service';
import { resolvePeriod, resolveRequirement, resolveWritablePeriod } from '../catalog/application/resolve';
import { CatalogModule } from '../catalog/catalog.module';
import { CATALOG_LOOKUP, CatalogLookup } from '../catalog/domain/catalog';

const DRAFT_STATUSES = ['SIN_INICIAR', 'EN_EDICION', 'BORRADOR_GUARDADO', 'DOCUMENTO_GENERADO', 'LISTO_PARA_SUBIR', 'ARCHIVO_FINAL_CARGADO'];
const MAX_SECTIONS = 50;
const MAX_CONTENT = 50_000;

interface Section {
  id: string;
  title: string;
  instruction: string;
  placeholder: string;
  content: string;
}

export const DraftPolicy = {
  assertCanView(actor: Actor) {
    if (actor.role !== 'COORDINADOR' && actor.role !== 'ADMIN') throw new ForbiddenError('No tienes acceso a los borradores');
  },
  assertCanEdit(actor: Actor) {
    if (actor.role !== 'COORDINADOR') throw new ForbiddenError('Solo el coordinador edita borradores');
  },
};

export const assertSections = (sections: unknown): Section[] => {
  if (!Array.isArray(sections) || sections.length > MAX_SECTIONS) throw new ValidationError(`Se admiten hasta ${MAX_SECTIONS} secciones`);
  return sections.map(raw => {
    const section = raw as Record<string, unknown>;
    const fields = ['id', 'title', 'instruction', 'placeholder', 'content'] as const;
    for (const field of fields) {
      if (typeof section?.[field] !== 'string') throw new ValidationError(`Sección inválida: falta ${field}`);
    }
    if ((section.content as string).length > MAX_CONTENT) throw new ValidationError('El contenido de una sección es demasiado largo');
    return Object.fromEntries(fields.map(field => [field, (section[field] as string).slice(0, MAX_CONTENT)])) as unknown as Section;
  });
};

const draftSelect = {
  id: true, requirementNumber: true, requirementLabel: true, templateId: true, sections: true, status: true,
  observations: true, version: true, createdAt: true, updatedAt: true,
  indicator: { select: { code: true } },
  updatedBy: { select: { name: true } },
} as const;

const toDraft = (row: {
  id: string; requirementNumber: number; requirementLabel: string; templateId: string; sections: unknown; status: string;
  observations: string | null; version: number; createdAt: Date; updatedAt: Date; indicator: { code: string }; updatedBy: { name: string };
}) => ({
  id: row.id,
  indicatorCode: row.indicator.code,
  requirementId: String(row.requirementNumber),
  requirementLabel: row.requirementLabel,
  templateId: row.templateId,
  sections: row.sections as Section[],
  status: row.status,
  observations: row.observations ?? undefined,
  version: row.version,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  updatedBy: row.updatedBy.name,
});

@Injectable()
export class DraftUseCases {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CATALOG_LOOKUP) private readonly catalog: CatalogLookup,
  ) {}

  async list(actor: Actor, periodCode: string) {
    DraftPolicy.assertCanView(actor);
    const period = await resolvePeriod(this.catalog, periodCode);
    const rows = await this.prisma.evidenceDraft.findMany({ where: { periodId: period.id }, select: draftSelect, orderBy: { updatedAt: 'desc' } });
    return rows.map(toDraft);
  }

  async save(
    actor: Actor,
    input: {
      periodCode: string; indicatorCode: string; requirementNumber: number; baseVersion: number; requirementLabel: string;
      templateId: string; sections: unknown; status: string; observations?: string;
    },
  ) {
    DraftPolicy.assertCanEdit(actor);
    if (!DRAFT_STATUSES.includes(input.status)) throw new ValidationError('Estado de borrador inválido');
    const sections = assertSections(input.sections);
    const period = await resolveWritablePeriod(this.catalog, input.periodCode);
    const requirement = await resolveRequirement(this.catalog, input.indicatorCode, input.requirementNumber);
    const where = { periodId_indicatorId_requirementNumber: { periodId: period.id, indicatorId: requirement.indicatorId, requirementNumber: input.requirementNumber } };
    const data = {
      requirementLabel: input.requirementLabel, templateId: input.templateId, sections: sections as object[], status: input.status,
      observations: input.observations ?? null, updatedById: actor.id,
    };

    // Control optimista: la version guardada debe coincidir con la que el cliente vio por ultima vez.
    const existing = await this.prisma.evidenceDraft.findUnique({ where, select: { version: true } });
    if ((existing?.version ?? 0) !== input.baseVersion) {
      throw new ConflictError('El borrador fue modificado por otra persona. Recarga para ver la versión vigente.');
    }
    const saved = existing
      ? await this.prisma.evidenceDraft.update({ where, data: { ...data, version: { increment: 1 } }, select: draftSelect })
      : await this.prisma.evidenceDraft.create({
          data: { ...data, periodId: period.id, indicatorId: requirement.indicatorId, requirementNumber: input.requirementNumber },
          select: draftSelect,
        });
    return toDraft(saved);
  }

  async remove(actor: Actor, periodCode: string, indicatorCode: string, requirementNumber: number) {
    DraftPolicy.assertCanEdit(actor);
    const period = await resolveWritablePeriod(this.catalog, periodCode);
    const requirement = await resolveRequirement(this.catalog, indicatorCode, requirementNumber);
    await this.prisma.evidenceDraft.deleteMany({ where: { periodId: period.id, indicatorId: requirement.indicatorId, requirementNumber } });
  }
}

class SectionDto {
  @IsString() @MaxLength(100) id: string;
  @IsString() @MaxLength(300) title: string;
  @IsString() @MaxLength(2000) instruction: string;
  @IsString() @MaxLength(2000) placeholder: string;
  @IsString() @MaxLength(MAX_CONTENT) content: string;
}

class SaveDraftDto {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(0) baseVersion: number;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(500) requirementLabel: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) templateId: string;
  @ApiProperty({ type: [SectionDto] }) @IsArray() sections: unknown[];
  @ApiProperty({ enum: DRAFT_STATUSES }) @IsString() @MaxLength(40) status: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) observations?: string;
}

@ApiTags('drafts')
@ApiBearerAuth()
@Controller('periods/:periodCode/drafts')
class DraftsController {
  constructor(private readonly useCases: DraftUseCases) {}

  @Get()
  list(@CurrentActor() actor: Actor, @Param('periodCode') periodCode: string) {
    return this.useCases.list(actor, periodCode);
  }

  @Put(':indicatorCode/:requirementNumber')
  save(
    @CurrentActor() actor: Actor,
    @Param('periodCode') periodCode: string,
    @Param('indicatorCode') indicatorCode: string,
    @Param('requirementNumber', new ParseIntPipe()) requirementNumber: number,
    @Body() body: SaveDraftDto,
  ) {
    if (!/^\d\.\d\.\d$/.test(indicatorCode)) throw new ValidationError('Código de indicador inválido');
    return this.useCases.save(actor, { periodCode, indicatorCode, requirementNumber, ...body });
  }

  @Delete(':indicatorCode/:requirementNumber')
  @HttpCode(204)
  remove(
    @CurrentActor() actor: Actor,
    @Param('periodCode') periodCode: string,
    @Param('indicatorCode') indicatorCode: string,
    @Param('requirementNumber', new ParseIntPipe()) requirementNumber: number,
  ) {
    return this.useCases.remove(actor, periodCode, indicatorCode, requirementNumber);
  }
}

@Module({
  imports: [CatalogModule],
  controllers: [DraftsController],
  providers: [DraftUseCases],
})
export class DraftsModule {}
