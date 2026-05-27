import React, { useMemo } from 'react';
import { CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { YearPeriod, Indicator } from '../../types';

interface ChecklistViewProps {
  mockData: YearPeriod[];
  onIndicatorSelect: (ind: Indicator) => void;
  onBackToDashboard: () => void;
}

export const ChecklistView = ({
  mockData,
  onIndicatorSelect,
  onBackToDashboard
}: ChecklistViewProps) => {
  const indicators = useMemo(
    () => mockData[0].criteria.flatMap(criterion =>
      criterion.subCriteria.flatMap(subCriterion =>
        subCriterion.indicators.map(indicator => ({
          ...indicator,
          criterionName: criterion.name,
          subCriterionName: subCriterion.name
        }))
      )
    ),
    [mockData]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Mapa de indicadores</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Escoge un indicador para preparar o revisar evidencias
          </p>
        </div>
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
        >
          Volver
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Indicador</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicacion</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Evidencias</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Abrir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {indicators.map(indicator => (
              <tr key={indicator.code} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-black">
                      {indicator.code}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 line-clamp-1">{indicator.name}</p>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-1">{indicator.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <p className="text-xs font-bold text-slate-500 line-clamp-1">{indicator.criterionName}</p>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-1">{indicator.subCriterionName}</p>
                </td>
                <td className="px-6 py-5 text-center align-top">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                    <FileText className="h-3.5 w-3.5" />
                    {indicator.requirements.length}
                  </div>
                </td>
                <td className="px-6 py-5 text-center align-top">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${indicator.status === 'Validado' ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${indicator.status === 'Validado' ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {indicator.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right align-top">
                  <button
                    onClick={() => onIndicatorSelect(indicator)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-700 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Abrir
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
