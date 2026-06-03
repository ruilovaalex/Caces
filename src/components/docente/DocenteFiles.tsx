import React, { useState } from 'react';
import { Search, Filter, FileText, Eye, Download, Trash2, UploadCloud, AlertCircle } from 'lucide-react';

interface DocenteFilesProps {
  onOpenUploadModal: () => void;
}

export const DocenteFiles = ({ onOpenUploadModal }: DocenteFilesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const files = [
    { id: '1', name: 'Syllabus_Biologia_2024.pdf', type: 'PDF', date: '01/06/2026', status: 'Validado', specialBadge: '' },
    { id: '2', name: 'Acta_Reunion_Marzo.docx', type: 'DOCX', date: '28/05/2026', status: 'Observado', observation: 'Falta firma del director', specialBadge: '' },
    { id: '3', name: 'Titutlo_Maestria.pdf', type: 'PDF', date: '20/05/2026', status: 'Pendiente', specialBadge: '' },
    { id: '4', name: 'Informe_2025.pdf', type: 'PDF', date: '25/05/2026', status: 'Pendiente', specialBadge: 'Generado con IA' },
    { id: '5', name: 'Scan_Mayo_2025.pdf', type: 'PDF', date: '26/05/2026', status: 'Pendiente', specialBadge: 'Escaneado' }
  ];

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'Todos' || file.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Validado':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">Validado</span>;
      case 'Observado':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 border border-rose-200">Observado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">Pendiente</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Mis Archivos</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Gestión de evidencias subidas</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar archivo por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 appearance-none transition-all"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Validado">Validado</option>
            <option value="Observado">Observado</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
        {filteredFiles.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredFiles.map(file => (
              <div key={file.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${file.status === 'Observado' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-600'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800">{file.name}</h4>
                        {file.specialBadge && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">
                            {file.specialBadge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{file.type}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{file.date}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        {getStatusBadge(file.status)}
                      </div>

                      {/* Observacion Directa en recuadro rojo claro */}
                      {file.status === 'Observado' && file.observation && (
                        <div className="mt-3 bg-rose-50 border border-rose-100 rounded-lg p-3 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 mb-0.5">Observación del coordinador</p>
                            <p className="text-xs text-rose-600 font-medium">{file.observation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto ml-14 md:ml-0">
                    <button className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Ver archivo">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Descargar">
                      <Download className="w-4 h-4" />
                    </button>
                    {file.status === 'Observado' && (
                      <button 
                        onClick={onOpenUploadModal}
                        className="h-8 px-3 rounded-lg bg-rose-100 text-rose-700 flex items-center gap-2 hover:bg-rose-200 transition-colors text-xs font-bold" 
                        title="Subir corrección"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Corregir
                      </button>
                    )}
                    <button className="h-8 w-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors ml-2" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-700">No se encontraron archivos</h3>
            <p className="text-xs text-slate-500 mt-1">Intenta con otros términos de búsqueda o filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};
