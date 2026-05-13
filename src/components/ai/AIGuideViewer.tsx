import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, FileText, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { Indicator } from '../../types';

interface AIGuideViewerProps {
  indicator: Indicator | null;
  aiResponse: string;
  onClose: () => void;
  onCopy: () => void;
}

export const AIGuideViewer = ({
  indicator,
  aiResponse,
  onClose,
  onCopy
}: AIGuideViewerProps) => {
  return (
    <AnimatePresence>
      {aiResponse && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mt-8 bg-blue-600 rounded-[40px] p-1 shadow-2xl relative"
        >
          <div className="bg-white rounded-[38px] overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-blue-50/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Guía Maestra de la IA</h3>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Generado según Modelo CACES 2024/2025</p>
                </div>
              </div>
              <div className="flex gap-2">
                  <button 
                  onClick={() => {
                    const blob = new Blob([aiResponse], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Guia_Requerimiento_${indicator?.code || 'Doc'}.md`;
                    a.click();
                  }}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Exportar MD
                </button>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-10 max-h-[600px] overflow-y-auto custom-scrollbar prose prose-slate prose-sm max-w-none">
              <div className="markdown-body text-slate-700 leading-loose">
                <Markdown>{aiResponse}</Markdown>
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-md">
                Esta guía es referencial basada en el modelo de evaluación de Institutos Superiores. Verifique la coherencia con su plan operativo.
              </p>
              <button 
                onClick={onCopy}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                Copiar Contenido Integral
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
