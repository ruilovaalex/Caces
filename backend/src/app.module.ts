import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { APP_CONFIG, AppConfig } from './config/env';
import { AuthGuard, Public } from './shared/http/auth';
import { throttleTracker } from './shared/http/throttle-tracker';
import { PrismaService } from './shared/infrastructure/prisma.service';
import { SharedModule } from './shared/infrastructure/shared.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ImportModule } from './modules/import/import.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DraftsModule } from './modules/drafts/drafts.module';
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
    ThrottlerModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        throttlers: [{ ttl: 60_000, limit: 300 }],
        getTracker: (req: Record<string, any>) => throttleTracker(req, config.clientIpHeader),
      }),
    }),
    IdentityModule,
    NotificationsModule,
    CatalogModule,
    EvidenceModule,
    EvaluationModule,
    ImportModule,
    TasksModule,
    DraftsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
