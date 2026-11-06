import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { describeError } from '../../services/api/apiClient';
import { AuthApi } from '../../services/api/cacesApi';

const MIN_LENGTH = 12;
const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563eb]';
const label = 'text-[10px] font-black uppercase tracking-widest text-slate-500';

// Cambio de la propia contraseña (modo servidor). El servidor vuelve a comprobar la clave actual y la longitud mínima.
export const ChangePasswordModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const close = () => {
    setCurrent(''); setNext(''); setConfirm(''); setError(null); setDone(false);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (next.length < MIN_LENGTH) return setError(`La nueva contraseña debe tener al menos ${MIN_LENGTH} caracteres.`);
    if (next !== confirm) return setError('Las contraseñas nuevas no coinciden.');
    if (next === current) return setError('La nueva contraseña debe ser distinta de la actual.');
    setIsSaving(true);
    try {
      await AuthApi.changePassword(current, next);
      setDone(true);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (saveError) {
      setError(describeError(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Cambiar contraseña" maxWidth="max-w-md">
      {done ? (
        <div className="space-y-4 p-6">
          <p role="status" className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            Contraseña actualizada. Úsala la próxima vez que inicies sesión.
          </p>
          <button type="button" onClick={close} className="w-full rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700">
            Listo
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="space-y-1">
            <label htmlFor="current-password" className={label}>Contraseña actual</label>
            <input id="current-password" type="password" autoComplete="current-password" required className={field} value={current} onChange={e => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label htmlFor="new-password" className={label}>Nueva contraseña (mín. {MIN_LENGTH} caracteres)</label>
            <input id="new-password" type="password" autoComplete="new-password" required minLength={MIN_LENGTH} maxLength={200} className={field} value={next} onChange={e => setNext(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label htmlFor="confirm-password" className={label}>Repite la nueva contraseña</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required minLength={MIN_LENGTH} maxLength={200} className={field} value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {error && (
            <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">{error}</p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={close} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-60">
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
