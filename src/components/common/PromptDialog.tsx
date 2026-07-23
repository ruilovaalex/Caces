import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { FormField, fieldClassName } from './FormField';

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  label: string;
  confirmLabel: string;
  multiline?: boolean;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}

export const PromptDialog = ({ isOpen, title, label, confirmLabel, multiline = false, onCancel, onConfirm }: PromptDialogProps) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setError('');
    }
  }, [isOpen]);

  const submit = () => {
    const normalized = value.trim();
    if (!normalized) {
      setError('Este campo es obligatorio.');
      return;
    }
    onConfirm(normalized);
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} zIndex={210}>
      <div className="space-y-5 p-5 sm:p-6">
        <FormField label={label} error={error} required>
          {multiline
            ? <textarea rows={4} value={value} onChange={event => setValue(event.target.value)} className={fieldClassName} />
            : <input value={value} onChange={event => setValue(event.target.value)} className={fieldClassName} />}
        </FormField>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={submit}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
};
