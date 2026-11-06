import { Inject, Injectable } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { APP_CONFIG, AppConfig } from '../../../config/env';
import { NotFoundError } from '../../../shared/domain/errors';
import { FileStorage } from '../domain/evidence';

// Almacenamiento compatible con S3 (AWS S3, MinIO, Cloudflare R2, etc.).
// Las credenciales se toman de la cadena estandar del SDK (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY o rol IAM).
@Injectable()
export class S3FileStorage implements FileStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly prefix: string;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    const s3 = config.s3!;
    this.bucket = s3.bucket;
    this.prefix = s3.prefix;
    // Las sumas de verificacion solo cuando la operacion las exige: varios servicios compatibles con S3
    // (Supabase, R2, MinIO antiguos) rechazan las que el SDK agrega por defecto desde la version 3.729.
    this.client = new S3Client({
      region: s3.region,
      endpoint: s3.endpoint,
      forcePathStyle: s3.forcePathStyle,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  async put(key: string, content: Buffer): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: this.objectKey(key), Body: content }));
  }

  async open(key: string): Promise<Readable> {
    try {
      const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.objectKey(key) }));
      if (!result.Body) throw new Error('empty');
      return result.Body as Readable;
    } catch {
      throw new NotFoundError('El archivo de la evidencia no está disponible en el almacenamiento');
    }
  }

  async remove(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: this.objectKey(key) }));
  }

  private objectKey(key: string): string {
    if (!/^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/.test(key) || key.includes('..')) {
      throw new Error(`Clave de almacenamiento inválida: ${key}`);
    }
    return `${this.prefix}${key}`;
  }
}
