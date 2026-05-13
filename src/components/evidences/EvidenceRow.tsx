import React from 'react';
import { Requirement, UploadedFile, UserRole } from '../../types';
import { EvidenceStatusBadge as StatusBadge } from './EvidenceStatusBadge';
import { Lightbulb, Settings, Upload, AlertCircle, Edit3 } from 'lucide-react';

interface EvidenceRowProps {
  requirement: Requirement;
  userRole: UserRole;
  files: UploadedFile[];
  onOpenManagement: (req: Requirement) => void;
  onOpenUpload: (req: Requirement) => void;
  onRequestAI: (req: Requirement) => void;
  onOpenEditor: (req: Requirement) => void;
}

export const EvidenceRow = ({
  requirement,
  userRole,
  files,
  onOpenManagement,
  onOpenUpload,
  onRequestAI,
  onOpenEditor
}: EvidenceRowProps) => {
  const currentFile = files.find(f => f.isCurrentVersion);
  const status = currentFile ? currentFile.status : 'Pendiente';

  return (
    <tr className="group hover:bg-slate-50/80 transition-colors">
      <td className="px-8 py-5">
        <div 
          className="cursor-pointer group/item"
          onClick={() => onOpenManagement(requirement)}
        >
          <p className="text-sm font-bold text-slate-700 leading-tight group-hover/item:text-blue-600 transition-colors">{requirement.label}</p>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">{requirement.description}</p>
          {currentFile?.observation && (
            <p className="text-[10px] text-amber-600 font-bold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Observación: {currentFile.observation}
            </p>
          )}
        </div>
      </td>
      <td className="px-8 py-5 text-center">
        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase tracking-wider">{requirement.format}</span>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center justify-center">
          <StatusBadge status={status} />
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <div className="flex justify-end gap-2 shrink-0">
          {userRole === 'COORDINADOR' && (
            <button 
              onClick={() => onOpenEditor(requirement)}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm group"
              title="Editar evidencia"
            >
              <Edit3 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Editar evidencia</span>
            </button>
          )}
          <button 
            onClick={() => onRequestAI(requirement)}
            className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
            title="Solicitar Guía IA"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onOpenManagement(requirement)}
            className="p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm"
            title="Editar Revisión / Notas"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onOpenUpload(requirement)}
            className={`p-2.5 rounded-xl transition-all shadow-sm ${status === 'Observado' || status === 'Pendiente' || status === 'Rechazado' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            title={currentFile ? "Reemplazar Archivo (Nueva Versión)" : "Subir Archivo"}
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
