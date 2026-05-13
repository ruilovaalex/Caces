import React from 'react';
import { Upload, CheckCircle2, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Requirement } from '../../types';

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRequirement: Requirement | null;
  uploadForm: { file: File | null; obs: string };
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onObsChange: (obs: string) => void;
  onSave: () => void;
  isGenerating: boolean;
}

export const EvidenceUploadModal = ({
  isOpen,
  onClose,
  activeRequirement,
  uploadForm,
  onFileChange,
  onObsChange,
  onSave,
  isGenerating
}: EvidenceUploadModalProps) => {
  if (!activeRequirement) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cargar Evidencia">
      <div className="p-8 border-t border-slate-50 space-y-6">
        <p className="text-slate-400 text-sm font-medium -mt-4">{activeRequirement.label}</p>
        
        <div 
          className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
            uploadForm.file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 hover:border-blue-200 bg-slate-50/50'
          }`}
        >
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={onFileChange}
          />
          <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
              {uploadForm.file ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <FileText className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700">
                {uploadForm.file ? uploadForm.file.name : 'Seleccionar archivo local'}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {uploadForm.file ? `${(uploadForm.file.size / 1024).toFixed(1)} KB` : 'PDF, XLSX o DOCX hasta 20MB'}
              </p>
            </div>
          </label>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observación de la Versión</label>
          <textarea 
            value={uploadForm.obs}
            onChange={(e) => onObsChange(e.target.value)}
            placeholder="Ej: Versión inicial con firmas del decano..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none min-h-[100px] resize-none"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            disabled={!uploadForm.file || isGenerating}
            onClick={onSave}
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 text-nowrap"
          >
            {isGenerating ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
