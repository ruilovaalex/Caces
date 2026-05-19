import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, FileText, Wand2, Search, Info } from 'lucide-react';
import Markdown from 'react-markdown';

interface CoordinatorAIGuidePanelProps {
  isGenerating: boolean;
  aiResponse: string;
  onAction: (action: string) => void;
  onApplySuggestion?: (text: string) => void;
}

export const CoordinatorAIGuidePanel = ({
  isGenerating,
  aiResponse,
  onAction,
  onApplySuggestion
}: CoordinatorAIGuidePanelProps) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 shadow-inner">
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm tracking-tight text-blue-800">Guia IA del Coordinador</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asesoria Tecnica CACES</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Uso sugerido</p>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Pide una guia general para entender la evidencia. Luego usa la ayuda por seccion para redactar desde cero o mejorar el texto que ya escribiste.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAction('guia_general')}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all uppercase tracking-tight"
          >
            <Info className="w-3 h-3" />
            Guia General
          </button>
          <button
            onClick={() => onAction('revisar_borrador')}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all uppercase tracking-tight"
          >
            <Search className="w-3 h-3" />
            Revisar Borrador
          </button>
          <button
            onClick={() => onAction('mejorar_redaccion')}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all uppercase tracking-tight"
          >
            <Wand2 className="w-3 h-3" />
            Mejorar Redaccion
          </button>
          <button
            onClick={() => onAction('sugerir_nombre')}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all uppercase tracking-tight"
          >
            <FileText className="w-3 h-3" />
            Sugerir Nombre
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full space-y-4"
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-xl border-2 border-blue-600 border-t-transparent animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-blue-600 animate-pulse" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Analizando evidencia...</p>
            </motion.div>
          ) : aiResponse ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="prose prose-slate prose-sm max-w-none bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <Markdown>{aiResponse}</Markdown>
              </div>

              {onApplySuggestion && (
                <button
                  onClick={() => onApplySuggestion(aiResponse)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Insertar en el borrador
                </button>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50 grayscale">
              <Sparkles className="w-12 h-12 text-slate-300" />
              <div>
                <p className="text-sm font-bold text-slate-600">Necesitas ayuda tecnica?</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Usa los botones superiores para guiarte</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
