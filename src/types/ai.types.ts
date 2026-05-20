export interface AIGuideRequest {
  indicatorCode: string;
  indicatorName: string;
  requirementLabel: string;
  requirementDescription: string;
  format: string;
}

export interface AIGuideResponse {
  guide: string;
  timestamp: string;
}

export interface GeneratedDoc {
  id: string;
  indicatorCode: string;
  requirementId?: string;
  requirementLabel?: string;
  templateId: string;
  content: string;
  timestamp: string;
  label?: string;
  fileName?: string;
  isUpload?: boolean;
  fileSize?: string;
  fileType?: string;
}
