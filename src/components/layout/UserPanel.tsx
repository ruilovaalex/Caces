import React from 'react';
import { LogOut, User } from 'lucide-react';

interface UserPanelProps {
  onLogout: () => void;
  userName?: string;
  userRole?: string;
}

export const UserPanel = ({ onLogout, userName = 'Usuario', userRole = 'Perfil' }: UserPanelProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <p className="text-xs font-black text-slate-800 leading-none">{userName}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{userRole}</p>
      </div>
      
      <div className="relative group">
        <button 
          className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 font-black text-xs border border-blue-100 shadow-sm transition-all hover:bg-blue-100"
        >
          <User className="w-5 h-5" />
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
