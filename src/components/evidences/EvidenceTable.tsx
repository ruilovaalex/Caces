import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Eye,
  FileClock,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  History,
  LayoutTemplate,
  Plus,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { EvidenceFolder, Indicator, Requirement, Status, UploadedFile, UserRole } from '../../types';
import { EvidenceFolderService } from '../../services/evidenceFolderService';
import { canUserUpload } from '../../utils/permissions';
import { EvidenceStatusBadge } from './EvidenceStatusBadge';
import { EvidenceFilePreviewModal } from './EvidenceFilePreviewModal';
import { EvidenceGuideModal } from './EvidenceGuideModal';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { PromptDialog } from '../common/PromptDialog';
import { useToast } from '../common/Toast';

interface EvidenceTableProps {
  indicator: Indicator;
  userRole: UserRole;
  getRequirementFiles: (reqId: string) => UploadedFile[];
  onOpenUpload: (req: Requirement, folders?: EvidenceFolder[]) => void;
  onOpenEditor: (req: Requirement) => void;
  onOpenHistory: (req: Requirement) => void;
  onReviewStatus: (fileId: string, status: Status, observation?: string) => void;
}

interface FolderGroup {
  id: string;
  name: string;
  files: UploadedFile[];
  folder?: EvidenceFolder;
  isVirtual: boolean;
}

type RepositoryDialog =
  | { kind: 'create-folder'; requirement: Requirement }
  | { kind: 'delete-folder'; folder: EvidenceFolder; files: UploadedFile[] }
  | { kind: 'confirm-file'; file: UploadedFile }
  | { kind: 'deny-file'; file: UploadedFile }
  | null;

