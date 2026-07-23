import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info';
interface ToastMessage { id: string; message: string; tone: ToastTone }
interface ToastContextValue { showToast: (message: string, tone?: ToastTone) => void }
const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const remove = useCallback((id: string) => setToasts(current => current.filter(toast => toast.id !== id)), []);
  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = crypto.randomUUID();
    setToasts(current => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => remove(id), 4000);
  }, [remove]);
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[250] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {toasts.map(toast => {
          const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? TriangleAlert : Info;
          return (
            <div key={toast.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 shadow-lg">
              <Icon className={`h-5 w-5 shrink-0 ${toast.tone === 'success' ? 'text-emerald-600' : toast.tone === 'error' ? 'text-rose-600' : 'text-blue-600'}`} />
              <span className="flex-1">{toast.message}</span>
              <button onClick={() => remove(toast.id)} aria-label="Cerrar notificación" className="rounded-md p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
};
