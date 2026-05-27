import React from 'react';

interface TopBarProps {
  children: React.ReactNode;
  className?: string;
}

export const TopBar = ({ children, className = '' }: TopBarProps) => {
  return (
    <header className={`h-20 bg-[#1e2d4a] border-b border-white/10 flex items-center justify-between px-8 z-10 shrink-0 text-white shadow-[0_12px_30px_-24px_rgba(15,23,42,0.8)] ${className}`}>
      {children}
    </header>
  );
};
