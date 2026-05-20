import React from 'react';
import { UploadedFile } from '../../types';
import { EvidenceStatusBadge as StatusBadge } from './EvidenceStatusBadge';
import { FileText } from 'lucide-react';

interface EvidenceVersionHistoryProps {
  files: UploadedFile[];
}

export const EvidenceVersionHistory = ({ files }: EvidenceVersionHistoryProps) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <th className="px-6 py-4">Versión</th>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4">Tipo</th>
            <th className="px-6 py-4">Tamano</th>
            <th className="px-6 py-4">Subido por</th>
            <th className="px-6 py-4">Archivo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {files.map((file) => (
            <tr key={file.id}>
              <td className="px-6 py-5 font-black text-slate-400">v{file.version}</td>
              <td className="px-6 py-5 text-[10px] font-bold text-slate-500">{file.uploadDate}</td>
              <td className="px-6 py-5"><StatusBadge status={file.status} /></td>
              <td className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase">{file.fileType}</td>
              <td className="px-6 py-5 text-[10px] font-bold text-slate-500">{file.fileSize}</td>
              <td className="px-6 py-5 text-[10px] font-bold text-slate-500">{file.uploadedBy}</td>
              <td className="px-6 py-5 text-right">
                <button className="p-2 bg-slate-100 rounded-lg text-slate-400" title={file.fileName}>
                  <FileText className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
