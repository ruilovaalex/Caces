import { Module } from '@nestjs/common';
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
    { provide: FILE_STORAGE, useClass: LocalFileStorage },
  ],
  exports: [EvidenceUseCases, EVIDENCE_REPOSITORY],
})
export class EvidenceModule {}
