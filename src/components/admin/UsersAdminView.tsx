import React, { useCallback, useEffect, useState } from 'react';
import { KeyRound, Loader2, UserPlus } from 'lucide-react';
import { UserRole } from '../../types';
import { describeError } from '../../services/api/apiClient';
import { ManagedUser, UsersApi } from '../../services/api/cacesApi';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'COORDINADOR', label: 'Coordinador' },
  { value: 'EVALUADOR', label: 'Evaluador' },
  { value: 'DOCENTE', label: 'Docente' },
];

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563eb]';
const label = 'text-[10px] font-black uppercase tracking-widest text-slate-500';

interface UsersAdminViewProps {
  currentUserId?: string;
}

export const UsersAdminView = ({ currentUserId }: UsersAdminViewProps) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: 'DOCENTE' as UserRole, password: '' });
  const [isCreating, setIsCreating] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(await UsersApi.list());
    } catch (loadError) {
      setError(describeError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (id: string, action: () => Promise<unknown>, success: string) => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      await load();
    } catch (actionError) {
      setError(describeError(actionError));
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);
    setError(null);
    setNotice(null);
    try {
      await UsersApi.create({ ...form, name: form.name.trim(), email: form.email.trim() });
      setForm({ name: '', email: '', role: 'DOCENTE', password: '' });
      setNotice('Usuario creado. Comunica la contraseña inicial por un canal seguro.');
      await load();
    } catch (createError) {
      setError(describeError(createError));
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = async (event: React.FormEvent, id: string) => {
    event.preventDefault();
    await run(id, () => UsersApi.update(id, { password: resetPassword }), 'Contraseña restablecida.');
    setResetTarget(null);
    setResetPassword('');
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6" aria-labelledby="users-title">
      <header>
        <h1 id="users-title" className="text-xl font-black text-[#1e2d4a]">Usuarios y roles</h1>
        <p className="text-sm text-slate-500">Solo el administrador crea cuentas, cambia roles, desactiva usuarios y restablece contraseñas.</p>
      </header>

      <div aria-live="polite" className="space-y-2">
        {error && <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</p>}
        {notice && <p role="status" className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{notice}</p>}
      </div>

      <form onSubmit={handleCreate} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="space-y-1">
          <label htmlFor="new-user-name" className={label}>Nombre</label>
          <input id="new-user-name" required minLength={2} maxLength={120} className={field} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label htmlFor="new-user-email" className={label}>Correo</label>
          <input id="new-user-email" type="email" required maxLength={200} className={field} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label htmlFor="new-user-role" className={label}>Rol</label>
          <select id="new-user-role" className={field} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as UserRole })}>
            {ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="new-user-password" className={label}>Contraseña inicial (mín. 12 caracteres)</label>
          <input id="new-user-password" type="password" autoComplete="new-password" required minLength={12} maxLength={200} className={field} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" disabled={isCreating} className="flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-60">
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
          Crear
        </button>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Usuarios del sistema</caption>
          <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">Usuario</th>
              <th scope="col" className="px-4 py-3">Rol</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Cargando usuarios...</td></tr>
            )}
            {!isLoading && users.length === 0 && !error && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No hay usuarios.</td></tr>
            )}
            {users.map(user => {
              const isSelf = user.id === currentUserId;
              const isBusy = busyId === user.id;
              return (
                <tr key={user.id} className="border-b border-slate-50 align-top last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">{user.name}{isSelf && <span className="ml-2 text-[10px] font-black uppercase text-slate-400">(tu)</span>}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Rol de ${user.name}`}
                      className={field}
                      value={user.role}
                      disabled={isBusy || isSelf}
                      onChange={e => void run(user.id, () => UsersApi.update(user.id, { role: e.target.value as UserRole }), 'Rol actualizado.')}
                    >
                      {ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={user.active}
                      aria-label={`${user.active ? 'Desactivar' : 'Activar'} a ${user.name}`}
                      disabled={isBusy || isSelf}
                      onClick={() => void run(user.id, () => UsersApi.update(user.id, { active: !user.active }), user.active ? 'Usuario desactivado.' : 'Usuario activado.')}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 ${user.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {user.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {resetTarget === user.id ? (
                      <form onSubmit={event => void handleReset(event, user.id)} className="flex flex-wrap items-center gap-2">
                        <label htmlFor={`reset-${user.id}`} className="sr-only">Nueva contraseña de {user.name}</label>
                        <input id={`reset-${user.id}`} type="password" autoComplete="new-password" required minLength={12} maxLength={200} placeholder="Nueva contraseña" className={`${field} w-44`} value={resetPassword} onChange={e => setResetPassword(e.target.value)} />
                        <button type="submit" disabled={isBusy} className="rounded-xl bg-[#2563eb] px-3 py-2 text-xs font-black uppercase text-white disabled:opacity-60">Guardar</button>
                        <button type="button" onClick={() => { setResetTarget(null); setResetPassword(''); }} className="rounded-xl px-3 py-2 text-xs font-black uppercase text-slate-500 hover:bg-slate-100">Cancelar</button>
                      </form>
                    ) : (
                      <button type="button" onClick={() => { setResetTarget(user.id); setResetPassword(''); }} disabled={isBusy} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                        <KeyRound className="h-3.5 w-3.5" aria-hidden /> Restablecer clave
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && !isLoading && users.length === 0 && (
        <button type="button" onClick={() => void load()} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">Reintentar</button>
      )}
    </section>
  );
};
