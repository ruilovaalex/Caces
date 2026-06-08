import React, { useMemo, useState } from 'react';
import { Archive, FileText, Filter } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Requirement, Status, UploadedFile } from '../../types';
import { EvidenceVersionHistory } from './EvidenceVersionHistory';
import { getDisplayFileType } from '../../utils/evidenceFormatUtils';

interface EvidenceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRequirement: Requirement | null;
  files: UploadedFile[];
  onDeleteFile?: (fileId: string) => void;
}

export const EvidenceHistoryModal = ({
  isOpen,
  onClose,
  activeRequirement,
  files,
  onDeleteFile
}: EvidenceHistoryModalProps) => {
  const [statusFilter, setStatusFilter] = useState<'Todos' | Status>('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');

  const fileTypes = useMemo(() => {
    const normalizedTypes = files
      .map(file => getDisplayFileType(file.fileName, file.fileType));

    return Array.from(new Set(normalizedTypes));
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const normalizedType = getDisplayFileType(file.fileName, file.fileType);

      const matchesStatus = statusFilter === 'Todos' || file.status === statusFilter;
      const matchesType = typeFilter === 'Todos' || normalizedType === typeFilter;

      return matchesStatus && matchesType;
    });
  }, [files, statusFilter, typeFilter]);

  const handleDeleteFile = (file: UploadedFile) => {
    if (!onDeleteFile) return;
    const confirmed = window.confirm(`Eliminar ${file.fileName}? Esta accion quitara la version v${file.version} del historial.`);
    if (!confirmed) return;

    onDeleteFile(file.id);
  };

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
            <p className="text-2xl font-black text-slate-800">{filteredFiles.length}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Versiones</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              Filtros del historial
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</span>
                <select
                  value={statusFilter}
                  onChange={event => setStatusFilter(event.target.value as 'Todos' | Status)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 outline-none transition-colors focus:border-blue-300 focus:bg-white"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Cargado">Cargado</option>
                  <option value="Validado">Validado</option>
                  <option value="Observado">Observado</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de archivo</span>
                <select
                  value={typeFilter}
                  onChange={event => setTypeFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 outline-none transition-colors focus:border-blue-300 focus:bg-white"
                >
                  <option value="Todos">Todos los tipos</option>
                  {fileTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {filteredFiles.length > 0 ? (
          <EvidenceVersionHistory
            files={filteredFiles}
            onDeleteFile={onDeleteFile ? handleDeleteFile : undefined}
          />
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-black text-slate-600">
              {files.length > 0 ? 'No hay documentos con esos filtros.' : 'Aun no hay documentos subidos.'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {files.length > 0 ? 'Cambia los filtros para revisar otras versiones.' : 'Cuando se suban PDFs, DOCX, XLSX u otros archivos para esta evidencia, apareceran aqui.'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
