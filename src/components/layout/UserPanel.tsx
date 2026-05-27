import React from 'react';
import { LogOut, User } from 'lucide-react';

interface UserPanelProps {
  onLogout: () => void;
  userName?: string;
  userRole?: string;
}

export const UserPanel = ({ onLogout, userName = 'Usuario', userRole = 'Perfil' }: UserPanelProps) => {
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-right hidden sm:block">
        <p className="text-xs font-black text-white leading-tight">{userName}</p>
        <p className="text-[9px] font-bold text-[#aac4e8] uppercase tracking-widest leading-tight">{userRole}</p>
      </div>
      
      <div className="relative group">
        <button 
          className="h-9 w-9 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-black text-xs border border-white/20 shadow-sm transition-all hover:bg-blue-500"
        >
          <User className="w-4 h-4" />
        </button>
        
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
