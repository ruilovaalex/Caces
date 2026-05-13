import React from 'react';
import { Indicator, Requirement, UploadedFile, UserRole } from '../../types';
import { EvidenceRow } from './EvidenceRow';
import { Folder } from 'lucide-react';

interface EvidenceTableProps {
  indicator: Indicator;
  userRole: UserRole;
  getRequirementFiles: (reqId: string) => UploadedFile[];
  onOpenManagement: (req: Requirement) => void;
  onOpenUpload: (req: Requirement) => void;
  onRequestAI: (req: Requirement) => void;
  onOpenEditor: (req: Requirement) => void;
}

export const EvidenceTable = ({
  indicator,
  userRole,
  getRequirementFiles,
  onOpenManagement,
  onOpenUpload,
  onRequestAI,
  onOpenEditor
}: EvidenceTableProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-600" />
          Evidencias Requeridas por el CACES
        </h3>
        <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest">Modelo de Evaluación v.2024</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <th className="px-8 py-4">Evidencia Requerida</th>
              <th className="px-8 py-4 text-center">Formato</th>
              <th className="px-8 py-4 text-center">Estado</th>
              <th className="px-8 py-4 text-right">Acciones de Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {indicator.requirements.map((req) => (
              <EvidenceRow 
                key={req.id}
                requirement={req}
                userRole={userRole}
                files={getRequirementFiles(req.id)}
                onOpenManagement={onOpenManagement}
                onOpenUpload={onOpenUpload}
                onRequestAI={onRequestAI}
                onOpenEditor={onOpenEditor}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
