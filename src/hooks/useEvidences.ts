import { useState, useEffect, useCallback } from 'react';
import { UploadedFile, GeneratedDoc, Status, Requirement, Indicator } from '../types';
import { EvidenceService } from '../services/evidenceService';
import { NotificationService } from '../services/notificationService';

export const useEvidences = () => {
  const [allFiles, setAllFiles] = useState<UploadedFile[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);

  const loadData = useCallback(() => {
    setAllFiles(EvidenceService.getAll());
    setGeneratedDocs(EvidenceService.getAllDocs());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getRequirementFiles = useCallback((reqId: string, indicatorCode: string) => {
    return allFiles.filter(file => file.requirementId === reqId && file.indicatorCode === indicatorCode);
  }, [allFiles]);

  const uploadFile = useCallback(async (
    file: File,
    indicator: Indicator,
    requirement: Requirement,
    userName: string,
    observation?: string,
    folderId?: string
  ) => {
    try {
      await EvidenceService.upload(file, {
        indicatorCode: indicator.code,
        requirementId: requirement.id,
        requirementLabel: requirement.label,
        uploadedBy: userName,
        folderId: folderId || 'general',
        observation
      });
      loadData();
      NotificationService.add({
        title: 'Documento Cargado',
        message: `Nueva version de ${requirement.label} subida correctamente.`,
        type: 'success'
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [loadData]);

  const updateStatus = useCallback((evidenceId: string, status: Status, observation?: string) => {
    EvidenceService.updateStatus(evidenceId, status, observation);
    loadData();
    NotificationService.add({
      title: 'Revision Actualizada',
      message: `La evidencia fue marcada como ${status}.`,
      type: status === 'Validado' ? 'success' : status === 'Observado' ? 'warning' : 'error'
    });
  }, [loadData]);

  const deleteEvidence = useCallback((id: string) => {
    EvidenceService.deleteEvidence(id);
    loadData();
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
