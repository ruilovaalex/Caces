import { PresentialStatus, PresentialVerification, VerificationResult } from '../types';
import { StorageService } from './storageService';

const STORAGE_KEY = 'edusudamericano_presential_verifications_v1';

interface VerificationPayload {
  indicatorCode: string;
  requirementId: string;
  requirementLabel: string;
  result: VerificationResult;
  notes: string;
  verifiedBy: string;
}

export const PresentialVerificationService = {
  getAll: (): PresentialVerification[] => {
    return StorageService.get<PresentialVerification[]>(STORAGE_KEY) || [];
  },

  // Cada registro se conserva como historial; el mas reciente define el estado vigente.
  register: (payload: VerificationPayload): PresentialVerification => {
    const record: PresentialVerification = {
      ...payload,
      id: crypto.randomUUID(),
      verifiedAt: new Date().toISOString(),
    };
    StorageService.set(STORAGE_KEY, [...PresentialVerificationService.getAll(), record]);
    return record;
  },
};

export const getRequirementVerifications = (
  verifications: PresentialVerification[],
  indicatorCode: string,
  requirementId: string,
) => verifications
  .filter(item => item.indicatorCode === indicatorCode && item.requirementId === requirementId)
  .sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt));

export const getPresentialStatus = (history: PresentialVerification[]): PresentialStatus =>
  history[0]?.result || 'Pendiente de verificación';
