import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard, Public } from './shared/http/auth';
import { PrismaService } from './shared/infrastructure/prisma.service';
import { SharedModule } from './shared/infrastructure/shared.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ImportModule } from './modules/import/import.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@ApiTags('health')
@Controller('health')
class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }
}

@Module({
  imports: [
    SharedModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    IdentityModule,
    NotificationsModule,
    CatalogModule,
    EvidenceModule,
    EvaluationModule,
    ImportModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
