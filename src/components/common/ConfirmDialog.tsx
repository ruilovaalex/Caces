import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
}

interface ConfirmDialogProps extends ConfirmDialogOptions {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = ({ isOpen, title, description, confirmLabel = 'Confirmar', tone = 'danger', onCancel, onConfirm }: ConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title} zIndex={220}>
    <div className="space-y-6 p-5 sm:p-6">
      <p className="text-sm leading-6 text-slate-600">{description}</p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  </Modal>
);
