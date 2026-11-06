import { Menu } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';
import { TopBar } from './TopBar';
import { UserPanel } from './UserPanel';
import { NotificationBell } from './NotificationBell';
import { ROLE_LABEL } from '../../utils/permissions';
import { Notification, UserRole } from '../../types';

interface HeaderProps {
  onLogout: () => void;
  notifications: Notification[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
  onDeleteNotification?: (id: string) => void;
  userName?: string;
  userRole?: UserRole;
  // Donde esta el usuario: titulo de la seccion y ruta (periodo / criterio / indicador).
  title?: string;
  trail?: string;
  onToggleMenu?: () => void;
}

export const Header = ({
  onLogout,
  notifications,
  showNotifications,
  onToggleNotifications,
  onMarkAsRead,
  onClearAllNotifications,
  onDeleteNotification,
  userName = 'Usuario',
  userRole = 'ADMIN',
  title = 'Repositorio CACES 2025',
  trail,
  onToggleMenu
}: HeaderProps) => {
  const roleLabel = ROLE_LABEL[userRole];

  return (
    <TopBar>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex w-full justify-between items-center"
      >
        <div className="flex min-w-0 items-center gap-3">
          {onToggleMenu && (
            <button type="button" onClick={onToggleMenu} aria-label="Abrir menú de navegación" className="-ml-2 rounded-lg p-2 text-white hover:bg-white/10 lg:hidden">
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-base font-black leading-tight tracking-tight text-white sm:text-lg">{title}</h2>
            {trail && <p className="truncate text-[10px] font-bold uppercase leading-tight tracking-widest text-[#aac4e8]">{trail}</p>}
          </div>
          <div className="hidden h-5 w-px bg-white/15 md:block" />
          <div className="hidden h-7 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 md:flex">
            <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="whitespace-nowrap text-[9px] font-black text-[#aac4e8] uppercase tracking-widest">
              {userRole === 'EVALUADOR'
                ? 'Modo de revisión activa'
                : userRole === 'ADMIN'
                    ? 'Gestión de roles'
                    : 'Gestión de acreditación'}
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
            onDelete={onDeleteNotification}
          />

          <UserPanel
            onLogout={onLogout}
            userName={userName}
            userRole={roleLabel}
          />
        </div>
      </motion.div>
    </TopBar>
  );
};
