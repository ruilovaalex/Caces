import React from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../../types';

interface NotificationBellProps {
  notifications: Notification[];
  showNotifications: boolean;
  onToggle: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationBell = ({
  notifications,
  showNotifications,
  onToggle,
  onMarkAsRead,
  onClearAll
}: NotificationBellProps) => {
  return (
    <div className="relative">
      <button 
        onClick={onToggle}
        className={`p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative ${showNotifications ? 'bg-slate-100 text-blue-600' : 'text-slate-500'}`}
      >
        <Bell className="w-5 h-5" />
        {notifications.some(n => !n.isRead) && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
          >
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notificaciones</span>
              <button 
                onClick={onClearAll}
                className="text-[9px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
              >
                Limpiar todo
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => onMarkAsRead(n.id)}
                    className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors relative ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    {!n.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full" />}
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        n.type === 'success' ? 'bg-emerald-500' : 
                        n.type === 'warning' ? 'bg-amber-500' : 
                        n.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
                      }`} />
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-800 leading-tight">{n.title}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{n.message}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{n.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center space-y-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No hay notificaciones</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
