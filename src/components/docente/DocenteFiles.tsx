import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Eye, Download, UploadCloud, AlertCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import {
  scaleIn, staggerContainerFast, easeOutFast, hoverScale, hoverCardLift, tapScale,
} from '../../utils/animations';

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

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'Validado': return 'border-t-[#15803d]';
      case 'Observado': return 'border-t-[#dc2626]';
      default: return 'border-t-[#2563eb]';
    }
  };

  const getLargeBadge = (status: string) => {
    switch (status) {
      case 'Validado':
        return (
          <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> Validado
          </div>
        );
      case 'Observado':
        return (
          <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-4 h-4" /> Observado
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-4 h-4" /> Pendiente
          </div>
        );
    }
  };

  const getFileIcon = (type: string) => {
    const isPdf = type === 'PDF';
    return (
      <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner ${isPdf ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
        <FileText className="w-5 h-5 mb-0.5" />
        <span className="text-[8px] font-black">{type}</span>
      </div>
    );
  };

  const statusOptions = ['Todos', 'Pendiente', 'Validado', 'Observado'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">Mis Archivos</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
            {files.length} documentos · {files.filter(f => f.status === 'Validado').length} validado · {files.filter(f => f.status === 'Observado').length} observado
          </p>
        </div>
        <motion.button
          whileHover={hoverScale}
          whileTap={tapScale}
          onClick={onOpenUploadModal} 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2563eb] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all active:scale-95 border-none"
        >
          <UploadCloud className="w-4 h-4" /> 
          Subir evidencia
        </motion.button>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
        className="flex flex-col xl:flex-row justify-between gap-5 bg-white p-2 rounded-2xl border border-[#e2e8f0] shadow-sm"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar archivo por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 rounded-xl">
          {statusOptions.map(status => (
            <motion.button
              key={status}
              whileHover={hoverScale}
              whileTap={tapScale}
              onClick={() => setFilterStatus(status)} 
              className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === status 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'bg-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Grid of Cards with AnimatePresence for filter transitions */}
      <AnimatePresence mode="popLayout">
        {filteredFiles.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredFiles.map((file, i) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: i * 0.07 }}
                  whileHover={hoverCardLift}
                  className={`premium-card relative bg-white rounded-2xl border-t-[3px] ${getBorderColor(file.status)} p-0 flex flex-col shadow-lg shadow-slate-200/50`}
                >
                  
                  {file.specialBadge && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.07 }}
                      className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 border border-indigo-200 z-10"
                    >
                      {file.specialBadge}
                    </motion.div>
                  )}

                  <div className="p-6 pb-0 flex items-start gap-4">
                    {getFileIcon(file.type)}
                    <div className="pr-16 pt-1">
                      <h4 className="text-[15px] font-black text-slate-800 leading-tight line-clamp-2">{file.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{file.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        {file.date}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 mt-6">
                    {getLargeBadge(file.status)}
                  </div>

                  {file.status === 'Observado' && file.observation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.2 }}
                      className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-100/50 rounded-xl"
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-rose-800 mb-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Observación del coordinador:
                      </p>
                      <p className="text-xs text-rose-600 font-medium italic leading-relaxed">
                        "{file.observation}"
                      </p>
                    </motion.div>
                  )}

                  <div className="mt-auto pt-6">
                    <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 border-t border-slate-100 rounded-b-2xl overflow-hidden">
                      <motion.button whileHover={hoverScale} whileTap={tapScale} className="flex items-center justify-center gap-2 py-3.5 text-[10px] font-black text-slate-500 hover:text-blue-600 hover:bg-white transition-colors uppercase tracking-widest">
                        <Eye className="w-4 h-4" /> Ver
                      </motion.button>
                      <motion.button whileHover={hoverScale} whileTap={tapScale} className="flex items-center justify-center gap-2 py-3.5 text-[10px] font-black text-slate-500 hover:text-blue-600 hover:bg-white transition-colors uppercase tracking-widest">
                        <Download className="w-4 h-4" /> Bajar
                      </motion.button>
                      {file.status === 'Observado' ? (
                        <motion.button whileHover={hoverScale} whileTap={tapScale} onClick={onOpenUploadModal} className="flex items-center justify-center gap-2 py-3.5 text-[10px] font-black text-rose-600 hover:text-rose-700 hover:bg-rose-100 transition-colors uppercase tracking-widest">
                          <UploadCloud className="w-4 h-4" /> Corregir
                        </motion.button>
                      ) : (
                        <button disabled className="flex items-center justify-center gap-2 py-3.5 text-[10px] font-black text-slate-400 opacity-40 cursor-not-allowed uppercase tracking-widest">
                          <UploadCloud className="w-4 h-4" /> Corregir
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="premium-card bg-white p-12 text-center rounded-2xl"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">No se encontraron archivos</h3>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm mx-auto">
              Intenta con otros términos de búsqueda o cambia los filtros seleccionados para ver más resultados.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
