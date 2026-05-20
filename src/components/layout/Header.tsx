import React from 'react';
import { TopBar } from './TopBar';
import { UserPanel } from './UserPanel';
import { NotificationBell } from './NotificationBell';
import { Notification, UserRole } from '../../types';

interface HeaderProps {
  onLogout: () => void;
  notifications: Notification[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
  userName?: string;
  userRole?: UserRole;
}

export const Header = ({
  onLogout,
  notifications,
  showNotifications,
  onToggleNotifications,
  onMarkAsRead,
  onClearAllNotifications,
  userName = 'Usuario',
  userRole = 'ADMIN'
}: HeaderProps) => {
  const roleLabel =
    userRole === 'ADMIN'
      ? 'Administrador'
      : userRole === 'COORDINADOR'
        ? 'Coordinacion Academica'
        : 'Evaluacion Externa';

  return (
    <TopBar>
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Gestion de Evidencias 2025</h2>
        <div className="h-6 w-[1px] bg-slate-200 mx-2" />
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
            {userRole === 'EVALUADOR' ? 'Modo de revision activa' : 'En proceso de acreditacion'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell
          notifications={notifications}
          showNotifications={showNotifications}
          onToggle={onToggleNotifications}
          onMarkAsRead={onMarkAsRead}
          onClearAll={onClearAllNotifications}
        />

        <UserPanel
          onLogout={onLogout}
          userName={userName}
          userRole={roleLabel}
        />
      </div>
    </TopBar>
  );
};
