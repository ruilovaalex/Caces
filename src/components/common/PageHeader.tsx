import React from 'react';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: string[];
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, description, breadcrumbs = [], actions }: PageHeaderProps) => (
  <header className="space-y-3">
    {breadcrumbs.length > 0 && (
      <nav aria-label="Ruta de navegación">
        <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-slate-500">
          {breadcrumbs.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
              <span aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}>{item}</span>
            </li>
          ))}
        </ol>
      </nav>
    )}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  </header>
);
