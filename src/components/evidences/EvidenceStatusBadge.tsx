import { Status } from '../../types';
import { getStatusColor } from '../../utils/statusUtils';

export const EvidenceStatusBadge = ({ status }: { status: Status }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};
