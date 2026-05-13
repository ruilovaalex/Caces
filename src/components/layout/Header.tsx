import React from 'react';
import { 
  Users, 
  LogOut 
} from 'lucide-react';
import { TopBar } from './TopBar';
import { UserPanel } from './UserPanel';
import { NotificationBell } from './NotificationBell';
import { Notification, Indicator } from '../../types';

interface HeaderProps {
  onLogout: () => void;
  onGenerateAI: (autoSave: boolean) => void;
  selectedIndicator: Indicator | null;
  isGenerating: boolean;
  canWrite: boolean;
  notifications: Notification[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
}

export const Header = ({
  onLogout,
  onGenerateAI,
  selectedIndicator,
  isGenerating,
  canWrite,
  notifications,
  showNotifications,
  onToggleNotifications,
  onMarkAsRead,
  onClearAllNotifications
}: HeaderProps) => {
  return (
    <TopBar>
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Gestión de Evidencias 2025</h2>
        <div className="h-6 w-[1px] bg-slate-200 mx-2" />
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">En Proceso de Acreditación</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {canWrite && (
          <button 
            onClick={() => onGenerateAI(true)}
            disabled={!selectedIndicator || isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 rounded-xl text-xs font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            Obtener Guía de Acreditación
          </button>
        )}
        <div className="h-8 w-[1px] bg-slate-200 mx-1" />
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
            userName="Coordinador Académico"
            userRole="SUDAMERICANO"
          />
        </div>
      </div>
    </TopBar>
  );
};
