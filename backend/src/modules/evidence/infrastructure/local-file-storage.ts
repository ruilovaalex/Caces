import { Inject, Injectable } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { mkdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { APP_CONFIG, AppConfig } from '../../../config/env';
import { NotFoundError } from '../../../shared/domain/errors';
import { FileStorage } from '../domain/evidence';

// Almacenamiento en disco para desarrollo. La carpeta queda fuera del frontend y fuera de Git.
@Injectable()
export class LocalFileStorage implements FileStorage {
  private readonly root: string;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.root = resolve(config.storageLocalDir);
  }

  async put(key: string, content: Buffer): Promise<void> {
    const target = this.resolveKey(key);
    await mkdir(dirname(target), { recursive: true });
    // Escritura atomica: primero un temporal y luego se renombra.
    const temp = `${target}.tmp`;
    await writeFile(temp, content, { flag: 'wx' });
    await rename(temp, target);
  }

  async open(key: string): Promise<Readable> {
    const target = this.resolveKey(key);
    try {
      await stat(target);
    } catch {
      throw new NotFoundError('El archivo de la evidencia no está disponible en el almacenamiento');
    }
    return createReadStream(target);
  }

  async remove(key: string): Promise<void> {
    await rm(this.resolveKey(key), { force: true });
  }

  // Defensa adicional: una clave nunca puede apuntar fuera de la carpeta raiz.
  private resolveKey(key: string): string {
    if (!/^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/.test(key) || key.includes('..')) {
      throw new Error(`Clave de almacenamiento inválida: ${key}`);
    }
    const target = resolve(this.root, key);
    if (!target.startsWith(this.root + sep)) throw new Error(`Clave fuera del almacenamiento: ${key}`);
    return target;
  }
}
