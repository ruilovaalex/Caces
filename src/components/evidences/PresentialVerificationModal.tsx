import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { PresentialVerification, Requirement, VerificationResult } from '../../types';

interface PresentialVerificationModalProps {
  isOpen: boolean;
  requirement: Requirement | null;
  history: PresentialVerification[];
  onClose: () => void;
  onSave: (result: VerificationResult, notes: string) => void;
}

const RESULT_OPTIONS: { value: VerificationResult; label: string; hint: string; icon: typeof CheckCircle2; active: string }[] = [
  {
    value: 'Verificada',
    label: 'Verificada',
    hint: 'Lo constatado respalda la evidencia.',
    icon: CheckCircle2,
    active: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'Con observaciones',
    label: 'Con observaciones',
    hint: 'Hay aspectos que corregir. Se notificara al coordinador.',
    icon: AlertTriangle,
    active: 'border-amber-300 bg-amber-50 text-amber-700',
  },
];

export const PresentialVerificationModal = ({
  isOpen,
  requirement,
  history,
  onClose,
  onSave,
}: PresentialVerificationModalProps) => {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setResult(null);
    setNotes('');
  }, [isOpen, requirement?.id]);

  if (!requirement) return null;

  const canSave = Boolean(result) && notes.trim().length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar verificacion">
      <div className="p-8 border-t border-slate-50 space-y-6">
        <p className="text-slate-400 text-sm font-medium -mt-4">{requirement.label}</p>

        {history.length > 0 && (
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
            Ultimo registro: {history[0].result} por {history[0].verifiedBy} el {new Date(history[0].verifiedAt).toLocaleString()}.
            El nuevo registro se agregara al historial.
          </p>
        )}

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resultado</label>
          <div className="grid gap-3 sm:grid-cols-2">
            {RESULT_OPTIONS.map(option => {
              const Icon = option.icon;
              const isActive = result === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setResult(option.value)}
                  className={`rounded-2xl border p-4 text-left transition-all ${isActive ? option.active : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'}`}
                >
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">{option.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Que se comprobo</label>
          <textarea
            value={notes}
            onChange={event => setNotes(event.target.value)}
            placeholder="Ej: Se entrevisto al responsable de planificacion y a dos coordinadores de carrera..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none min-h-[120px] resize-none"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            disabled={!canSave}
            onClick={() => result && onSave(result, notes.trim())}
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 text-nowrap"
          >
            Guardar resultado
          </button>
        </div>
      </div>
    </Modal>
  );
};
