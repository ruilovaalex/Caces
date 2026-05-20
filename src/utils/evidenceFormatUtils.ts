import { Requirement } from '../types';

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
  RAR: ['rar']
};

export const getFileExtensionFromName = (fileName: string) => {
  const extension = fileName.split('.').pop();
  return extension ? extension.toLowerCase() : '';
};

export const getAllowedExtensions = (format: string) => {
  const tokens = format
    .split(/[\/,;|]/)
    .map(token => token.trim().toUpperCase())
    .filter(Boolean);

  const extensions = tokens.flatMap(token => FORMAT_ALIASES[token] || [token.toLowerCase()]);
  return Array.from(new Set(extensions));
};

export const getAcceptAttribute = (format: string) => {
  return getAllowedExtensions(format).map(extension => `.${extension}`).join(',');
};

export const getReadableAllowedFormats = (format: string) => {
  return getAllowedExtensions(format).map(extension => extension.toUpperCase()).join(', ');
};

export const isFileAllowedForRequirement = (file: File, requirement: Requirement) => {
  const allowedExtensions = getAllowedExtensions(requirement.format);
  const selectedExtension = getFileExtensionFromName(file.name);

  return allowedExtensions.includes(selectedExtension);
};

export const getDisplayFileType = (fileName: string, fileType?: string) => {
  const extension = getFileExtensionFromName(fileName);
  if (extension) return extension.toUpperCase();

  if (!fileType) return 'UNKNOWN';
  const normalizedType = fileType.includes('/') ? fileType.split('/').pop() || fileType : fileType;
  return normalizedType.toUpperCase();
};
