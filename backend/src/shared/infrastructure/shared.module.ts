import { Global, Module } from '@nestjs/common';
import { APP_CONFIG, loadConfig } from '../../config/env';
import { AUDIT_LOG } from '../application/audit.port';
import { CLOCK, systemClock } from '../domain/clock';
import { PrismaAuditLog } from './prisma-audit-log';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: APP_CONFIG, useFactory: () => loadConfig() },
    { provide: AUDIT_LOG, useClass: PrismaAuditLog },
    { provide: CLOCK, useValue: systemClock },
  ],
  exports: [PrismaService, APP_CONFIG, AUDIT_LOG, CLOCK],
})
export class SharedModule {}
