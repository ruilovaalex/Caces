import { UserRole } from './auth.types';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  link?: string;
  // Sin destinatario la notificacion es visible para todos los perfiles (comportamiento previo).
  targetRole?: UserRole;
}
