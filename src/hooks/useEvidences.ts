import { useState, useEffect, useCallback } from 'react';
import { UploadedFile, GeneratedDoc, Status, Requirement, Indicator } from '../types';
import { EvidenceService } from '../services/evidenceService';
import { NotificationService } from '../services/notificationService';
import { describeError, isApiMode } from '../services/api/apiClient';
import { EvidenceApi } from '../services/api/cacesApi';

// En modo servidor las evidencias se cargan por periodo academico; en modo local se conserva el comportamiento previo.
export const useEvidences = (periodCode: string, enabled = true) => {
  const [allFiles, setAllFiles] = useState<UploadedFile[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);

  const loadData = useCallback(async () => {
    setGeneratedDocs(EvidenceService.getAllDocs());
    if (!isApiMode) {
      setAllFiles(EvidenceService.getAll());
      return;
    }
    if (!enabled) {
      setAllFiles([]);
      return;
    }
    try {
      setAllFiles(await EvidenceApi.list(periodCode));
    } catch (error) {
      console.error(error);
      setAllFiles([]);
    }
  }, [enabled, periodCode]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const getRequirementFiles = useCallback((reqId: string, indicatorCode: string) => {
    return allFiles.filter(file => file.requirementId === reqId && file.indicatorCode === indicatorCode);
  }, [allFiles]);

  const uploadFile = useCallback(async (
    file: File,
    indicator: Indicator,
    requirement: Requirement,
    userName: string,
    observation?: string
  ) => {
    if (isApiMode) {
      await EvidenceApi.upload(periodCode, indicator.code, requirement.id, file, observation);
      await loadData();
      return;
    }
    await EvidenceService.upload(file, {
      indicatorCode: indicator.code,
      requirementId: requirement.id,
      requirementLabel: requirement.label,
      uploadedBy: userName,
      observation
    });
    await loadData();
    NotificationService.add({
      title: 'Documento Cargado',
      message: `Nueva version de ${requirement.label} subida correctamente.`,
      type: 'success'
    });
  }, [loadData, periodCode]);

  const updateStatus = useCallback(async (evidenceId: string, status: Status, observation?: string) => {
    if (isApiMode) {
      try {
        await EvidenceApi.review(evidenceId, status, observation);
      } catch (error) {
        window.alert(describeError(error));
      }
      await loadData();
      return;
    }
    EvidenceService.updateStatus(evidenceId, status, observation);
    await loadData();
    NotificationService.add({
      title: 'Revision Actualizada',
      message: `La evidencia fue marcada como ${status}.`,
      type: status === 'Validado' ? 'success' : status === 'Observado' ? 'warning' : 'error'
    });
  }, [loadData]);

  const deleteEvidence = useCallback(async (id: string) => {
    if (isApiMode) {
      try {
        await EvidenceApi.remove(id);
      } catch (error) {
        window.alert(describeError(error));
      }
      await loadData();
      return;
    }
    EvidenceService.deleteEvidence(id);
    await loadData();
    NotificationService.add({
      title: 'Documento eliminado',
      message: 'La version seleccionada fue retirada del historial de evidencia.',
      type: 'warning'
    });
  }, [loadData]);

  return {
    allFiles,
    generatedDocs,
    getRequirementFiles,
    uploadFile,
    updateStatus,
    deleteEvidence,
    refreshEvidences: loadData
  };
};
