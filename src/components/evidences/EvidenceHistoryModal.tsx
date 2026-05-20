import React from 'react';
import { Archive, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Requirement, UploadedFile } from '../../types';
import { EvidenceVersionHistory } from './EvidenceVersionHistory';

interface EvidenceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRequirement: Requirement | null;
  files: UploadedFile[];
}

export const EvidenceHistoryModal = ({
  isOpen,
  onClose,
  activeRequirement,
  files
}: EvidenceHistoryModalProps) => {
  if (!activeRequirement) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de documentos"
      maxWidth="max-w-5xl"
      zIndex={102}
    >
      <div className="p-8 space-y-6 bg-white border-t border-slate-50">
        <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600">
            <Archive className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidencia</p>
            <h3 className="mt-1 text-lg font-black text-slate-800">{activeRequirement.label}</h3>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">{activeRequirement.description}</p>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 text-center border border-slate-200">
            <p className="text-2xl font-black text-slate-800">{files.length}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Versiones</p>
          </div>
        </div>

        {files.length > 0 ? (
          <EvidenceVersionHistory files={files} />
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-black text-slate-600">Aun no hay documentos subidos.</p>
            <p className="mt-1 text-xs text-slate-400">Cuando se suban PDFs, DOCX, XLSX u otros archivos para esta evidencia, apareceran aqui.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
