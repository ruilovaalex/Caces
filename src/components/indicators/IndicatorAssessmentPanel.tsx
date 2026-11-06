import React, { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import { Indicator, IndicatorAssessment, IndicatorRating } from '../../types';
import { INDICATOR_RATING_SCALE, QUANTITATIVE_INDICATOR_CODES } from '../../data/cacesEvaluationRules';

interface IndicatorAssessmentPanelProps {
  indicator: Indicator;
  history: IndicatorAssessment[];
  canAssess: boolean;
  documentalSummary: { validated: number; total: number };
  presentialSummary: { verified: number; total: number };
  onSave: (rating: IndicatorRating, achievements: string, deficiencies: string) => void;
}

const formatScore = (score: number) => score.toLocaleString('es-EC', { maximumFractionDigits: 2 });

export const IndicatorAssessmentPanel = ({
  indicator,
  history,
  canAssess,
  documentalSummary,
  presentialSummary,
  onSave,
}: IndicatorAssessmentPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState<IndicatorRating | null>(null);
  const [achievements, setAchievements] = useState('');
  const [deficiencies, setDeficiencies] = useState('');

  useEffect(() => {
    setIsEditing(false);
    setRating(null);
    setAchievements('');
    setDeficiencies('');
  }, [indicator.code, canAssess]);

  if (QUANTITATIVE_INDICATOR_CODES.has(indicator.code)) {
    return (
      <section className="border-b border-slate-200 bg-white px-6 py-4">
        <p className="text-xs text-slate-500">
          <span className="font-black text-slate-700">Indicador cuantitativo.</span>{' '}
          Su resultado se obtiene con la fórmula de cálculo del modelo; no se registra valoración cualitativa.
        </p>
      </section>
    );
  }

  const current = history[0];
  const currentScale = current ? INDICATOR_RATING_SCALE.find(item => item.value === current.rating) : undefined;
  // El modelo pide sustentar con logros y deficiencias; solo "Satisfactorio" puede no tener deficiencias.
  const needsDeficiencies = rating !== null && rating !== 'SATISFACTORIO';
  const canSave = rating !== null && achievements.trim().length > 0 && (!needsDeficiencies || deficiencies.trim().length > 0);

  const handleSave = () => {
    if (!rating || !canSave) return;
    onSave(rating, achievements.trim(), deficiencies.trim());
    setIsEditing(false);
    setRating(null);
    setAchievements('');
    setDeficiencies('');
  };

  return (
    <section className="border-b border-slate-200 bg-white px-6 py-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Scale className="mt-0.5 h-5 w-5 text-slate-500" />
          <div>
            <h3 className="text-base font-black text-slate-900">Valoración del indicador</h3>
            <p className="mt-1 text-xs text-slate-500">
              Referencia para el evaluador: {documentalSummary.validated} de {documentalSummary.total} evidencias documentales validadas
              {presentialSummary.total > 0 && ` · ${presentialSummary.verified} de ${presentialSummary.total} verificaciones presenciales`}.
              La valoración no se calcula a partir de estos datos.
            </p>
          </div>
        </div>
        {canAssess && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800"
          >
            {current ? 'Registrar nueva valoración' : 'Valorar indicador'}
          </button>
        )}
      </div>

      {current && currentScale ? (
        <div className="mt-4 rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-slate-800">{currentScale.label}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">
              {formatScore(current.score)}
            </span>
            <span className="text-[10px] text-slate-400">
              {current.assessedBy} · {new Date(current.assessedAt).toLocaleString()}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-600"><span className="font-black">Logros:</span> {current.achievements}</p>
          {current.deficiencies && (
            <p className="mt-1 text-xs text-slate-600"><span className="font-black">Deficiencias:</span> {current.deficiencies}</p>
          )}
          {history.length > 1 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-400">
                Valoraciones anteriores ({history.length - 1})
              </summary>
              <ul className="mt-2 space-y-1">
                {history.slice(1).map(item => (
                  <li key={item.id} className="text-xs text-slate-500">
                    {INDICATOR_RATING_SCALE.find(scale => scale.value === item.rating)?.label} ({formatScore(item.score)}) · {item.assessedBy} · {new Date(item.assessedAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      ) : (
        !isEditing && <p className="mt-4 text-xs font-bold text-slate-400">Sin valoración registrada.</p>
      )}

      {canAssess && isEditing && (
        <div className="mt-4 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {INDICATOR_RATING_SCALE.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRating(option.value)}
                className={`rounded-lg border p-3 text-left transition-all ${rating === option.value ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <span className="text-xs font-black text-slate-800">{option.label} ({formatScore(option.score)})</span>
                <span className="mt-1 block text-[11px] text-slate-500">{option.description}</span>
              </button>
            ))}
          </div>
          <textarea
            value={achievements}
            onChange={event => setAchievements(event.target.value)}
            placeholder="Logros identificados (obligatorio)"
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px] resize-none"
          />
          <textarea
            value={deficiencies}
            onChange={event => setDeficiencies(event.target.value)}
            placeholder={needsDeficiencies ? 'Deficiencias identificadas (obligatorio para esta valoración)' : 'Deficiencias identificadas (opcional)'}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px] resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-lg bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 border border-slate-200 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Guardar valoración
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
