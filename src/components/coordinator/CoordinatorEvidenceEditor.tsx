import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Save,
  Sparkles,
  FileText,
  History,
  ChevronRight,
  AlertCircle,
  FileDown,
  Eye,
  Layout,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Info,
  PenSquare,
  Bot,
  Wand2,
  ClipboardCheck,
  ShieldAlert,
  ShieldCheck,
  ShieldX
} from 'lucide-react';
import {
  Indicator,
  Requirement,
  EvidenceDraft,
  EvidenceTemplate,
  DraftStatus,
  UploadedFile,
  UserRole,
  Status
} from '../../types';
import { EVIDENCE_TEMPLATES } from '../../data/evidenceTemplates';
import { CoordinatorAIGuidePanel } from '../ai/CoordinatorAIGuidePanel';
import { EvaluatorReviewGuidePanel } from '../evaluator/EvaluatorReviewGuidePanel';
import { DraftService } from '../../services/draftService';
import { AIService } from '../../services/aiService';
import { EvidenceService } from '../../services/evidenceService';

interface CoordinatorEvidenceEditorProps {
  indicator: Indicator;
  requirement: Requirement;
  files: UploadedFile[];
  userRole: UserRole;
  onClose: () => void;
  onGoHome: () => void;
  onUpdateEvidenceStatus: (evidenceId: string, status: Status, observation?: string) => void;
  currentUser: any;
}

