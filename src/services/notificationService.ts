import { Notification } from '../types';
import { StorageService } from './storageService';

const STORAGE_KEY = 'edusudamericano_notifications_v2';

export const NotificationService = {
  getAll: (): Notification[] => {
    return StorageService.get<Notification[]>(STORAGE_KEY) || [];
  },

  add: (notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): void => {
    const all = NotificationService.getAll();
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      isRead: false
    };
    all.unshift(newNotif);
    StorageService.set(STORAGE_KEY, all);
  },

  markAsRead: (id: string): void => {
    const all = NotificationService.getAll();
    const updated = all.map(n => n.id === id ? { ...n, isRead: true } : n);
    StorageService.set(STORAGE_KEY, updated);
  },

  clearAll: (): void => {
    StorageService.set(STORAGE_KEY, []);
  }
};
