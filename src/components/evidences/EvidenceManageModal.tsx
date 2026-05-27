import React from 'react';
import { Folder, Lightbulb, Upload } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Requirement, UploadedFile } from '../../types';
import { EvidenceStatusBadge as StatusBadge } from './EvidenceStatusBadge';
import { EvidenceVersionHistory } from './EvidenceVersionHistory';

interface EvidenceManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRequirement: Requirement | null;
  files: UploadedFile[];
  onOpenEditor: (req: Requirement) => void;
  onOpenUpload: (req: Requirement) => void;
}

export const EvidenceManageModal = ({
  isOpen,
  onClose,
  activeRequirement,
  files,
  onOpenEditor,
  onOpenUpload
}: EvidenceManageModalProps) => {
  if (!activeRequirement) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Gestión de Evidencia"
      maxWidth="max-w-4xl"
      zIndex={101}
    >
      <div className="p-10 space-y-8 bg-white border-t border-slate-50">
        <div className="flex justify-between items-start">
          <div className="flex gap-6 items-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
              <Folder className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requerimiento</span>
                <StatusBadge status={files.find(f => f.isCurrentVersion)?.status || 'Pendiente'} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{activeRequirement.label}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descripción</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-5 rounded-3xl border border-slate-100 leading-relaxed italic">
                  "{activeRequirement.description}"
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
                    <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Formato</p>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">{activeRequirement.format}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Versiones</p>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{files.length}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-[32px] p-6 text-white space-y-4">
                <button 
                  onClick={() => { onOpenEditor(activeRequirement); onClose(); }}
                  className="w-full py-4 bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  Preparar evidencia
                </button>
                <button 
                  onClick={() => { onOpenUpload(activeRequirement); onClose(); }}
                  className="w-full py-4 bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Subir Versión
                </button>
              </div>
            </div>
        </div>

        <div className="pt-4">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                Historial de Versiones
            </h4>
            <EvidenceVersionHistory files={files} />
        </div>
      </div>
    </Modal>
  );
};
