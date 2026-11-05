import { Body, Controller, Inject, Injectable, Module, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { Actor } from '../../shared/domain/actor';
import { CurrentActor } from '../../shared/http/auth';
import { AssessmentUseCases, VerificationUseCases } from '../evaluation/application/evaluation.use-cases';
import { ASSESSMENT_REPOSITORY, AssessmentRepository, IndicatorRating, VERIFICATION_REPOSITORY, VerificationRepository, VerificationResult } from '../evaluation/domain/evaluation';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { EvidenceUseCases } from '../evidence/application/evidence.use-cases';
import { EVIDENCE_REPOSITORY, EvidenceRepository } from '../evidence/domain/evidence';
import { EvidenceModule } from '../evidence/evidence.module';
import { MAX_UPLOAD_BYTES, readUploadedFile, toEvidenceResponse } from '../evidence/http/evidence.controller';

type ImportOutcome<T> = { outcome: 'imported' | 'skipped'; record?: T };

// Importacion explicita de datos del navegador (localStorage + IndexedDB). Es idempotente por legacyId
// y reutiliza los mismos casos de uso y permisos que una operacion normal.
@Injectable()
class LocalDataImportUseCases {
  constructor(
    private readonly evidenceUseCases: EvidenceUseCases,
    private readonly verificationUseCases: VerificationUseCases,
    private readonly assessmentUseCases: AssessmentUseCases,
    @Inject(EVIDENCE_REPOSITORY) private readonly evidences: EvidenceRepository,
    @Inject(VERIFICATION_REPOSITORY) private readonly verifications: VerificationRepository,
    @Inject(ASSESSMENT_REPOSITORY) private readonly assessments: AssessmentRepository,
  ) {}

  async importEvidence(actor: Actor, periodCode: string, input: ImportEvidenceDto, file?: Express.Multer.File) {
    if (await this.evidences.findByLegacyId(input.legacyId)) return { outcome: 'skipped' } as ImportOutcome<never>;
    // El estado local se registro sin autenticacion: la version importada vuelve a revision y el estado original queda anotado.
    const provenance = [
      'Importado desde datos locales del navegador',
      input.legacyStatus && `estado local: ${input.legacyStatus}`,
      input.legacyUploadedBy && `cargado por ${input.legacyUploadedBy}`,
      input.legacyUploadDate && `el ${input.legacyUploadDate}`,
    ].filter(Boolean).join(' · ');
    const version = await this.evidenceUseCases.upload(
      actor,
      {
        periodCode,
        indicatorCode: input.indicatorCode,
        requirementNumber: input.requirementNumber,
        note: [input.note?.trim(), `(${provenance})`].filter(Boolean).join(' '),
        file: readUploadedFile(file),
        legacyId: input.legacyId,
      },
      { notify: false },
    );
    return { outcome: 'imported', record: toEvidenceResponse(version) };
  }

  async importVerification(actor: Actor, periodCode: string, input: ImportVerificationDto) {
    if (await this.verifications.existsLegacy(input.legacyId)) return { outcome: 'skipped' } as ImportOutcome<never>;
    const record = await this.verificationUseCases.register(actor, {
      periodCode,
      indicatorCode: input.indicatorCode,
      requirementNumber: input.requirementNumber,
      result: input.result,
      notes: `${input.notes.trim()} (Importado del navegador${input.legacyVerifiedBy ? `; registrado por ${input.legacyVerifiedBy}` : ''})`,
      legacyId: input.legacyId,
    });
    return { outcome: 'imported', record };
  }

  async importAssessment(actor: Actor, periodCode: string, input: ImportAssessmentDto) {
    if (await this.assessments.existsLegacy(input.legacyId)) return { outcome: 'skipped' } as ImportOutcome<never>;
    const record = await this.assessmentUseCases.register(actor, {
      periodCode,
      indicatorCode: input.indicatorCode,
      rating: input.rating,
      achievements: input.achievements,
      deficiencies: input.deficiencies,
      legacyId: input.legacyId,
    });
    return { outcome: 'imported', record };
  }
}

class ImportEvidenceDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) legacyId: string;
  @ApiProperty() @Matches(/^\d\.\d\.\d$/) indicatorCode: string;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) requirementNumber: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) note?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) legacyStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) legacyUploadedBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) legacyUploadDate?: string;
  @ApiProperty({ type: 'string', format: 'binary' }) @IsOptional() file?: unknown;
}

class ImportVerificationDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) legacyId: string;
  @ApiProperty() @Matches(/^\d\.\d\.\d$/) indicatorCode: string;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) requirementNumber: number;
  @ApiProperty() @IsIn(['VERIFICADA', 'CON_OBSERVACIONES']) result: VerificationResult;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(4000) notes: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) legacyVerifiedBy?: string;
}

class ImportAssessmentDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) legacyId: string;
  @ApiProperty() @Matches(/^\d\.\d\.\d$/) indicatorCode: string;
  @ApiProperty() @IsIn(['SATISFACTORIO', 'CUASI_SATISFACTORIO', 'POCO_SATISFACTORIO', 'DEFICIENTE']) rating: IndicatorRating;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(4000) achievements: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) deficiencies?: string;
}

@ApiTags('import')
@ApiBearerAuth()
@Controller('periods/:periodCode/imports')
class LocalDataImportController {
  constructor(private readonly useCases: LocalDataImportUseCases) {}

  @Post('evidences')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } }))
  evidence(
    @CurrentActor() actor: Actor,
    @Param('periodCode') periodCode: string,
    @Body() body: ImportEvidenceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.useCases.importEvidence(actor, periodCode, body, file);
  }

  @Post('verifications')
  verification(@CurrentActor() actor: Actor, @Param('periodCode') periodCode: string, @Body() body: ImportVerificationDto) {
    return this.useCases.importVerification(actor, periodCode, body);
  }

  @Post('assessments')
  assessment(@CurrentActor() actor: Actor, @Param('periodCode') periodCode: string, @Body() body: ImportAssessmentDto) {
    return this.useCases.importAssessment(actor, periodCode, body);
  }
}

@Module({
  imports: [EvidenceModule, EvaluationModule],
  controllers: [LocalDataImportController],
  providers: [LocalDataImportUseCases],
})
export class ImportModule {}
