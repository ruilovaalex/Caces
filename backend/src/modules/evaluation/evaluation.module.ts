import { Body, Controller, Get, Module, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { Actor } from '../../shared/domain/actor';
import { CurrentActor } from '../../shared/http/auth';
import { CatalogModule } from '../catalog/catalog.module';
import { AssessmentUseCases, VerificationUseCases } from './application/evaluation.use-cases';
import { ASSESSMENT_REPOSITORY, IndicatorRating, VERIFICATION_REPOSITORY, VerificationResult } from './domain/evaluation';
import { PrismaAssessmentRepository, PrismaVerificationRepository } from './infrastructure/prisma-evaluation.repositories';

const RATINGS: IndicatorRating[] = ['SATISFACTORIO', 'CUASI_SATISFACTORIO', 'POCO_SATISFACTORIO', 'DEFICIENTE'];
const RESULTS: VerificationResult[] = ['VERIFICADA', 'CON_OBSERVACIONES'];

class RegisterVerificationDto {
  @ApiProperty({ example: '1.1.1' }) @Matches(/^\d\.\d\.\d$/) indicatorCode: string;
  @ApiProperty({ example: 6 }) @Type(() => Number) @IsInt() @Min(1) requirementNumber: number;
  @ApiProperty({ enum: RESULTS }) @IsIn(RESULTS) result: VerificationResult;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(4000) notes: string;
}

class RegisterAssessmentDto {
  @ApiProperty({ example: '1.1.1' }) @Matches(/^\d\.\d\.\d$/) indicatorCode: string;
  @ApiProperty({ enum: RATINGS }) @IsIn(RATINGS) rating: IndicatorRating;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(4000) achievements: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) deficiencies?: string;
}

@ApiTags('evaluation')
@ApiBearerAuth()
@Controller('periods/:periodCode')
class EvaluationController {
  constructor(
    private readonly verifications: VerificationUseCases,
    private readonly assessments: AssessmentUseCases,
  ) {}

  @Get('verifications')
  listVerifications(@CurrentActor() actor: Actor, @Param('periodCode') periodCode: string) {
    return this.verifications.list(actor, periodCode);
  }

  @Post('verifications')
  registerVerification(@CurrentActor() actor: Actor, @Param('periodCode') periodCode: string, @Body() body: RegisterVerificationDto) {
    return this.verifications.register(actor, { periodCode, ...body });
  }

  @Get('assessments')
  listAssessments(@CurrentActor() actor: Actor, @Param('periodCode') periodCode: string) {
    return this.assessments.list(actor, periodCode);
  }

  @Post('assessments')
  registerAssessment(@CurrentActor() actor: Actor, @Param('periodCode') periodCode: string, @Body() body: RegisterAssessmentDto) {
    return this.assessments.register(actor, { periodCode, ...body });
  }
}

@Module({
  imports: [CatalogModule],
  controllers: [EvaluationController],
  providers: [
    VerificationUseCases,
    AssessmentUseCases,
    { provide: VERIFICATION_REPOSITORY, useClass: PrismaVerificationRepository },
    { provide: ASSESSMENT_REPOSITORY, useClass: PrismaAssessmentRepository },
  ],
  exports: [VerificationUseCases, AssessmentUseCases, VERIFICATION_REPOSITORY, ASSESSMENT_REPOSITORY],
})
export class EvaluationModule {}
