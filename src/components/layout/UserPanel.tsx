import React, { useEffect, useRef, useState } from 'react';
import { KeyRound, LogOut, User } from 'lucide-react';
import { motion } from 'motion/react';
import { isApiMode } from '../../services/api/apiClient';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

interface UserPanelProps {
  onLogout: () => void;
  userName?: string;
  userRole?: string;
}

// Menú de la cuenta: se abre con clic o teclado (antes solo al pasar el ratón, inaccesible en móvil).
export const UserPanel = ({ onLogout, userName = 'Usuario', userRole = 'Perfil' }: UserPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    const onPointer = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [isOpen]);

  const itemClass = 'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-xs font-bold';

  return (
    <div className="flex items-center gap-2.5">
      <div className="text-right hidden sm:block">
        <p className="text-xs font-black text-white leading-tight">{userName}</p>
        <p className="text-[9px] font-bold text-[#aac4e8] uppercase tracking-widest leading-tight">{userRole}</p>
      </div>

      <div className="relative" ref={containerRef}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsOpen(open => !open)}
          aria-label={`Cuenta de ${userName}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="h-9 w-9 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-black text-xs border border-white/20 shadow-sm transition-all hover:bg-blue-500"
        >
          <User className="w-4 h-4" aria-hidden />
        </motion.button>

        {isOpen && (
          <div role="menu" className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2">
            <p className="px-3 pb-2 pt-1 text-[11px] text-slate-500 sm:hidden">
              <span className="block font-black text-slate-800">{userName}</span>{userRole}
            </p>
            {isApiMode && (
              <button
                type="button"
                role="menuitem"
                onClick={() => { setIsOpen(false); setIsChangingPassword(true); }}
                className={`${itemClass} text-slate-700 hover:bg-slate-50`}
              >
                <KeyRound className="w-4 h-4" aria-hidden />
                Cambiar contraseña
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => { setIsOpen(false); onLogout(); }}
              className={`${itemClass} text-rose-600 hover:bg-rose-50`}
            >
              <LogOut className="w-4 h-4" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <ChangePasswordModal isOpen={isChangingPassword} onClose={() => setIsChangingPassword(false)} />
    </div>
  );
};
