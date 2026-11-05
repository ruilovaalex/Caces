import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { NotificationService } from '../services/notificationService';
import { isApiMode } from '../services/api/apiClient';
import { NotificationApi } from '../services/api/cacesApi';

const POLL_INTERVAL_MS = 30_000;

// En modo servidor cada usuario recibe solo sus notificaciones y solo puede marcar o borrar las suyas.
export const useNotifications = (enabled = true) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const refresh = useCallback(async () => {
    if (!isApiMode) {
      setNotifications(NotificationService.getAll());
      return;
    }
    if (!enabled) {
      setNotifications([]);
      return;
    }
    try {
      setNotifications(await NotificationApi.list());
    } catch (error) {
      console.error(error);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
    if (!isApiMode || !enabled) return;
    // Consulta periodica para que las notificaciones lleguen sin recargar la pagina.
    const timer = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [enabled, refresh]);

  const markAsRead = async (id: string) => {
    if (isApiMode) await NotificationApi.markRead(id).catch(console.error);
    else NotificationService.markAsRead(id);
    await refresh();
  };

  const clearAll = async () => {
    if (isApiMode) await NotificationApi.clearMine().catch(console.error);
    else NotificationService.clearAll();
    await refresh();
  };

  const remove = async (id: string) => {
    if (isApiMode) await NotificationApi.remove(id).catch(console.error);
    else NotificationService.remove(id);
    await refresh();
  };

  const toggleShow = () => setShowNotifications(prev => !prev);

  return {
    notifications,
    showNotifications,
    markAsRead,
    clearAll,
    remove,
    toggleShow,
    refreshNotifications: refresh
  };
};
