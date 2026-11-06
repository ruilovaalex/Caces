export type VerificationResult = 'Verificada' | 'Con observaciones';

export type PresentialStatus = 'Pendiente de verificación' | VerificationResult;

export interface PresentialVerification {
  id: string;
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
  result: VerificationResult;
  notes: string;
  verifiedBy: string;
  verifiedAt: string;
}

export type IndicatorRating = 'SATISFACTORIO' | 'CUASI_SATISFACTORIO' | 'POCO_SATISFACTORIO' | 'DEFICIENTE';

export interface IndicatorAssessment {
  id: string;
  indicatorCode: string;
  rating: IndicatorRating;
  score: number;
  achievements: string;
  deficiencies: string;
  assessedBy: string;
  assessedAt: string;
}
