import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, GraduationCap, Users } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [role, setRole] = useState<UserRole>('ADMIN');

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[28px] shadow-2xl shadow-black/30 border border-white/10 overflow-hidden"
      >
        <div className="p-10 text-center space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-[#2563eb] p-4 rounded-2xl shadow-xl shadow-blue-600/30">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">EduSudamericano</h1>
              <p className="text-[10px] font-black text-[#2563eb] uppercase tracking-[0.25em] mt-1">
                Gestion de Acreditacion CACES
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Perfil de Acceso</label>
              <div className="grid grid-cols-3 gap-2">
                {(['ADMIN', 'COORDINADOR', 'EVALUADOR'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-xl text-[9px] font-black border transition-all ${
                      role === r
                        ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-md'
                        : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f4f6f9]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Usuario Institucional</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                  <Users className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={
                    role === 'ADMIN'
                      ? 'admin@edusudamericano.edu.ec'
                      : role === 'COORDINADOR'
                        ? 'coordinador@edusudamericano.edu.ec'
                        : 'evaluador@edusudamericano.edu.ec'
                  }
                  readOnly
                  className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-sm text-[#1e293b] focus:ring-2 focus:ring-[#2563eb] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Contrasena</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  defaultValue="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onLogin(role)}
            className="w-full py-4 bg-[#2563eb] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/25 active:scale-95"
          >
            Iniciar sesion
          </button>

          <div className="pt-4 flex items-center justify-center gap-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest">
            <span className="hover:text-[#2563eb] cursor-pointer transition-colors">Olvido su clave?</span>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="hover:text-[#2563eb] cursor-pointer transition-colors">Soporte Tecnico</span>
          </div>
        </div>

        <div className="bg-[#f4f6f9] p-6 border-t border-[#e2e8f0] text-center">
          <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest">
            Plataforma oficial de aseguramiento de la calidad - 2025
          </p>
        </div>
      </motion.div>
    </div>
  );
};
