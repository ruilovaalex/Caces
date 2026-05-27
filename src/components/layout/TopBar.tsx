import React from 'react';

interface TopBarProps {
  children: React.ReactNode;
  className?: string;
}

export const TopBar = ({ children, className = '' }: TopBarProps) => {
  return (
    <header className={`h-16 bg-[#1e2d4a] border-b border-white/10 flex items-center justify-between px-6 z-10 shrink-0 text-white shadow-sm ${className}`}>
      {children}
    </header>
  );
};
