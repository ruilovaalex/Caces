import { Status } from '../types';

export const getStatusColor = (status: Status) => {
  switch (status) {
    case 'Pendiente': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'Cargado': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Validado': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Observado': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Rechazado': return 'bg-rose-100 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-400';
  }
};

export const getStatusLabel = (status: Status) => status;
