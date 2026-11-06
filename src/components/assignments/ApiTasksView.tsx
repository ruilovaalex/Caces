import React, { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Loader2, Send, Trash2 } from 'lucide-react';
import { UserRole } from '../../types';
import { describeError } from '../../services/api/apiClient';
import { TaskStatus, TasksApi, TeacherTask } from '../../services/api/cacesApi';

interface ApiTasksViewProps {
  userRole: UserRole;
  periodCode: string;
  periodLabel?: string;
  indicators: { code: string; name: string }[];
}

const STATUS_LABEL: Record<TaskStatus, string> = { NUEVA: 'Nueva', EN_PROGRESO: 'En progreso', ENTREGADA: 'Entregada' };
const NEXT_STATUS: Partial<Record<TaskStatus, { status: TaskStatus; label: string }>> = {
  NUEVA: { status: 'EN_PROGRESO', label: 'Iniciar' },
  EN_PROGRESO: { status: 'ENTREGADA', label: 'Marcar entregada' },
};
const STATUS_STYLE: Record<TaskStatus, string> = {
  NUEVA: 'bg-slate-100 text-slate-600',
  EN_PROGRESO: 'bg-amber-100 text-amber-700',
  ENTREGADA: 'bg-emerald-100 text-emerald-700',
};

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563eb]';
const label = 'text-[10px] font-black uppercase tracking-widest text-slate-500';

// Tareas docentes guardadas en el servidor: el coordinador las asigna y el docente avanza las suyas.
export const ApiTasksView = ({ userRole, periodCode, periodLabel, indicators }: ApiTasksViewProps) => {
  const isCoordinator = userRole === 'COORDINADOR';
  const [tasks, setTasks] = useState<TeacherTask[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ assigneeId: '', indicatorCode: indicators[0]?.code ?? '', title: '', evidenceLabel: '', dueDate: '' });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedTasks, loadedTeachers] = await Promise.all([
        TasksApi.list(periodCode),
        isCoordinator ? TasksApi.teachers() : Promise.resolve([]),
      ]);
      setTasks(loadedTasks);
      setTeachers(loadedTeachers);
      setForm(current => ({ ...current, assigneeId: current.assigneeId || loadedTeachers[0]?.id || '' }));
    } catch (loadError) {
      setError(describeError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [periodCode, isCoordinator]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await TasksApi.create(periodCode, { ...form, title: form.title.trim(), evidenceLabel: form.evidenceLabel.trim() });
      setForm(current => ({ ...current, title: '', evidenceLabel: '', dueDate: '' }));
      await load();
    } catch (createError) {
      setError(describeError(createError));
    } finally {
      setIsSaving(false);
    }
  };

  const run = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await load();
    } catch (actionError) {
      setError(describeError(actionError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6" aria-labelledby="tasks-title">
      <header className="flex items-center gap-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700"><ClipboardList className="h-5 w-5" aria-hidden /></div>
        <div>
          <h1 id="tasks-title" className="text-xl font-black text-[#1e2d4a]">{isCoordinator ? 'Docentes y tareas' : 'Mis actividades'}</h1>
          <p className="text-sm text-slate-500">
            {periodLabel ? `Periodo ${periodLabel}. ` : ''}
            {isCoordinator ? 'Asigna tareas a docentes activos; las cuentas de docente las crea el administrador.' : 'Tareas que el coordinador te asigno.'}
          </p>
        </div>
      </header>

      <div aria-live="polite">
        {error && (
          <p role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
            {error}
            <button type="button" onClick={() => void load()} className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-black uppercase">Reintentar</button>
          </p>
        )}
      </div>

      {isCoordinator && (
        <form onSubmit={handleCreate} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="task-teacher" className={label}>Docente</label>
            <select id="task-teacher" required className={field} value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
              {teachers.length === 0 && <option value="">No hay docentes activos</option>}
              {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name} - {teacher.email}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="task-indicator" className={label}>Indicador</label>
            <select id="task-indicator" required className={field} value={form.indicatorCode} onChange={e => setForm({ ...form, indicatorCode: e.target.value })}>
              {indicators.map(indicator => <option key={indicator.code} value={indicator.code}>{indicator.code} - {indicator.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="task-due" className={label}>Fecha limite</label>
            <input id="task-due" type="date" required className={field} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label htmlFor="task-title" className={label}>Titulo</label>
            <input id="task-title" required minLength={2} maxLength={200} className={field} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label htmlFor="task-evidence" className={label}>Evidencia solicitada</label>
            <input id="task-evidence" required minLength={2} maxLength={300} className={field} value={form.evidenceLabel} onChange={e => setForm({ ...form, evidenceLabel: e.target.value })} />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={isSaving || teachers.length === 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-60">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              Asignar tarea
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-3" aria-busy={isLoading}>
        {isLoading && <li className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">Cargando tareas...</li>}
        {!isLoading && !error && tasks.length === 0 && (
          <li className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            {isCoordinator ? 'Aun no hay tareas en este periodo.' : 'No tienes tareas asignadas en este periodo.'}
          </li>
        )}
        {tasks.map(task => {
          const next = NEXT_STATUS[task.status];
          const isBusy = busyId === task.id;
          return (
            <li key={task.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="min-w-0 space-y-1">
                <p className="font-black text-slate-800">{task.title}</p>
                <p className="text-xs text-slate-500">
                  {isCoordinator && <>{task.assigneeName} - </>}Indicador {task.indicatorCode} - {task.evidenceLabel}
                </p>
                <p className="text-xs font-bold text-slate-500">Entrega: {task.dueDate}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${STATUS_STYLE[task.status]}`}>{STATUS_LABEL[task.status]}</span>
                {!isCoordinator && next && (
                  <button type="button" disabled={isBusy} onClick={() => void run(task.id, () => TasksApi.changeStatus(task.id, next.status))} className="rounded-xl bg-[#2563eb] px-3 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-60">
                    {next.label}
                  </button>
                )}
                {isCoordinator && (
                  <button
                    type="button"
                    disabled={isBusy}
                    aria-label={`Eliminar tarea ${task.title}`}
                    onClick={() => { if (window.confirm(`Eliminar la tarea "${task.title}"?`)) void run(task.id, () => TasksApi.remove(task.id)); }}
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
