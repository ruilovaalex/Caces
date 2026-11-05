import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditEntry, AuditLog } from '../application/audit.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaAuditLog implements AuditLog {
  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        periodId: entry.periodId ?? null,
        metadata: (entry.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
