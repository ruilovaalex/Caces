import { Status } from '../types';

export const getStatusColor = (status: Status) => {
  switch (status) {
    case 'Pendiente': return 'bg-amber-50 text-[#d97706] border-amber-100';
    case 'Cargado': return 'bg-blue-50 text-[#2563eb] border-blue-100';
    case 'Validado': return 'bg-green-50 text-[#15803d] border-green-100';
    case 'Observado': return 'bg-red-50 text-[#dc2626] border-red-100';
    case 'Rechazado': return 'bg-red-50 text-[#dc2626] border-red-100';
    default: return 'bg-slate-50 text-slate-400';
  }
};

export const getStatusLabel = (status: Status) => status;
