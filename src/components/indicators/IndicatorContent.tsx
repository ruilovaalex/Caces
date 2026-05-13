import React from 'react';

interface IndicatorContentProps {
  children: React.ReactNode;
  className?: string;
}

export const IndicatorContent = ({ children, className = '' }: IndicatorContentProps) => {
  return (
    <div className={`space-y-6 pb-12 ${className}`}>
      {children}
    </div>
  );
};
