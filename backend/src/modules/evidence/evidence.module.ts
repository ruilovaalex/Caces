import { Module } from '@nestjs/common';
import { APP_CONFIG, AppConfig } from '../../config/env';
import { S3FileStorage } from './infrastructure/s3-file-storage';
import { CatalogModule } from '../catalog/catalog.module';
import { EvidenceUseCases } from './application/evidence.use-cases';
import { EVIDENCE_REPOSITORY, FILE_STORAGE } from './domain/evidence';
import { EvidenceController } from './http/evidence.controller';
import { LocalFileStorage } from './infrastructure/local-file-storage';
import { PrismaEvidenceRepository } from './infrastructure/prisma-evidence.repository';

@Module({
  imports: [CatalogModule],
  controllers: [EvidenceController],
  providers: [
    EvidenceUseCases,
    { provide: EVIDENCE_REPOSITORY, useClass: PrismaEvidenceRepository },
    {
      provide: FILE_STORAGE,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => (config.storageDriver === 's3' ? new S3FileStorage(config) : new LocalFileStorage(config)),
    },
  ],
  exports: [EvidenceUseCases, EVIDENCE_REPOSITORY],
})
export class EvidenceModule {}
