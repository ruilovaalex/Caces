import React from 'react';

interface IndicatorProgressProps {
  progress: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const IndicatorProgress = ({ 
  progress, 
  label, 
  size = 'md', 
  showValue = true 
}: IndicatorProgressProps) => {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const getProgressColor = (val: number) => {
    if (val < 40) return 'bg-rose-500';
    if (val < 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="text-slate-400">{label}</span>
          {showValue && (
            <span className={progress < 40 ? 'text-rose-600' : progress < 70 ? 'text-amber-600' : 'text-emerald-600'}>
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div 
          className={`h-full transition-all duration-500 rounded-full ${getProgressColor(progress)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
