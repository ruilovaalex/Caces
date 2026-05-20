import React from 'react';
import { ClipboardCheck, AlertTriangle, CheckCircle2, XCircle, FileSearch } from 'lucide-react';
import { UploadedFile } from '../../types';

interface EvaluatorReviewGuidePanelProps {
  currentFile: UploadedFile | undefined;
}

export const EvaluatorReviewGuidePanel = ({ currentFile }: EvaluatorReviewGuidePanelProps) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 shadow-inner">
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm tracking-tight text-amber-700">Guia del Evaluador</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revision tecnica</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Que revisar</p>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Verifica que la evidencia sea pertinente, completa, formal y consistente con el indicador antes de decidir su estado.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <FileSearch className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Pertinencia</p>
              <p className="text-xs text-slate-500 mt-1">El archivo debe corresponder exactamente a la evidencia pedida por el indicador.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Completitud</p>
              <p className="text-xs text-slate-500 mt-1">Revisa si contiene firmas, fechas, responsables, anexos y toda la informacion clave.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Observacion</p>
              <p className="text-xs text-slate-500 mt-1">Usa este estado cuando sea corregible y deja una instruccion precisa para el coordinador.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <XCircle className="w-4 h-4 text-rose-600 mt-0.5" />
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Rechazo</p>
              <p className="text-xs text-slate-500 mt-1">Aplicalo cuando el archivo no corresponda, sea insuficiente o invalido para el CACES.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version actual</p>
          <p className="mt-2 text-sm font-bold text-slate-700">{currentFile?.fileName || 'Sin archivo cargado'}</p>
          <p className="mt-1 text-xs text-slate-500">
            {currentFile
              ? `Subido por ${currentFile.uploadedBy} el ${currentFile.uploadDate}`
              : 'No existe una evidencia cargada para revisar todavia.'}
          </p>
        </div>
      </div>
    </div>
  );
};
