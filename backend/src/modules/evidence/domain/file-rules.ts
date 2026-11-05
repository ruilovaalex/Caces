import { ValidationError } from '../../../shared/domain/errors';

// Mismos alias de formato que el frontend (src/utils/evidenceFormatUtils.ts).
const FORMAT_ALIASES: Record<string, string[]> = {
  PDF: ['pdf'],
  DOC: ['doc'],
  DOCX: ['docx'],
  WORD: ['doc', 'docx'],
  XLS: ['xls'],
  XLSX: ['xlsx'],
  EXCEL: ['xls', 'xlsx'],
  JPG: ['jpg', 'jpeg'],
  JPEG: ['jpg', 'jpeg'],
  PNG: ['png'],
  ZIP: ['zip'],
  RAR: ['rar'],
};

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
};

// Firmas binarias: el contenido debe corresponder a la extension declarada.
const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ZIP = [0x50, 0x4b, 0x03, 0x04];
const SIGNATURES: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]],
  doc: [OLE],
  xls: [OLE],
  docx: [ZIP],
  xlsx: [ZIP],
  zip: [ZIP, [0x50, 0x4b, 0x05, 0x06]],
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  rar: [[0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]],
};

export const getAllowedExtensions = (format: string): string[] => {
  const tokens = format.split(/[\/,;|]/).map(token => token.trim().toUpperCase()).filter(Boolean);
  return [...new Set(tokens.flatMap(token => FORMAT_ALIASES[token] || []))];
};

// Conserva solo el nombre base, sin rutas ni caracteres de control. Nunca se usa para construir rutas en disco.
export const sanitizeFileName = (raw: string): string => {
  const base = raw.split(/[\\/]/).pop() || '';
  const clean = base.replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '').trim();
  return clean.slice(-180);
};

export const getExtension = (fileName: string) => {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
};

export interface IncomingFile {
  originalName: string;
  size: number;
  content: Buffer;
}

export interface ValidatedFile {
  fileName: string;
  extension: string;
  mimeType: string;
  size: number;
}

export const validateEvidenceFile = (file: IncomingFile, format: string, maxBytes: number): ValidatedFile => {
  const fileName = sanitizeFileName(file.originalName);
  if (!fileName) throw new ValidationError('El archivo no tiene un nombre valido');

  const extension = getExtension(fileName);
  const allowed = getAllowedExtensions(format);
  if (!allowed.includes(extension)) {
    throw new ValidationError(`Formato no permitido. Para esta evidencia solo se acepta: ${allowed.map(e => e.toUpperCase()).join(', ')}`);
  }
  if (file.size <= 0 || file.content.length === 0) throw new ValidationError('El archivo esta vacio');
  if (file.size > maxBytes) throw new ValidationError(`El archivo supera el maximo de ${Math.round(maxBytes / 1024 / 1024)} MB`);

  const signatures = SIGNATURES[extension] || [];
  const matches = signatures.some(signature => signature.every((byte, index) => file.content[index] === byte));
  if (!matches) throw new ValidationError('El contenido del archivo no corresponde a su extension');

  return { fileName, extension, mimeType: MIME_BY_EXTENSION[extension], size: file.size };
};
