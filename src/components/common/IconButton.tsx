import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const IconButton = ({ label, className = '', children, ...props }: IconButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);
