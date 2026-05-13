import { useState, useCallback } from 'react';
import { Indicator, Requirement, Template, GeneratedDoc } from '../types';
import { AIService } from '../services/aiService';
import { EvidenceService } from '../services/evidenceService';
import { NotificationService } from '../services/notificationService';
import { TEMPLATES } from '../data/templates';

export const useAIMentor = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState('evidencia');

  const requestRequirementGuide = useCallback(async (indicator: Indicator, req: Requirement) => {
    setIsGenerating(true);
    setAiResponse("");
    try {
      const resp = await AIService.getRequirementGuide(indicator, req);
      setAiResponse(resp);
      NotificationService.add({
        title: 'Guía IA Generada',
        message: `Se ha generado la guía para: ${req.label}`,
        type: 'info'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateGuideline = useCallback(async (indicator: Indicator, autoSave = false, onSave?: (docs: GeneratedDoc[]) => void) => {
    setIsGenerating(true);
    if (!autoSave) setAiResponse("");

    try {
      const template = TEMPLATES.find(t => t.id === selectedTemplate);
      if (!template) return;
      
      const text = await AIService.getGuideline(indicator, template);

      if (autoSave) {
        const newDoc = saveDocLocally(text, template, indicator);
        if (onSave) onSave(EvidenceService.getAllDocs());
      } else {
        setAiResponse(text);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate]);

  const saveDocLocally = (content: string, template: Template, indicator: Indicator) => {
    const docs = EvidenceService.getAllDocs();
    const docCount = docs.filter(d => d.indicatorCode === indicator.code).length + 1;
    const fileName = `${template.id}_${indicator.code.replace(/\./g, '_')}_2025_${docCount.toString().padStart(3, '0')}`;

    const newDoc: GeneratedDoc = {
      id: Math.random().toString(36).substr(2, 9),
      indicatorCode: indicator.code,
      templateId: template.id,
      content: content,
      timestamp: new Date().toLocaleString(),
      label: fileName
    };
    
    EvidenceService.saveDoc(newDoc);
    NotificationService.add({
      title: 'Nueva Guía Generada',
      message: `Se ha guardado la guía SIG-EV-${indicator.code}-2025 para el indicador ${indicator.name}.`,
      type: 'success'
    });
    return newDoc;
  };

  return {
    isGenerating,
    aiResponse,
    selectedTemplate,
    setSelectedTemplate,
    setAiResponse,
    requestRequirementGuide,
    generateGuideline,
    saveDocLocally
  };
};
