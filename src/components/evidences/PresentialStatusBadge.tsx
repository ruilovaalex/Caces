import { PresentialStatus } from '../../types';

const STATUS_STYLES: Record<PresentialStatus, string> = {
  'Pendiente de verificacion': 'bg-amber-50 text-[#d97706] border-amber-100',
  Verificada: 'bg-green-50 text-[#15803d] border-green-100',
  'Con observaciones': 'bg-red-50 text-[#dc2626] border-red-100',
};

export const PresentialStatusBadge = ({ status }: { status: PresentialStatus }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_STYLES[status]}`}>
    {status}
  </span>
);
