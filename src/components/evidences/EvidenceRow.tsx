import React from 'react';
import { Requirement, UploadedFile, UserRole } from '../../types';
import { EvidenceStatusBadge as StatusBadge } from './EvidenceStatusBadge';
import { Upload, AlertCircle, Edit3, ClipboardCheck, History } from 'lucide-react';
import { canUserUpload } from '../../utils/permissions';

interface EvidenceRowProps {
  requirement: Requirement;
  userRole: UserRole;
  files: UploadedFile[];
  onOpenUpload: (req: Requirement) => void;
  onOpenEditor: (req: Requirement) => void;
  onOpenHistory: (req: Requirement) => void;
}

export const EvidenceRow = ({
  requirement,
  userRole,
  files,
  onOpenUpload,
  onOpenEditor,
  onOpenHistory
}: EvidenceRowProps) => {
  const currentFile = files.find(file => file.isCurrentVersion);
  const status = currentFile ? currentFile.status : 'Pendiente';
  const canUploadFile = canUserUpload(userRole);
  const editorLabel =
    userRole === 'EVALUADOR'
      ? 'Revisar evidencia'
      : userRole === 'ADMIN'
        ? 'Gestionar evidencia'
        : 'Editar evidencia';
  const EditorIcon = userRole === 'EVALUADOR' ? ClipboardCheck : Edit3;

  return (
    <tr className="group hover:bg-slate-50/80 transition-colors">
      <td className="px-8 py-5">
        <div className="cursor-pointer group/item" onClick={() => onOpenEditor(requirement)}>
          <p className="text-sm font-bold text-slate-700 leading-tight group-hover/item:text-blue-600 transition-colors">
            {requirement.label}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">{requirement.description}</p>
          {currentFile?.observation && (
            <p className="text-[10px] text-amber-600 font-bold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Observacion: {currentFile.observation}
            </p>
          )}
        </div>
      </td>
      <td className="px-8 py-5 text-center">
        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase tracking-wider">
          {requirement.format}
        </span>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center justify-center">
          <StatusBadge status={status} />
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <div className="flex justify-end gap-2 shrink-0">
          <button
            onClick={() => onOpenEditor(requirement)}
            className={`h-10 w-10 inline-flex items-center justify-center rounded-xl transition-all shadow-sm group ${
              userRole === 'EVALUADOR'
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
            }`}
            title={editorLabel}
            aria-label={editorLabel}
          >
            <EditorIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => onOpenHistory(requirement)}
            className="p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm"
            title="Ver historial de documentos subidos"
          >
            <History className="w-4 h-4" />
          </button>

          {canUploadFile && (
            <button
              onClick={() => onOpenUpload(requirement)}
              className={`p-2.5 rounded-xl transition-all shadow-sm ${
                status === 'Observado' || status === 'Pendiente' || status === 'Rechazado'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
              title={currentFile ? 'Reemplazar archivo (nueva version)' : 'Subir archivo'}
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
