import { Status } from '../../types';
import { getStatusColor } from '../../utils/statusUtils';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { pulseObserved } from '../../utils/animations';

export const EvidenceStatusBadge = ({ status }: { status: Status }) => {
  return (
    <motion.span 
      variants={status === 'Observado' ? pulseObserved : {}}
      animate="animate"
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(status)}`}
    >
      {status === 'Cargado' && <CheckCircle2 className="h-3 w-3" />}
      {status}
    </motion.span>
  );
};