export const EvidenceTable = ({
  indicator,
  userRole,
  getRequirementFiles,
  onOpenUpload,
  onOpenEditor,
  onOpenHistory,
  onReviewStatus,
}: EvidenceTableProps) => {
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set());
  const [folders, setFolders] = useState<EvidenceFolder[]>(() => EvidenceFolderService.migrateLegacyForIndicator(indicator.code));
  const [guideRequirement, setGuideRequirement] = useState<Requirement | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [dialog, setDialog] = useState<RepositoryDialog>(null);
  const { showToast } = useToast();
  const canUpload = canUserUpload(userRole);
  const isEvaluator = userRole === 'EVALUADOR';

  useEffect(() => {
    setFolders(EvidenceFolderService.migrateLegacyForIndicator(indicator.code));
    setExpandedRequirements(new Set());
  }, [indicator.code]);

  const fileCount = useMemo(
    () => indicator.requirements.reduce((total, requirement) => total + getRequirementFiles(requirement.id).length, 0),
    [getRequirementFiles, indicator.requirements],
  );

  const visibleRequirements = useMemo(
    () => isEvaluator
      ? indicator.requirements.filter(requirement => getRequirementFiles(requirement.id).length > 0)
      : indicator.requirements,
    [getRequirementFiles, indicator.requirements, isEvaluator],
  );

  const refreshFolders = () => {
    setFolders(EvidenceFolderService.getByIndicator(indicator.code));
  };

  const toggleRequirement = (requirementId: string) => {
    setExpandedRequirements(current => {
      const next = new Set(current);
      if (next.has(requirementId)) next.delete(requirementId);
      else next.add(requirementId);
      return next;
    });
  };

  const createFolder = (requirement: Requirement) => {
    setDialog({ kind: 'create-folder', requirement });
  };

  const saveFolder = (name: string) => {
    if (dialog?.kind !== 'create-folder') return;
    const folder = EvidenceFolderService.create(indicator.code, dialog.requirement.id, name);
    if (!folder) {
      showToast('Ya existe una carpeta con ese nombre.', 'error');
      return;
    }
    setDialog(null);
    refreshFolders();
    showToast('Carpeta creada correctamente.');
  };

  const removeFolder = (folder: EvidenceFolder, files: UploadedFile[]) => {
    if (EvidenceFolderService.folderHasFiles(folder.id, files)) {
      showToast('No se puede eliminar una carpeta que contiene archivos.', 'error');
      return;
    }
    setDialog({ kind: 'delete-folder', folder, files });
  };

  const executeFolderRemoval = () => {
    if (dialog?.kind !== 'delete-folder') return;
    EvidenceFolderService.delete(dialog.folder.id, dialog.files);
    setDialog(null);
    refreshFolders();
    showToast('Carpeta eliminada.');
  };

  const confirmFile = (file: UploadedFile) => {
    setDialog({ kind: 'confirm-file', file });
  };

  const executeFileConfirmation = () => {
    if (dialog?.kind !== 'confirm-file') return;
    onReviewStatus(dialog.file.id, 'Validado');
    setDialog(null);
    showToast('Evidencia validada correctamente.');
  };

  const denyFile = (file: UploadedFile) => {
    setDialog({ kind: 'deny-file', file });
  };

  const executeFileDenial = (observation: string) => {
    if (dialog?.kind !== 'deny-file') return;
    onReviewStatus(dialog.file.id, 'Rechazado', observation);
    setDialog(null);
    showToast('Evidencia rechazada con una observación.');
  };

  const buildFolderGroups = (requirementFolders: EvidenceFolder[], files: UploadedFile[]): FolderGroup[] => [
    {
      id: '',
      name: 'Sin carpeta',
      files: files.filter(file => !file.folderId),
      isVirtual: true,
    },
    ...requirementFolders.map(folder => ({
      id: folder.id,
      name: folder.name,
      files: files.filter(file => file.folderId === folder.id),
      folder,
      isVirtual: false,
    })),
  ];

  return (
    <section className="bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isEvaluator
              ? <ClipboardCheck className="h-5 w-5 text-amber-600" />
              : <FolderOpen className="h-5 w-5 text-blue-600" />}
            <h3 className="text-base font-black text-slate-900">
              {isEvaluator ? 'Bandeja de revision' : 'Repositorio de evidencias'}
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {isEvaluator
              ? `${fileCount} archivos cargados por coordinadores o docentes disponibles para revisar.`
              : `${indicator.requirements.length} evidencias y ${fileCount} archivos cargados.`}
          </p>
        </div>

        {!isEvaluator && (
          <button
            onClick={() => setIsTemplateLibraryOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-widest text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <LayoutTemplate className="h-4 w-4" />
            Ver plantillas
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-200">
        {visibleRequirements.map((requirement, index) => {
          const files = [...getRequirementFiles(requirement.id)].sort((a, b) => b.version - a.version);
          const currentFile = files.find(file => file.isCurrentVersion);
          const status = currentFile?.status || 'Pendiente';
          const isExpanded = expandedRequirements.has(requirement.id);
          const requirementFolders = folders.filter(folder => folder.requirementId === requirement.id);
          const folderGroups = buildFolderGroups(requirementFolders, files);

          return (
            <article key={requirement.id} className="bg-white">
              <div className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-slate-50">
                <button
                  onClick={() => toggleRequirement(requirement.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  aria-expanded={isExpanded}
                >
                  <ChevronRight className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    files.length > 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : isExpanded
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-50 text-amber-600'
                  }`}>
                    {isExpanded ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
                    {files.length > 0 && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white ring-2 ring-white">
                        <CheckCircle2 className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Evidencia {index + 1}
                      </span>
                      <EvidenceStatusBadge status={status} />
                    </div>
                    <p className="mt-1 truncate text-sm font-black text-slate-800">{requirement.label}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {files.length} archivo{files.length === 1 ? '' : 's'} · Formato {requirement.format}
                    </p>
                  </div>
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                  {!isEvaluator && (
                    <button
                      onClick={() => setGuideRequirement(requirement)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                      title="Ver guia de carga"
                      aria-label="Ver guia de carga"
                    >
                      <BookOpen className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onOpenHistory(requirement)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
                    title="Ver historial"
                    aria-label="Ver historial"
                  >
                    <History className="h-4 w-4" />
                  </button>
                  {isEvaluator && currentFile && (
                    <>
                      <button
                        onClick={() => setPreviewFile(currentFile)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-[10px] font-black uppercase tracking-widest text-blue-700 hover:bg-blue-600 hover:text-white"
                        title="Visualizar archivo subido"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Visualizar
                      </button>
                      <button
                        onClick={() => confirmFile(currentFile)}
                        disabled={currentFile.status === 'Validado'}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
                        title="Confirmar evidencia"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmar
                      </button>
                      <button
                        onClick={() => denyFile(currentFile)}
                        disabled={currentFile.status === 'Rechazado'}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
                        title="Denegar evidencia"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Denegar
                      </button>
                      <button
                        onClick={() => onOpenEditor(requirement)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-amber-600 transition-colors hover:bg-amber-50"
                        title="Revision detallada y observaciones"
                        aria-label="Revision detallada y observaciones"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {canUpload && (
                    <button
                      onClick={() => onOpenUpload(requirement, requirementFolders)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
                      title="Subir archivo"
                      aria-label="Subir archivo"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-slate-100 bg-slate-50 px-6 py-5"
                >
                  <div className="mb-4 flex flex-wrap gap-2 sm:hidden">
                    {!isEvaluator && <RepositoryAction icon={BookOpen} label="Guia" onClick={() => setGuideRequirement(requirement)} />}
                    <RepositoryAction icon={History} label="Historial" onClick={() => onOpenHistory(requirement)} />
                    {isEvaluator && <RepositoryAction icon={ClipboardCheck} label="Revisar" onClick={() => onOpenEditor(requirement)} />}
                    {canUpload && <RepositoryAction icon={Upload} label="Subir" onClick={() => onOpenUpload(requirement, requirementFolders)} primary />}
                  </div>

                  <div className="ml-5 border-l border-slate-300 pl-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carpetas de la evidencia</p>
                      {canUpload && (
                        <button
                          onClick={() => createFolder(requirement)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-300 hover:text-blue-600"
                        >
                          <FolderPlus className="h-3.5 w-3.5" />
                          Crear carpeta
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {folderGroups.map(group => (
                        <div key={group.id || 'without-folder'} className="rounded-lg border border-slate-200 bg-white">
                          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                            {group.isVirtual ? (
                              <FolderOpen className={`h-4 w-4 ${group.files.length > 0 ? 'text-emerald-600' : 'text-blue-600'}`} />
                            ) : (
                              <Folder className={`h-4 w-4 ${group.files.length > 0 ? 'text-emerald-600' : 'text-amber-500'}`} />
                            )}
                            <p className="min-w-0 flex-1 truncate text-sm font-black text-slate-700">{group.name}</p>
                            <span className="text-xs font-bold text-slate-400">{group.files.length}</span>
                            {!isEvaluator && !group.isVirtual && group.folder && (
                              <button
                                onClick={() => removeFolder(group.folder, files)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title="Eliminar carpeta"
                                aria-label={`Eliminar carpeta ${group.name}`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {group.files.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                              {group.files.map(file => (
                                <FileRow
                                  key={file.id}
                                  file={file}
                                  isEvaluator={isEvaluator}
                                  onPreview={setPreviewFile}
                                  onConfirm={confirmFile}
                                  onDeny={denyFile}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 px-4 py-5 text-sm text-slate-400">
                              <FileClock className="h-4 w-4" />
                              Todavia no hay archivos en esta carpeta.
                            </div>
                          )}
                        </div>
                      ))}

                      {canUpload && (
                        <button
                          onClick={() => onOpenUpload(requirement, requirementFolders)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                          Subir archivo a esta evidencia
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </article>
          );
        })}
        {isEvaluator && visibleRequirements.length === 0 && (
          <div className="px-8 py-14 text-center">
            <FileClock className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-black text-slate-600">No hay archivos para revisar en este indicador.</p>
            <p className="mt-1 text-xs text-slate-400">
              Las evidencias apareceran aqui cuando un coordinador o docente cargue documentos.
            </p>
          </div>
        )}
      </div>

      {!isEvaluator && (
        <>
          <EvidenceGuideModal
            isOpen={Boolean(guideRequirement)}
            indicator={indicator}
            requirement={guideRequirement}
            onClose={() => setGuideRequirement(null)}
          />
          <TemplateLibraryModal
            isOpen={isTemplateLibraryOpen}
            onClose={() => setIsTemplateLibraryOpen(false)}
          />
        </>
      )}
      <EvidenceFilePreviewModal
        isOpen={Boolean(previewFile)}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
      <PromptDialog
        isOpen={dialog?.kind === 'create-folder'}
        title="Crear carpeta"
        label="Nombre de la carpeta"
        confirmLabel="Crear carpeta"
        onCancel={() => setDialog(null)}
        onConfirm={saveFolder}
      />
      <PromptDialog
        isOpen={dialog?.kind === 'deny-file'}
        title="Rechazar evidencia"
        label="Motivo de la observación"
        confirmLabel="Rechazar"
        multiline
        onCancel={() => setDialog(null)}
        onConfirm={executeFileDenial}
      />
      <ConfirmDialog
        isOpen={dialog?.kind === 'delete-folder'}
        title="Eliminar carpeta"
        description={dialog?.kind === 'delete-folder' ? `Se eliminará la carpeta “${dialog.folder.name}”.` : ''}
        confirmLabel="Eliminar"
        onCancel={() => setDialog(null)}
        onConfirm={executeFolderRemoval}
      />
      <ConfirmDialog
        isOpen={dialog?.kind === 'confirm-file'}
        title="Validar evidencia"
        description={dialog?.kind === 'confirm-file' ? `Se marcará “${dialog.file.fileName}” como validada.` : ''}
        confirmLabel="Validar"
        tone="primary"
        onCancel={() => setDialog(null)}
        onConfirm={executeFileConfirmation}
      />
    </section>
  );
};

interface FileRowProps {
  file: UploadedFile;
  isEvaluator: boolean;
  onPreview: (file: UploadedFile) => void;
  onConfirm: (file: UploadedFile) => void;
  onDeny: (file: UploadedFile) => void;
}

const FileRow = ({ file, isEvaluator, onPreview, onConfirm, onDeny }: FileRowProps) => (
  <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-blue-50">
    <button
      onClick={() => onPreview(file)}
      className="flex min-w-0 flex-1 items-center gap-3 text-left"
      title="Visualizar archivo"
    >
      <span className="relative shrink-0">
        <FileText className="h-4 w-4 text-emerald-600" />
        <CheckCircle2 className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-white text-emerald-600" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-700">{file.fileName}</p>
        <p className="mt-0.5 text-[10px] text-slate-400">
          v{file.version} · {file.uploadDate} · {file.uploadedBy}
        </p>
      </div>
    </button>

    <EvidenceStatusBadge status={file.status} />

    {isEvaluator && (
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => onPreview(file)}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-700 hover:bg-blue-600 hover:text-white"
          title="Visualizar archivo subido"
        >
          <Eye className="h-3.5 w-3.5" />
          Visualizar
        </button>
        <button
          onClick={() => onConfirm(file)}
          disabled={file.status === 'Validado'}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
          title="Confirmar evidencia"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Confirmar
        </button>
        <button
          onClick={() => onDeny(file)}
          disabled={file.status === 'Rechazado'}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
          title="Denegar evidencia"
        >
          <XCircle className="h-3.5 w-3.5" />
          Denegar
        </button>
      </div>
    )}
  </div>
);

interface RepositoryActionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  primary?: boolean;
}

const RepositoryAction = ({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: RepositoryActionProps) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
      primary
        ? 'bg-blue-600 text-white'
        : 'border border-slate-200 bg-white text-slate-600'
    }`}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </button>
);
