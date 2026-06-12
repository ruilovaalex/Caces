import { EvidenceFormatLink, OfficialFormat, OfficialFormatStatus } from '../types';
import { StorageService } from './storageService';

const FORMATS_STORAGE_KEY = 'edusudamericano_official_formats_v1';
const LINKS_STORAGE_KEY = 'edusudamericano_evidence_format_links_v1';

interface CreateOfficialFormatPayload {
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  tags?: string[];
}

interface CreateEvidenceFormatLinkPayload {
  formatId: string;
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
  createdBy: string;
}

const normalizeText = (value: string) => value.trim().replace(/\s+/g, ' ');

export const OfficialFormatService = {
  getAll: (): OfficialFormat[] => {
    return StorageService.get<OfficialFormat[]>(FORMATS_STORAGE_KEY) || [];
  },

  getActive: (): OfficialFormat[] => {
    return OfficialFormatService.getAll().filter(format => format.status === 'ACTIVO');
  },

  saveAll: (formats: OfficialFormat[]): void => {
    StorageService.set(FORMATS_STORAGE_KEY, formats);
  },

  create: (payload: CreateOfficialFormatPayload): OfficialFormat | null => {
    const title = normalizeText(payload.title);
    const fileName = normalizeText(payload.fileName);
    if (!title || !fileName) return null;

    const formats = OfficialFormatService.getAll();
    const duplicated = formats.some(format =>
      format.title.toLowerCase() === title.toLowerCase() &&
      format.fileName.toLowerCase() === fileName.toLowerCase()
    );

    if (duplicated) return null;

    const format: OfficialFormat = {
      id: crypto.randomUUID(),
      title,
      description: normalizeText(payload.description),
      fileName,
      fileType: payload.fileType || 'Archivo',
      fileSize: payload.fileSize,
      uploadedAt: new Date().toLocaleString(),
      uploadedBy: payload.uploadedBy,
      status: 'ACTIVO',
      source: 'ADMIN_UPLOAD',
      tags: payload.tags?.map(normalizeText).filter(Boolean)
    };

    OfficialFormatService.saveAll([format, ...formats]);
    return format;
  },

  setStatus: (formatId: string, status: OfficialFormatStatus): void => {
    const formats = OfficialFormatService.getAll().map(format =>
      format.id === formatId ? { ...format, status } : format
    );
    OfficialFormatService.saveAll(formats);
  },

  getLinks: (): EvidenceFormatLink[] => {
    return StorageService.get<EvidenceFormatLink[]>(LINKS_STORAGE_KEY) || [];
  },

  saveLinks: (links: EvidenceFormatLink[]): void => {
    StorageService.set(LINKS_STORAGE_KEY, links);
  },

  linkToEvidence: (payload: CreateEvidenceFormatLinkPayload): EvidenceFormatLink => {
    const links = OfficialFormatService.getLinks();
    const existing = links.find(link =>
      link.formatId === payload.formatId &&
      link.indicatorCode === payload.indicatorCode &&
      link.requirementId === payload.requirementId
    );

    if (existing) return existing;

    const link: EvidenceFormatLink = {
      id: crypto.randomUUID(),
      formatId: payload.formatId,
      indicatorCode: payload.indicatorCode,
      requirementId: payload.requirementId,
      requirementLabel: payload.requirementLabel,
      createdAt: new Date().toLocaleString(),
      createdBy: payload.createdBy
    };

    OfficialFormatService.saveLinks([link, ...links]);
    return link;
  },

  unlinkFromEvidence: (linkId: string): void => {
    OfficialFormatService.saveLinks(OfficialFormatService.getLinks().filter(link => link.id !== linkId));
  },

  getLinksByEvidence: (indicatorCode: string, requirementId: string): EvidenceFormatLink[] => {
    return OfficialFormatService.getLinks().filter(link =>
      link.indicatorCode === indicatorCode && link.requirementId === requirementId
    );
  },

  getFormatsByEvidence: (indicatorCode: string, requirementId: string): OfficialFormat[] => {
    const links = OfficialFormatService.getLinksByEvidence(indicatorCode, requirementId);
    const activeFormats = OfficialFormatService.getActive();

    return links
      .map(link => activeFormats.find(format => format.id === link.formatId))
      .filter((format): format is OfficialFormat => Boolean(format));
  }
};
