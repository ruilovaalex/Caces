import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { NotificationService } from '../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const refresh = useCallback(() => {
    setNotifications(NotificationService.getAll());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markAsRead = (id: string) => {
    NotificationService.markAsRead(id);
    refresh();
  };

  const clearAll = () => {
    NotificationService.clearAll();
    refresh();
  };

  const toggleShow = () => setShowNotifications(prev => !prev);

  return {
    notifications,
    showNotifications,
    markAsRead,
    clearAll,
    toggleShow,
    refreshNotifications: refresh
  };
};
