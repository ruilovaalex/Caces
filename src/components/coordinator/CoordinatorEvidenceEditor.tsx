import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  Sparkles, 
  Upload, 
  FileText, 
  History, 
  ChevronRight, 
  AlertCircle,
  FileDown,
  Layout,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';
import { 
  Indicator, 
  Requirement, 
  EvidenceDraft, 
  EvidenceTemplate, 
  TemplateSection,
  DraftStatus 
} from '../../types';
import { EVIDENCE_TEMPLATES } from '../../data/evidenceTemplates';
import { CoordinatorAIGuidePanel } from '../ai/CoordinatorAIGuidePanel';
import { DraftService } from '../../services/draftService';
import { AIService } from '../../services/aiService';

interface CoordinatorEvidenceEditorProps {
  indicator: Indicator;
  requirement: Requirement;
  onClose: () => void;
  onUploadFinal: (req: Requirement) => void;
  currentUser: any;
}

export const CoordinatorEvidenceEditor = ({ 
  indicator, 
  requirement, 
  onClose,
  onUploadFinal,
  currentUser
}: CoordinatorEvidenceEditorProps) => {
  const [draft, setDraft] = useState<EvidenceDraft | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EvidenceTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const templates = EVIDENCE_TEMPLATES.filter(t => t.indicatorCode === indicator.code && t.requirementId === requirement.id);

  useEffect(() => {
    const existingDraft = DraftService.getDraft(indicator.code, requirement.id);
    if (existingDraft) {
      setDraft(existingDraft);
      const template = EVIDENCE_TEMPLATES.find(t => t.id === existingDraft.templateId);
      if (template) setSelectedTemplate(template);
    }
  }, [indicator.code, requirement.id]);

  const handleApplyTemplate = (template: EvidenceTemplate) => {
    const newDraft: EvidenceDraft = {
      id: crypto.randomUUID(),
      indicatorCode: indicator.code,
      requirementId: requirement.id,
      requirementLabel: requirement.label,
      templateId: template.id,
      sections: template.sections.map(s => ({ ...s, content: '' })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name || 'Coordinador',
      version: 1,
      status: 'EN_EDICION'
    };
    setDraft(newDraft);
    setSelectedTemplate(template);
    DraftService.saveDraft(newDraft);
  };

  const handleSaveDraft = () => {
    if (!draft) return;
    setSaveStatus('saving');
    const updatedDraft = {
      ...draft,
      status: 'BORRADOR_GUARDADO' as DraftStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name || 'Coordinador'
    };
    DraftService.saveDraft(updatedDraft);
    setDraft(updatedDraft);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    if (!draft) return;
    const newSections = draft.sections.map(s => 
      s.id === sectionId ? { ...s, content } : s
    );
    setDraft({ ...draft, sections: newSections });
  };

  const handleRequestAI = async (action: string, sectionId?: string) => {
    setIsGenerating(true);
    setActiveSectionId(sectionId || null);
    
    const section = sectionId ? draft?.sections.find(s => s.id === sectionId) : null;
    
    try {
      const response = await AIService.generateCoordinatorEvidenceGuide({
        indicatorCode: indicator.code,
        indicatorName: indicator.name,
        indicatorDescription: indicator.description,
        evidenceName: requirement.label,
        evidenceDescription: requirement.description,
        format: requirement.format,
        templateName: selectedTemplate?.title,
        sectionName: section?.title,
        content: section?.content,
        observations: requirement.observation
      });
      setAiResponse(response);
    } catch (e) {
      setAiResponse("Error al contactar con la IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: DraftStatus) => {
    const styles = {
      'SIN_INICIAR': 'bg-slate-100 text-slate-500',
      'EN_EDICION': 'bg-blue-100 text-blue-600',
      'BORRADOR_GUARDADO': 'bg-amber-100 text-amber-600',
      'LISTO_PARA_SUBIR': 'bg-emerald-100 text-emerald-600',
      'ARCHIVO_FINAL_CARGADO': 'bg-purple-100 text-purple-600'
    };
    return (
      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-7xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Main Editor Column */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 tracking-tight">{requirement.label}</h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Indicador {indicator.code}</span>
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  {getStatusBadge(draft?.status || 'SIN_INICIAR')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSaveDraft}
                disabled={!draft || saveStatus === 'saving'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  saveStatus === 'saved' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : saveStatus === 'saved' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? 'Guardado' : 'Guardar Borrador'}
              </button>
              <button 
                onClick={onClose}
                className="h-10 w-10 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Context & Description */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Descripción de la Evidencia</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{requirement.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Formato: {requirement.format}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Selector if no draft or manual change */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Plantilla Sugerida</h3>
                {draft && (
                  <button 
                    onClick={() => setDraft(null)} 
                    className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
                  >
                    Cambiar Plantilla
                  </button>
                )}
              </div>
              
              {!draft ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleApplyTemplate(t)}
                      className="p-5 border-2 border-slate-100 rounded-2xl text-left hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                    >
                      <h4 className="font-bold text-slate-700 mb-1 group-hover:text-blue-700">{t.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>
                      <div className="flex items-center gap-1.5 mt-3 text-blue-600">
                        <span className="text-[10px] font-black uppercase tracking-widest">Aplicar Plantilla</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                  {templates.length === 0 && (
                    <div className="col-span-full p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                      <Layout className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-500">No hay plantillas específicas para esta evidencia.</p>
                      <p className="text-xs text-slate-400 mt-1">Puedes empezar desde un documento en blanco.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {draft.sections.map((section, idx) => (
                    <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden focus-within:border-blue-400 transition-colors">
                      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">{idx + 1}</span>
                          <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{section.title}</h5>
                        </div>
                        <button 
                          onClick={() => handleRequestAI('help_section', section.id)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-blue-600 hover:border-blue-400 transition-all uppercase tracking-widest"
                        >
                          <Sparkles className="w-3 h-3" />
                          Ayuda IA
                        </button>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-50">
                          <AlertCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5" />
                          <p className="text-[10px] text-blue-600 italic leading-snug">{section.instruction}</p>
                        </div>
                        <textarea
                          value={section.content}
                          onChange={(e) => updateSectionContent(section.id, e.target.value)}
                          placeholder={section.placeholder}
                          className="w-full min-h-[120px] p-4 text-sm text-slate-600 placeholder-slate-300 bg-transparent border-none focus:ring-0 resize-none font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:border-slate-300 transition-all uppercase tracking-widest shadow-sm">
                <FileDown className="w-4 h-4" />
                PDF
              </button>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:border-slate-300 transition-all uppercase tracking-widest shadow-sm"
              >
                <History className="w-4 h-4" />
                Historial
              </button>
            </div>

            <button 
              onClick={() => onUploadFinal(requirement)}
              className="flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
            >
              <Upload className="w-5 h-5" />
              Subir Archivo Final
            </button>
          </div>
          
          {/* History Drawer Overlay */}
          <AnimatePresence>
            {showHistory && (
              <motion.div 
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                className="absolute inset-y-0 left-0 w-80 bg-white border-r border-slate-200 shadow-2xl z-30 p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Historial de Borradores
                  </h3>
                  <button onClick={() => setShowHistory(false)}><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {DraftService.getDraftHistory(indicator.code, requirement.id).map(entry => (
                    <div key={entry.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">V.{entry.version}</span>
                        <span className="text-[10px] font-medium text-slate-400">{new Date(entry.updatedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold">{entry.updatedBy}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{entry.changes}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Column */}
        <div className="w-full md:w-[400px] flex flex-col h-full shrink-0">
          <CoordinatorAIGuidePanel 
            isGenerating={isGenerating}
            aiResponse={aiResponse}
            onAction={(action) => handleRequestAI(action)}
            onApplySuggestion={(text) => {
              // Basic logic to apply suggestion if it maps to current active section
              if (activeSectionId) {
                // Heuristic: if response is short or segmented, coordinator might want to replace.
                // For now, let's just prepend or keep it in the guide section.
                // Real implementation would parse sections or provide "Insert" buttons per section.
                console.log("Applying suggestion to", activeSectionId);
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};
