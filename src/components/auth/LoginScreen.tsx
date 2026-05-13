import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Users, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [role, setRole] = useState<UserRole>('ADMIN');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden"
      >
        <div className="p-10 text-center space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-600/30">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">EduSudamericano</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em] mt-1">Gestión de Acreditación CACES</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil de Acceso</label>
              <div className="grid grid-cols-3 gap-2">
                {(['ADMIN', 'COORDINADOR', 'EVALUADOR'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-xl text-[9px] font-black border transition-all ${
                      role === r 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuario Institucional</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Users className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  defaultValue="admin@edusudamericano.edu.ec"
                  readOnly
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  defaultValue="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => onLogin(role)}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            Iniciar Sesión
          </button>

          <div className="pt-4 flex items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">¿Olvidó su clave?</span>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Soporte Técnico</span>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Plataforma oficial de aseguramiento de la calidad • 2025
          </p>
        </div>
      </motion.div>
    </div>
  );
};
