import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { CatalogLookup, CatalogTree, IndicatorRef, Period, RequirementRef } from '../domain/catalog';

@Injectable()
export class PrismaCatalogLookup implements CatalogLookup {
  constructor(private readonly prisma: PrismaService) {}

  listPeriods(): Promise<Period[]> {
    return this.prisma.academicPeriod.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, code: true, label: true, year: true, active: true },
    });
  }

  findPeriodByCode(code: string): Promise<Period | null> {
    return this.prisma.academicPeriod.findUnique({
      where: { code },
      select: { id: true, code: true, label: true, year: true, active: true },
    });
  }

  async findRequirement(indicatorCode: string, number: number): Promise<RequirementRef | null> {
    const requirement = await this.prisma.requirement.findFirst({
      where: { number, indicator: { code: indicatorCode } },
      include: { indicator: { select: { code: true } } },
    });
    if (!requirement) return null;
    return {
      id: requirement.id,
      number: requirement.number,
      label: requirement.label,
      format: requirement.format,
      mode: requirement.mode,
      indicatorId: requirement.indicatorId,
      indicatorCode: requirement.indicator.code,
    };
  }

  findIndicator(code: string): Promise<IndicatorRef | null> {
    return this.prisma.indicator.findUnique({ where: { code }, select: { id: true, code: true, name: true, type: true } });
  }

  async getTree(): Promise<CatalogTree> {
    const criteria = await this.prisma.criterion.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        subCriteria: {
          orderBy: { sortOrder: 'asc' },
          include: {
            indicators: {
              orderBy: { sortOrder: 'asc' },
              include: { requirements: { orderBy: { number: 'asc' } } },
            },
          },
        },
      },
    });
    return {
      criteria: criteria.map(criterion => ({
        code: criterion.code,
        name: criterion.name,
        subCriteria: criterion.subCriteria.map(sub => ({
          code: sub.code,
          name: sub.name,
          indicators: sub.indicators.map(indicator => ({
            code: indicator.code,
            name: indicator.name,
            description: indicator.description,
            type: indicator.type,
            requirements: indicator.requirements.map(r => ({
              number: r.number,
              label: r.label,
              description: r.description,
              format: r.format,
              mode: r.mode,
            })),
          })),
        })),
      })),
    };
  }
}
