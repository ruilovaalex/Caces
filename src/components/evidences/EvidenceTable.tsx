import React from 'react';
import { Indicator, Requirement, UploadedFile, UserRole } from '../../types';
import { EvidenceRow } from './EvidenceRow';
import { Folder, Info, PenSquare, ClipboardCheck, Upload, History } from 'lucide-react';
import { WorkflowGuide } from '../layout/WorkflowGuide';

interface EvidenceTableProps {
  indicator: Indicator;
  userRole: UserRole;
  getRequirementFiles: (reqId: string) => UploadedFile[];
  onOpenUpload: (req: Requirement) => void;
  onOpenEditor: (req: Requirement) => void;
  onOpenHistory: (req: Requirement) => void;
}

export const EvidenceTable = ({
  indicator,
  userRole,
  getRequirementFiles,
  onOpenUpload,
  onOpenEditor,
  onOpenHistory
}: EvidenceTableProps) => {
  const isEvaluator = userRole === 'EVALUADOR';

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="m-8 mb-0">
        <WorkflowGuide activeStep={isEvaluator ? 'review' : 'evidence'} />
      </div>

      <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-600" />
          Evidencias Requeridas por el CACES
        </h3>
        <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest">Modelo de Evaluacion v.2024</span>
      </div>

      <div className="mx-8 mt-5 rounded-lg border border-blue-100 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-white p-2 text-blue-600 shadow-sm border border-blue-100">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-slate-800">Como usar esta seccion</p>
            {isEvaluator ? (
              <>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Entra a revisar cada evidencia para evaluar lo cargado por el coordinador, dejar observaciones y decidir si se valida, se observa o se rechaza.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-100">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    1. Revisar evidencia
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 border border-slate-200">
                    <Info className="w-3.5 h-3.5" />
                    2. Analizar version actual
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-rose-700 border border-rose-100">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    3. Validar, observar o rechazar
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Para cada evidencia, prepara el contenido con plantilla manual, genera el documento institucional y revisa el historial de archivos subidos desde su boton independiente. La carga final sigue en el boton azul de la tabla.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-100">
                    <PenSquare className="w-3.5 h-3.5" />
                    1. Preparar evidencia
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 border border-slate-200">
                    <History className="w-3.5 h-3.5" />
                    2. Revisar historial
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-blue-700 border border-blue-100">
                    <Upload className="w-3.5 h-3.5" />
                    3. Subir version final
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <th className="px-8 py-4">Evidencia Requerida</th>
              <th className="px-8 py-4 text-center">Formato</th>
              <th className="px-8 py-4 text-center">Estado</th>
              <th className="px-8 py-4 text-right">Acciones de Gestion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {indicator.requirements.map(requirement => (
              <EvidenceRow
                key={requirement.id}
                requirement={requirement}
                userRole={userRole}
                files={getRequirementFiles(requirement.id)}
                onOpenUpload={onOpenUpload}
                onOpenEditor={onOpenEditor}
                onOpenHistory={onOpenHistory}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