export const CoordinatorEvidenceEditor = ({
  indicator,
  requirement,
  files,
  userRole,
  onClose,
  onGoHome,
  onUpdateEvidenceStatus,
  currentUser
}: CoordinatorEvidenceEditorProps) => {
  const [draft, setDraft] = useState<EvidenceDraft | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EvidenceTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<'compose' | 'preview'>('compose');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [reviewObservation, setReviewObservation] = useState('');

  const templates = EVIDENCE_TEMPLATES.filter(
    template => template.indicatorCode === indicator.code && template.requirementId === requirement.id
  );

  useEffect(() => {
    const existingDraft = DraftService.getDraft(indicator.code, requirement.id);
    if (existingDraft) {
      setDraft(existingDraft);
      setActiveSectionId(existingDraft.sections[0]?.id || null);
      const template = EVIDENCE_TEMPLATES.find(item => item.id === existingDraft.templateId);
      if (template) setSelectedTemplate(template);
    }
  }, [indicator.code, requirement.id]);

  const currentUserName = currentUser?.name || 'Coordinador';
  const currentFile = files.find(file => file.isCurrentVersion);
  const evaluatorMode = userRole === 'EVALUADOR';
  const canDraft = userRole === 'ADMIN' || userRole === 'COORDINADOR';

  const createBlankDraft = (): EvidenceDraft => ({
    id: crypto.randomUUID(),
    indicatorCode: indicator.code,
    requirementId: requirement.id,
    requirementLabel: requirement.label,
    templateId: `blank-${indicator.code}-${requirement.id}`,
    sections: [
      {
        id: 'contexto',
        title: 'Contexto y alcance',
        instruction: 'Explica que evidencia se presenta, a que periodo aplica y quien la respalda institucionalmente.',
        placeholder: 'Describe brevemente el contexto institucional, el periodo evaluado y el alcance de esta evidencia.',
        content: ''
      },
      {
        id: 'desarrollo',
        title: 'Desarrollo principal',
        instruction: 'Redacta aqui el contenido central de la evidencia con datos verificables y lenguaje tecnico.',
        placeholder: 'Escribe desde cero el cuerpo principal. Si lo prefieres, pide a la IA un borrador para esta seccion.',
        content: ''
      },
      {
        id: 'anexos',
        title: 'Anexos y soportes',
        instruction: 'Enumera los documentos de respaldo, anexos o referencias que fortalecen la evidencia.',
        placeholder: 'Lista actas, reportes, matrices, fotografias, enlaces u otros respaldos.',
        content: ''
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: currentUserName,
    version: 1,
    status: 'EN_EDICION'
  });

  const handleApplyTemplate = (template: EvidenceTemplate) => {
    const newDraft: EvidenceDraft = {
      id: crypto.randomUUID(),
      indicatorCode: indicator.code,
      requirementId: requirement.id,
      requirementLabel: requirement.label,
      templateId: template.id,
      sections: template.sections.map(section => ({ ...section, content: '' })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: currentUserName,
      version: 1,
      status: 'EN_EDICION'
    };

    setDraft(newDraft);
    setSelectedTemplate(template);
    setActiveSectionId(newDraft.sections[0]?.id || null);
    setWorkspaceMode('compose');
    DraftService.saveDraft(newDraft);
  };

  const handleStartBlankDraft = () => {
    const newDraft = createBlankDraft();
    setDraft(newDraft);
    setSelectedTemplate(null);
    setActiveSectionId(newDraft.sections[1]?.id || newDraft.sections[0]?.id || null);
    setWorkspaceMode('compose');
    DraftService.saveDraft(newDraft);
  };

  const handleSaveDraft = () => {
    if (!draft) return;

    setSaveStatus('saving');
    const updatedDraft = {
      ...draft,
      status: 'BORRADOR_GUARDADO' as DraftStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUserName
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

    const updatedDraft = {
      ...draft,
      sections: draft.sections.map(section =>
        section.id === sectionId ? { ...section, content } : section
      ),
      status: 'EN_EDICION' as DraftStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUserName
    };

    setDraft(updatedDraft);
  };

  const completedSections = draft?.sections.filter(section => section.content.trim()).length || 0;
  const totalSections = draft?.sections.length || 0;
  const completionPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  const hasDraftContent = Boolean(draft && draft.sections.some(section => section.content.trim()));

  const handleRequestAI = async (action: string, sectionId?: string) => {
    setIsGenerating(true);

    const effectiveSectionId =
      sectionId ||
      activeSectionId ||
      draft?.sections.find(section => !section.content.trim())?.id ||
      draft?.sections[0]?.id ||
      null;

    setActiveSectionId(effectiveSectionId);
    const section = effectiveSectionId
      ? draft?.sections.find(item => item.id === effectiveSectionId)
      : null;

    try {
      const response = await AIService.generateCoordinatorEvidenceGuide({
        action,
        indicatorCode: indicator.code,
        indicatorName: indicator.name,
        indicatorDescription: indicator.description,
        evidenceName: requirement.label,
        evidenceDescription: requirement.description,
        format: requirement.format,
        templateName: selectedTemplate?.title || (!selectedTemplate && draft ? 'Borrador guiado' : undefined),
        sectionName: section?.title,
        content: section?.content,
        observations: requirement.observation
      });
      setAiResponse(response);
    } catch (error) {
      setAiResponse('Error al contactar con la IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySuggestion = (text: string) => {
    const baseDraft = draft || createBlankDraft();
    const targetSectionId =
      activeSectionId ||
      baseDraft.sections.find(section => !section.content.trim())?.id ||
      baseDraft.sections[0]?.id;

    if (!targetSectionId) return;

    const targetSection = baseDraft.sections.find(section => section.id === targetSectionId);
    if (!targetSection) return;

    const normalizedText = text.trim();
    const mergedContent = targetSection.content.trim()
      ? `${targetSection.content.trim()}\n\n${normalizedText}`
      : normalizedText;

    const updatedDraft = {
      ...baseDraft,
      sections: baseDraft.sections.map(section =>
        section.id === targetSectionId
          ? { ...section, content: mergedContent }
          : section
      ),
      status: 'EN_EDICION' as DraftStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUserName
    };

    setDraft(updatedDraft);
    setActiveSectionId(targetSectionId);
  };

  useEffect(() => {
    setReviewObservation(currentFile?.observation || requirement.observation || '');
  }, [currentFile?.id, currentFile?.observation, requirement.observation]);

  const handleReviewDecision = (status: Status) => {
    if (!currentFile) return;
    onUpdateEvidenceStatus(currentFile.id, status, reviewObservation.trim() || undefined);
  };

  const normalizeFileName = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const buildGeneratedDocument = () => {
    if (!draft) return null;

    const generatedAt = new Date();
    const fileName = [
      'SIG',
      'EV',
      normalizeFileName(indicator.code),
      normalizeFileName(requirement.id),
      generatedAt.toISOString().slice(0, 10).replace(/-/g, '')
    ].join('-');

    const sections = draft.sections.map((section, index) => `
      <h2>${index + 1}. ${escapeHtml(section.title)}</h2>
      <p>${escapeHtml(section.content || 'Contenido pendiente de completar.').replace(/\n/g, '<br />')}</p>
    `).join('');

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${fileName}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1f2937; line-height: 1.55; margin: 44px; }
            .brand { border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 22px; }
            .brand p { color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; margin: 0 0 4px; text-transform: uppercase; }
            h1 { font-size: 22px; margin: 0 0 8px; text-transform: uppercase; }
            h2 { font-size: 15px; margin: 28px 0 8px; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #dbeafe; padding-bottom: 6px; }
            p { font-size: 12px; margin: 0 0 10px; }
            .meta { border: 1px solid #cbd5e1; padding: 14px; margin: 20px 0 24px; background: #f8fafc; }
            .meta p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="brand">
            <p>Instituto Superior Tecnologico Sudamericano</p>
            <h1>Documento unico de evidencia</h1>
            <p><strong>Codigo:</strong> ${fileName}</p>
          </div>
          <div class="meta">
            <p><strong>Indicador:</strong> ${escapeHtml(indicator.code)} - ${escapeHtml(indicator.name)}</p>
            <p><strong>Evidencia:</strong> ${escapeHtml(requirement.label)}</p>
            <p><strong>Formato requerido:</strong> ${escapeHtml(requirement.format)}</p>
            <p><strong>Generado por:</strong> ${escapeHtml(currentUserName)}</p>
            <p><strong>Fecha:</strong> ${generatedAt.toLocaleString()}</p>
          </div>
          <h2>Descripcion de la evidencia</h2>
          <p>${escapeHtml(requirement.description)}</p>
          ${sections}
        </body>
      </html>
    `;

    return { fileName, html };
  };

  const persistGeneratedDocument = (fileName: string, html: string) => {
    EvidenceService.saveDoc({
      id: crypto.randomUUID(),
      indicatorCode: indicator.code,
      requirementId: requirement.id,
      requirementLabel: requirement.label,
      templateId: draft?.templateId || `blank-${indicator.code}-${requirement.id}`,
      content: html,
      timestamp: new Date().toLocaleString(),
      label: fileName,
      fileName: `${fileName}.doc`,
      fileType: 'DOC',
      isUpload: false
    });

    if (draft) {
      const updatedDraft = {
        ...draft,
        status: 'DOCUMENTO_GENERADO' as DraftStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserName
      };
      DraftService.saveDraft(updatedDraft);
      setDraft(updatedDraft);
    }
  };

  const handleDownloadGeneratedDocument = () => {
    const generatedDocument = buildGeneratedDocument();
    if (!generatedDocument) return;

    const blob = new Blob(['\ufeff', generatedDocument.html], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedDocument.fileName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    persistGeneratedDocument(generatedDocument.fileName, generatedDocument.html);
  };

  const generatedDocument = buildGeneratedDocument();

  const getStatusBadge = (status: DraftStatus) => {
    const styles = {
      SIN_INICIAR: 'bg-slate-100 text-slate-500',
      EN_EDICION: 'bg-blue-100 text-blue-600',
      BORRADOR_GUARDADO: 'bg-amber-100 text-amber-600',
      DOCUMENTO_GENERADO: 'bg-emerald-100 text-emerald-600',
      LISTO_PARA_SUBIR: 'bg-emerald-100 text-emerald-600',
      ARCHIVO_FINAL_CARGADO: 'bg-purple-100 text-purple-600'
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
        <div className="flex-1 flex flex-col h-full bg-white relative">
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
                onClick={onGoHome}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Volver al inicio
              </button>
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
                {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? 'Guardado' : 'Guardar borrador'}
              </button>
              <button
                onClick={onClose}
                className="h-10 w-10 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                {[
                  { label: 'Plantilla', detail: draft ? 'Seleccionada' : 'Pendiente', icon: Layout, active: !draft },
                  { label: 'Redaccion IA', detail: draft ? `${completionPercent}% completo` : 'Crear borrador', icon: Wand2, active: Boolean(draft && workspaceMode === 'compose') },
                  { label: 'Vista previa', detail: hasDraftContent ? 'Disponible' : 'Sin contenido', icon: Eye, active: workspaceMode === 'preview' },
                  { label: 'Descarga', detail: generatedDocument?.fileName || 'Formato unico', icon: FileDown, active: draft?.status === 'DOCUMENTO_GENERADO' }
                ].map(step => {
                  const StepIcon = step.icon;
                  return (
                    <div
                      key={step.label}
                      className={`rounded-xl border p-4 transition-colors ${
                        step.active ? 'border-blue-200 bg-blue-50/70' : 'border-slate-100 bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${step.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                          <StepIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{step.label}</p>
                          <p className="mt-0.5 truncate text-xs font-bold text-slate-700">{step.detail}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Descripcion de la evidencia</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{requirement.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Formato: {requirement.format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Versiones: {files.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado actual</p>
                <p className="mt-2 text-sm font-bold text-slate-700">
                  {evaluatorMode ? (currentFile?.status || 'Pendiente') : (draft?.status?.replace(/_/g, ' ') || 'Pendiente')}
                </p>
                <p className="mt-1 text-xs text-slate-400">El avance se centra en el borrador, la vista previa y el documento institucional generado.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revision actual</p>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{currentFile?.observation || requirement.observation || 'Sin observaciones registradas.'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formato unico</p>
                <p className="mt-2 truncate text-sm font-bold text-slate-700">{generatedDocument?.fileName || 'SIG-EV-...'}</p>
                <p className="mt-1 text-xs text-slate-400">La descarga conserva el nombre institucional generado por la app.</p>
              </div>
            </div>

            {evaluatorMode && (
              <div className="rounded-2xl border border-amber-100 bg-white p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Panel de evaluacion</h3>
                    <p className="text-xs text-slate-500 mt-1">Revisa la version cargada por el coordinador y decide el estado de la evidencia.</p>
                  </div>
                  <div className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {currentFile ? `Version actual: v${currentFile.version}` : 'Sin archivo para evaluar'}
                  </div>
                </div>

                {!currentFile ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                    Todavia no existe un archivo cargado para esta evidencia. El evaluador solo puede revisar evidencias que ya fueron subidas.
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Observacion del evaluador
                      </label>
                      <textarea
                        value={reviewObservation}
                        onChange={(event) => setReviewObservation(event.target.value)}
                        placeholder="Describe con precision lo que cumple o lo que debe corregirse."
                        className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleReviewDecision('Validado')}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Validar evidencia
                      </button>
                      <button
                        onClick={() => handleReviewDecision('Observado')}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Marcar observacion
                      </button>
                      <button
                        onClick={() => handleReviewDecision('Rechazado')}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all"
                      >
                        <ShieldX className="w-4 h-4" />
                        Rechazar evidencia
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {canDraft && <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Plantilla sugerida</h3>
                {draft && (
                  <button
                    onClick={() => {
                      setDraft(null);
                      setSelectedTemplate(null);
                      setAiResponse('');
                      setActiveSectionId(null);
                      setWorkspaceMode('compose');
                    }}
                    className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
                  >
                    Cambiar enfoque
                  </button>
                )}
              </div>

              {!draft ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleApplyTemplate(template)}
                      className="p-5 border-2 border-slate-100 rounded-2xl text-left hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                    >
                      <h4 className="font-bold text-slate-700 mb-1 group-hover:text-blue-700">{template.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{template.description}</p>
                      <div className="flex items-center gap-1.5 mt-3 text-blue-600">
                        <span className="text-[10px] font-black uppercase tracking-widest">Aplicar plantilla</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={handleStartBlankDraft}
                    className="p-5 border-2 border-dashed border-blue-200 rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50/40 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="rounded-xl bg-white p-2 border border-blue-100 text-blue-600 shadow-sm">
                        <PenSquare className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-slate-700 group-hover:text-blue-700">Empezar desde cero</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Abre un editor en blanco con secciones base y luego usa la IA para construir el contenido paso a paso.
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-blue-600">
                      <span className="text-[10px] font-black uppercase tracking-widest">Crear borrador guiado</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>

                  {templates.length === 0 && (
                    <div className="col-span-full p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                      <Layout className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-500">No hay plantillas especificas para esta evidencia.</p>
                      <p className="text-xs text-slate-400 mt-1">Usa la opcion de borrador guiado para empezar desde un documento en blanco.</p>
                    </div>
                  )}
                </div>
              ) : workspaceMode === 'preview' ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-800">Vista previa institucional</h4>
                      <p className="mt-1 text-xs text-slate-500">Asi se estructura el archivo unico antes de descargarlo.</p>
                    </div>
                    <button
                      onClick={() => setWorkspaceMode('compose')}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:border-blue-300 hover:text-blue-600"
                    >
                      Volver a editar
                    </button>
                  </div>
                  <div className="mx-auto max-w-3xl rounded-sm bg-white p-10 shadow-xl ring-1 ring-slate-200">
                    <div className="border-b-4 border-blue-600 pb-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Instituto Superior Tecnologico Sudamericano</p>
                      <h1 className="mt-2 text-xl font-black uppercase text-slate-900">Documento unico de evidencia</h1>
                      <p className="mt-1 text-xs font-bold text-slate-500">Codigo: {generatedDocument?.fileName}</p>
                    </div>
                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                      <p><span className="font-black">Indicador:</span> {indicator.code} - {indicator.name}</p>
                      <p className="mt-1"><span className="font-black">Evidencia:</span> {requirement.label}</p>
                      <p className="mt-1"><span className="font-black">Formato requerido:</span> {requirement.format}</p>
                      <p className="mt-1"><span className="font-black">Generado por:</span> {currentUserName}</p>
                    </div>
                    <div className="mt-6 space-y-6">
                      <section>
                        <h2 className="border-b border-blue-100 pb-2 text-sm font-black uppercase text-slate-900">Descripcion de la evidencia</h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{requirement.description}</p>
                      </section>
                      {draft.sections.map((section, index) => (
                        <section key={section.id}>
                          <h2 className="border-b border-blue-100 pb-2 text-sm font-black uppercase text-slate-900">
                            {index + 1}. {section.title}
                          </h2>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                            {section.content || 'Contenido pendiente de completar.'}
                          </p>
                        </section>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {draft.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${
                        activeSectionId === section.id
                          ? 'border-blue-300 ring-2 ring-blue-100'
                          : 'border-slate-200 focus-within:border-blue-400'
                      }`}
                    >
                      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                            {index + 1}
                          </span>
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
                          onFocus={() => setActiveSectionId(section.id)}
                          onChange={(event) => updateSectionContent(section.id, event.target.value)}
                          placeholder={section.placeholder}
                          className="w-full min-h-[140px] p-4 text-sm text-slate-600 placeholder-slate-300 bg-transparent border-none focus:ring-0 resize-none font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-slate-500 leading-relaxed">
                {evaluatorMode
                  ? 'Este flujo es de revision: el evaluador registra el estado y las observaciones de la evidencia.'
                  : 'Este flujo no sube archivos al final: genera y guarda un documento institucional descargable.'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {evaluatorMode
                  ? (currentFile ? `Revisando ${currentFile.fileName}` : 'Sin archivo cargado para revisar')
                  : (generatedDocument ? `${generatedDocument.fileName}.doc` : 'Selecciona una plantilla para generar el formato unico')}
              </p>
            </div>

            {canDraft && <div className="flex items-center gap-2">
              <button
                onClick={() => setWorkspaceMode('preview')}
                disabled={!draft}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                <Eye className="h-4 w-4" />
                Vista previa
              </button>
              <button
                onClick={handleDownloadGeneratedDocument}
                disabled={!draft}
                className="flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <FileDown className="w-5 h-5" />
                Descargar y guardar
              </button>
            </div>}
          </div>
        </div>

        <div className="w-full md:w-[400px] flex flex-col h-full shrink-0">
          {evaluatorMode ? (
            <EvaluatorReviewGuidePanel currentFile={currentFile} />
          ) : (
            <CoordinatorAIGuidePanel
              isGenerating={isGenerating}
              aiResponse={aiResponse}
              onAction={handleRequestAI}
              onApplySuggestion={handleApplySuggestion}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};
