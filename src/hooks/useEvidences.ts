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

  const getRequirementFiles = (reqId: string, indicatorCode: string) => {
    return allFiles.filter(f => f.requirementId === reqId && f.indicatorCode === indicatorCode);
  };

  const uploadFile = async (file: File, indicator: Indicator, requirement: Requirement, userName: string, observation?: string) => {
    try {
      await EvidenceService.upload(file, {
        indicatorCode: indicator.code,
        requirementId: requirement.id,
        requirementLabel: requirement.label,
        uploadedBy: userName,
        observation: observation
      });
      loadData();
      NotificationService.add({
        title: 'Documento Cargado',
        message: `Nueva versión de ${requirement.label} subida correctamente.`,
        type: 'success'
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateStatus = (evidenceId: string, status: Status, observation?: string) => {
    EvidenceService.updateStatus(evidenceId, status, observation);
    loadData();
  };

  const deleteEvidence = (id: string) => {
    EvidenceService.deleteEvidence(id);
    loadData();
  };

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
