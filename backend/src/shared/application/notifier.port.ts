import { Role } from '../domain/actor';

export type NotificationKind = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface OutgoingNotification {
  title: string;
  message: string;
  type: NotificationKind;
  link?: string;
}

// Puerto para que cualquier modulo envie notificaciones a destinatarios concretos.
export interface Notifier {
  toUsers(userIds: string[], notification: OutgoingNotification): Promise<void>;
  toRoles(roles: Role[], notification: OutgoingNotification, options?: { excludeUserId?: string }): Promise<void>;
}

export const NOTIFIER = Symbol('Notifier');
