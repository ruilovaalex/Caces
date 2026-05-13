import React from 'react';
import { Settings, CheckCircle2, ChevronRight, LayoutDashboard, FileText } from 'lucide-react';
import { Indicator, Template, GeneratedDoc } from '../../types';
import { TEMPLATES } from '../../data/templates';

interface AIMentorPanelProps {
  indicator: Indicator;
  selectedTemplate: string;
  isGenerating: boolean;
  aiResponse: string;
  canWrite: boolean;
  onTemplateSelect: (id: string) => void;
  onGenerateAI: (autoSave: boolean) => void;
  onSaveGuide: () => void;
  onExportPDF: (doc: GeneratedDoc) => void;
}

export const AIMentorPanel = ({
  indicator,
  selectedTemplate,
  isGenerating,
  aiResponse,
  canWrite,
  onTemplateSelect,
  onGenerateAI,
  onSaveGuide,
  onExportPDF
}: AIMentorPanelProps) => {
  return (
    <div className="indicator-card p-8 pb-4">
      <div className="flex items-center gap-4 mb-4">
        <span className="flex items-center gap-2 text-amber-500">
          <Settings className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Plantillas Sugeridas</span>
        </span>
        <div className="flex gap-2">
            {TEMPLATES.slice(0, 3).map(t => (
              <button 
                key={t.id}
                onClick={() => onTemplateSelect(t.id)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2 ${
                  selectedTemplate === t.id 
                  ? 'tree-item-active text-white border-blue-600 shadow-md' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mentor de Calidad IA</span>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-800">Guía para: {TEMPLATES.find(t => t.id === selectedTemplate)?.label}</h3>
                {!aiResponse && <span className="text-[10px] text-amber-500 font-bold">● Esperando Consulta</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
                onClick={() => onGenerateAI(false)}
                disabled={isGenerating || !canWrite}
                className={`flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black transition-all ${isGenerating ? 'animate-pulse opacity-50' : ''} ${!canWrite && 'opacity-30 cursor-not-allowed'}`}
            >
              <Settings className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? "Consultando..." : "Solicitar Guía IA"}
            </button>
            <button 
                onClick={onSaveGuide}
                disabled={!aiResponse || !canWrite}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:border-slate-800 rounded-xl text-[10px] font-black transition-all disabled:opacity-30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Guardar Guía
            </button>
            <button 
                onClick={() => {
                  const template = TEMPLATES.find(t => t.id === selectedTemplate);
                  if (template && aiResponse) {
                    onExportPDF({
                      id: 'temp',
                      indicatorCode: indicator.code,
                      templateId: template.id,
                      content: aiResponse,
                      timestamp: new Date().toLocaleString(),
                      label: `GUIA_${indicator.code}_2025`
                    });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black hover:bg-slate-50 transition-all text-nowrap"
            >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Exportar PDF
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};
