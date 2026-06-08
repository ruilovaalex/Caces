import React from 'react';

interface IndicatorContentProps {
  children: React.ReactNode;
  className?: string;
}

export const IndicatorContent = ({ children, className = '' }: IndicatorContentProps) => {
  return (
    <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
};
