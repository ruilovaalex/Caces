import React from 'react';

interface TopBarProps {
  children: React.ReactNode;
  className?: string;
}

export const TopBar = ({ children, className = '' }: TopBarProps) => {
  return (
    <header className={`h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0 ${className}`}>
      {children}
    </header>
  );
};
