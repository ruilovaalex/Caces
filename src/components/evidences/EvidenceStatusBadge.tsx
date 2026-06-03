import { Status } from '../../types';
import { getStatusColor } from '../../utils/statusUtils';
import { motion } from 'motion/react';
import { pulseObserved } from '../../utils/animations';

export const EvidenceStatusBadge = ({ status }: { status: Status }) => {
  return (
    <motion.span 
      variants={status === 'Observado' ? pulseObserved : {}}
      animate="animate"
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border inline-block ${getStatusColor(status)}`}
    >
      {status}
    </motion.span>
  );
};
