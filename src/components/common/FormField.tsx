import React, { useId } from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>;
  description?: string;
  error?: string;
  required?: boolean;
}

export const FormField = ({ label, children, description, error, required = false }: FormFieldProps) => {
  const generatedId = useId();
  const fieldId = children.props.id || generatedId;
  const helpId = `${fieldId}-help`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-semibold text-slate-700">
        {label}{required && <span className="ml-1 text-rose-600" aria-hidden="true">*</span>}
      </label>
      {React.cloneElement(children, {
        id: fieldId,
        'aria-describedby': description || error ? helpId : undefined,
        'aria-invalid': Boolean(error),
      })}
      {(description || error) && (
        <p id={helpId} className={`text-xs ${error ? 'text-rose-700' : 'text-slate-500'}`} role={error ? 'alert' : undefined}>
          {error || description}
        </p>
      )}
    </div>
  );
};

export const fieldClassName =
  'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100';
