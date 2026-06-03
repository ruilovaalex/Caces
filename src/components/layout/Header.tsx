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
        : userRole === 'DOCENTE'
          ? 'Docente Adjunto'
          : 'Evaluacion Externa';

  return (
    <TopBar>
      <div className="flex min-w-0 items-center gap-3">
        <h2 className="truncate text-lg font-black text-white tracking-tight">Repositorio CACES 2025</h2>
        <div className="h-5 w-px bg-white/15" />
        <div className="flex h-7 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3">
          <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
          <span className="whitespace-nowrap text-[9px] font-black text-[#aac4e8] uppercase tracking-widest">
            {userRole === 'EVALUADOR'
              ? 'Modo de revision activa'
              : userRole === 'ADMIN'
                  ? 'Gestion de roles'
                  : 'Gestion de acreditacion'}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
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
