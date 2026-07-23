import React from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

type Tone = 'info' | 'success' | 'warning' | 'danger';

const styles: Record<Tone, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
};

const icons = { info: Info, success: CheckCircle2, warning: TriangleAlert, danger: AlertCircle };

export const Badge = ({ children, tone = 'info' }: { children: React.ReactNode; tone?: Tone }) => (
  <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${styles[tone]}`}>{children}</span>
);

export const Alert = ({ title, children, tone = 'info' }: { title: string; children?: React.ReactNode; tone?: Tone }) => {
  const Icon = icons[tone];
  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${styles[tone]}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div><p className="font-semibold">{title}</p>{children && <div className="mt-1 text-sm">{children}</div>}</div>
    </div>
  );
};

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} aria-hidden="true" />
);
