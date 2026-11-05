import { S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { loadConfig } from '../src/config/env';
import { S3FileStorage } from '../src/modules/evidence/infrastructure/s3-file-storage';

const base = { DATABASE_URL: 'postgresql://u@h/db', JWT_SECRET: 'k9Xv2LmQ8rTz4WnB7cYd1HgJ5sPa6EfU' };

describe('configuracion de almacenamiento', () => {
  it('exige bucket y region con STORAGE_DRIVER=s3', () => {
    expect(() => loadConfig({ ...base, STORAGE_DRIVER: 's3' })).toThrow(/S3_BUCKET[\s\S]*S3_REGION/);
  });

  it('normaliza el prefijo', () => {
    const config = loadConfig({ ...base, STORAGE_DRIVER: 's3', S3_BUCKET: 'b', S3_REGION: 'us-east-1', S3_PREFIX: '/caces/prod/' });
    expect(config.s3?.prefix).toBe('caces/prod/');
  });

  it('en produccion con disco local exige carpeta explicita', () => {
    const prod = { ...base, NODE_ENV: 'production', CORS_ORIGINS: 'https://a.ec', MAIL_DRIVER: 'none' };
    expect(() => loadConfig(prod)).toThrow(/STORAGE_LOCAL_DIR/);
    expect(() => loadConfig({ ...prod, STORAGE_LOCAL_DIR: '/data' })).not.toThrow();
  });
});

describe('S3FileStorage', () => {
  const config = loadConfig({ ...base, STORAGE_DRIVER: 's3', S3_BUCKET: 'bucket', S3_REGION: 'us-east-1', S3_PREFIX: 'p' });
  const sent: { name: string; input: Record<string, unknown> }[] = [];
  let storage: S3FileStorage;

  beforeEach(() => {
    sent.length = 0;
    jest.spyOn(S3Client.prototype, 'send').mockImplementation((async (command: { constructor: { name: string }; input: Record<string, unknown> }) => {
      sent.push({ name: command.constructor.name, input: command.input });
      if (command.constructor.name === 'GetObjectCommand') {
        if (command.input.Key === 'p/falta/x') throw new Error('NoSuchKey');
        return { Body: Readable.from(['hola']) };
      }
      return {};
    }) as never);
    storage = new S3FileStorage(config);
  });
  afterEach(() => jest.restoreAllMocks());

  it('guarda, lee y elimina con el prefijo configurado', async () => {
    await storage.put('a/b.pdf', Buffer.from('x'));
    const stream = await storage.open('a/b.pdf');
    expect((await stream[Symbol.asyncIterator]().next()).value.toString()).toBe('hola');
    await storage.remove('a/b.pdf');
    expect(sent.map(c => [c.name, c.input.Key])).toEqual([
      ['PutObjectCommand', 'p/a/b.pdf'],
      ['GetObjectCommand', 'p/a/b.pdf'],
      ['DeleteObjectCommand', 'p/a/b.pdf'],
    ]);
  });

  it('rechaza claves peligrosas y traduce archivos ausentes', async () => {
    await expect(storage.put('../x', Buffer.from('x'))).rejects.toThrow(/invalida/);
    await expect(storage.open('falta/x')).rejects.toThrow(/no esta disponible/);
  });
});
