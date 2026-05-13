import { Notification } from '../types';

const STORAGE_KEY = 'edusudamericano_notifications_v1';

export const NotificationService = {
  getAll: (): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  add: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): void => {
    const all = NotificationService.getAll();
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      isRead: false
    };
    all.unshift(newNotification); // Newest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  markAsRead: (id: string): void => {
    const all = NotificationService.getAll();
    const index = all.findIndex(n => n.id === id);
    if (index !== -1) {
      all[index].isRead = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  },

  clearAll: (): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};
