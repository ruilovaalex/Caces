import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { Response } from 'express';
import { Actor } from '../../../shared/domain/actor';
import { ValidationError } from '../../../shared/domain/errors';
import { CurrentActor } from '../../../shared/http/auth';
import { EvidenceUseCases } from '../application/evidence.use-cases';
import { EvidenceVersion, ReviewDecision } from '../domain/evidence';

export const MAX_UPLOAD_BYTES = Math.round(Number(process.env.MAX_UPLOAD_MB || 20) * 1024 * 1024);

export class UploadEvidenceDto {
  @ApiProperty({ example: '1.1.1' }) @Matches(/^\d\.\d\.\d$/) indicatorCode: string;
  @ApiProperty({ example: 1 }) @Type(() => Number) @IsInt() @Min(1) requirementNumber: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) note?: string;
  @ApiProperty({ type: 'string', format: 'binary' }) @IsOptional() file?: unknown;
}

class ReviewDto {
  @ApiProperty({ enum: ['VALIDADO', 'OBSERVADO', 'RECHAZADO'] }) @IsIn(['VALIDADO', 'OBSERVADO', 'RECHAZADO']) status: ReviewDecision;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) comment?: string;
}

// Respuesta publica: no expone la clave interna de almacenamiento.
export const toEvidenceResponse = ({ storageKey: _key, ...version }: EvidenceVersion) => version;

export const readUploadedFile = (file?: Express.Multer.File) => {
  if (!file) throw new ValidationError('Adjunta un archivo en el campo "file"');
  return { originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'), size: file.size, content: file.buffer };
};

@ApiTags('evidences')
@ApiBearerAuth()
@Controller()
export class EvidenceController {
  constructor(private readonly evidences: EvidenceUseCases) {}

  @Get('periods/:periodCode/evidences')
  async list(@CurrentActor() actor: Actor, @Param('periodCode') periodCode: string) {
    return (await this.evidences.listForPeriod(actor, periodCode)).map(toEvidenceResponse);
  }

  @Post('periods/:periodCode/evidences')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } }))
  async upload(
    @CurrentActor() actor: Actor,
    @Param('periodCode') periodCode: string,
    @Body() body: UploadEvidenceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const version = await this.evidences.upload(actor, {
      periodCode,
      indicatorCode: body.indicatorCode,
      requirementNumber: body.requirementNumber,
      note: body.note,
      file: readUploadedFile(file),
    });
    return toEvidenceResponse(version);
  }

  @Post('evidences/:id/reviews')
  async review(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string, @Body() body: ReviewDto) {
    return toEvidenceResponse(await this.evidences.review(actor, id, body.status, body.comment));
  }

  @Delete('evidences/:id')
  @HttpCode(204)
  async remove(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    await this.evidences.remove(actor, id);
  }

  @Get('evidences/:id/content')
  async content(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('download') download: string | undefined,
    @Res() response: Response,
  ) {
    const { version, stream } = await this.evidences.openContent(actor, id);
    const disposition = download === '1' ? 'attachment' : 'inline';
    response.setHeader('Content-Type', version.mimeType);
    response.setHeader('Content-Length', String(version.sizeBytes));
    response.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${encodeURIComponent(version.fileName)}`);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'private, no-store');
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  }
}
