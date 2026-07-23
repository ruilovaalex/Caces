import React from 'react';
import { motion } from 'motion/react';
import { Menu } from 'lucide-react';
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
  onOpenMenu?: () => void;
}

export const Header = ({
  onLogout,
  notifications,
  showNotifications,
  onToggleNotifications,
  onMarkAsRead,
  onClearAllNotifications,
  userName = 'Usuario',
  userRole = 'ADMIN',
  onOpenMenu
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
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex w-full justify-between items-center"
      >
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onOpenMenu} aria-label="Abrir menú" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="truncate text-base font-bold text-white sm:text-lg">Repositorio CACES 2025</h2>
          <div className="hidden h-5 w-px bg-white/15 sm:block" />
          <div className="hidden h-7 items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 md:flex">
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

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
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
      </motion.div>
    </TopBar>
  );
};
