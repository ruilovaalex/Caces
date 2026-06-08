import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, ClipboardList, Smartphone, FileText, CheckCircle2 } from 'lucide-react';
import { hoverScale, tapScale } from '../../utils/animations';

interface DocenteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocenteUploadModal = ({ isOpen, onClose }: DocenteUploadModalProps) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'draft' | 'scan'>('upload');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-800 tracking-tight text-lg">Nueva Evidencia</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestión documental docente</p>
                </div>
              </div>
              <motion.button
                whileHover={hoverScale}
                whileTap={tapScale}
                onClick={onClose}
                className="h-10 w-10 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-6 border-b border-slate-100 pb-4">
                <motion.button
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'upload' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'bg-slate-50 border border-transparent text-slate-500 hover:bg-slate-100'}`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Subir archivo</span>
                </motion.button>
                <motion.button
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  onClick={() => setActiveTab('draft')}
                  className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'draft' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-slate-50 border border-transparent text-slate-500 hover:bg-slate-100'}`}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Preparar borrador</span>
                </motion.button>
                <motion.button
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  onClick={() => setActiveTab('scan')}
                  className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'scan' ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-slate-50 border border-transparent text-slate-500 hover:bg-slate-100'}`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Escanear</span>
                </motion.button>
              </div>

              {/* Tab content with horizontal slide animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  {activeTab === 'scan' ? (
                    <div className="py-8 text-center bg-amber-50 rounded-xl border border-amber-100">
                      <Smartphone className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                      <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Escaneo Móvil</h3>
                      <p className="text-xs text-amber-700 mt-2 max-w-sm mx-auto">
                        Por favor, abre la aplicación móvil institucional en tu teléfono para escanear y enviar documentos directamente a esta tarea.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Documento</label>
                          <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300">
                            <option>Académico</option>
                            <option>Título / Certificado</option>
                            <option>Informe</option>
                            <option>Acta</option>
                            <option>Otro</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Período</label>
                          <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300">
                            <option>2025</option>
                            <option>2024</option>
                            <option>2023</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre del documento</label>
                        <input type="text" placeholder="Ej: Certificado de capacitación pedagogía" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descripción (Opcional)</label>
                        <textarea placeholder="Detalles extra del documento..." rows={3} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"></textarea>
                      </div>

                      {activeTab === 'upload' && (
                        <div className="mt-4 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer">
                          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700">Arrastra tu archivo aquí o haz clic para explorar</p>
                          <p className="text-xs text-slate-500 mt-1">Soporta PDF, DOCX, JPG (Max 10MB)</p>
                        </div>
                      )}
                      
                      {activeTab === 'draft' && (
                        <div className="mt-4 border border-emerald-200 bg-emerald-50 rounded-xl p-6 text-center">
                          <ClipboardList className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm font-bold text-emerald-800">Prepara un documento institucional estructurado.</p>
                          <p className="text-xs text-emerald-600 mt-1">Completa manualmente el contenido con los datos de la asignatura o periodo seleccionado antes de subirlo.</p>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <motion.button
                whileHover={hoverScale}
                whileTap={tapScale}
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-600 hover:border-slate-300 transition-all"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={tapScale}
                onClick={onClose}
                disabled={activeTab === 'scan'}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {activeTab === 'draft' ? (
                  <><ClipboardList className="w-4 h-4" /> Guardar borrador</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Finalizar</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
