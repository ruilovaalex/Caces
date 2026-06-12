import React, { useEffect, useState } from 'react';
import { Download, Eye, FileText, Loader2, Printer } from 'lucide-react';
import { UploadedFile } from '../../types';
import { EvidenceService } from '../../services/evidenceService';
import { getDisplayFileType } from '../../utils/evidenceFormatUtils';
import { Modal } from '../common/Modal';
import { EvidenceStatusBadge } from './EvidenceStatusBadge';

interface EvidenceFilePreviewModalProps {
  isOpen: boolean;
  file: UploadedFile | null;
  onClose: () => void;
}

export const EvidenceFilePreviewModal = ({
  isOpen,
  file,
  onClose,
}: EvidenceFilePreviewModalProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let activeUrl: string | null = null;
    let cancelled = false;

    if (!isOpen || !file) {
      setFileUrl(null);
      return;
    }

    setIsLoading(true);
    EvidenceService.getFileContent(file.id)
      .then(blob => {
        if (cancelled || !blob) return;
        activeUrl = URL.createObjectURL(blob);
        setFileUrl(activeUrl);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [file, isOpen]);

  if (!file) return null;

  const normalizedType = getDisplayFileType(file.fileName, file.fileType).toUpperCase();
  const canEmbedPdf = normalizedType === 'PDF';
  const canEmbedImage = ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF'].includes(normalizedType);

  const handleDownload = () => {
    if (!fileUrl) return;
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = file.fileName;
    anchor.click();
  };

  const handlePrint = () => {
    if (!fileUrl) return;
    const printWindow = window.open(fileUrl, '_blank');
    if (!printWindow) return;
    printWindow.addEventListener('load', () => printWindow.print(), { once: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Visualizar archivo" maxWidth="max-w-6xl">
      <div className="border-t border-slate-100 bg-slate-100 p-6">
        <div className="mb-4 flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-800">{file.fileName}</p>
            <p className="mt-1 text-xs text-slate-400">
              v{file.version} · {file.uploadDate} · {file.uploadedBy}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Carpeta: {file.folderName || 'Sin carpeta'}
            </p>
          </div>
          <EvidenceStatusBadge status={file.status} />
        </div>

        <div className="flex min-h-[540px] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
          {isLoading ? (
            <div className="text-center text-slate-400">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-3 text-sm font-bold">Cargando archivo...</p>
            </div>
          ) : fileUrl && canEmbedPdf ? (
            <iframe
              src={fileUrl}
              title={file.fileName}
              className="h-[620px] w-full"
            />
          ) : fileUrl && canEmbedImage ? (
            <img
              src={fileUrl}
              alt={file.fileName}
              className="max-h-[620px] max-w-full object-contain"
            />
          ) : (
            <div className="max-w-xl p-10 text-center">
              <Eye className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-black text-slate-700">
                {fileUrl ? 'Este formato se abre mediante descarga.' : 'Vista previa no disponible para este archivo.'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {fileUrl
                  ? 'Descarga el documento para abrirlo con su aplicacion correspondiente.'
                  : 'Este documento fue cargado antes de habilitar el almacenamiento del archivo real. Vuelve a subir una nueva version para visualizarla aqui.'}
              </p>
            </div>
          )}
        </div>

        {file.observation && (
          <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Observacion</p>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">{file.observation}</p>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleDownload}
            disabled={!fileUrl}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Descargar
          </button>
          <button
            onClick={handlePrint}
            disabled={!fileUrl || (!canEmbedPdf && !canEmbedImage)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
        </div>
      </div>
    </Modal>
  );
};
