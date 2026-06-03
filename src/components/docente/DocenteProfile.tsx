import React, { useState } from 'react';
import { User, Mail, Phone, BookOpen, Calendar, GraduationCap, Edit3, LogOut, CheckCircle2 } from 'lucide-react';

interface DocenteProfileProps {
  onLogout: () => void;
}

export const DocenteProfile = ({ onLogout }: DocenteProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Prof. Pablo Mora',
    email: 'docente@edu.ec',
    phone: '+593 98 765 4321',
    department: 'Ciencias Biológicas',
    period: '2025',
    degree: 'Magíster en Biología'
  });

  const stats = {
    uploaded: 3,
    validated: 1,
    observed: 1
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Mi Perfil</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Configuración y estadísticas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="premium-card bg-white p-6 rounded-lg text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 border-4 border-white shadow-lg">
              <User className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-800">{profile.name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Docente Adjunto</p>
            
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditing ? 'Guardar Cambios' : 'Editar Perfil'}
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-black uppercase tracking-widest text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="premium-card bg-white p-6 rounded-lg">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Resumen de Actividad</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Archivos Subidos</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-700">{stats.uploaded}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Validados (Aprobados)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-700">{stats.validated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Observados (Revisión)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700">{stats.observed}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="premium-card bg-white p-6 rounded-lg h-full">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Información Personal y Académica</h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Nombre Completo
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-blue-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100" 
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700 px-3 py-2 bg-slate-50 rounded-lg border border-transparent">{profile.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Correo Institucional
                  </label>
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-blue-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100" 
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700 px-3 py-2 bg-slate-50 rounded-lg border border-transparent">{profile.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Teléfono
                  </label>
                  {isEditing ? (
                    <input 
                      type="tel" 
                      value={profile.phone} 
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-blue-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100" 
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700 px-3 py-2 bg-slate-50 rounded-lg border border-transparent">{profile.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Departamento
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.department} 
                      onChange={(e) => setProfile({...profile, department: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-blue-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100" 
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700 px-3 py-2 bg-slate-50 rounded-lg border border-transparent">{profile.department}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Período Académico
                  </label>
                  {isEditing ? (
                    <select 
                      value={profile.period} 
                      onChange={(e) => setProfile({...profile, period: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-blue-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option>2025</option>
                      <option>2024</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-slate-700 px-3 py-2 bg-slate-50 rounded-lg border border-transparent">{profile.period}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Título Académico
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.degree} 
                      onChange={(e) => setProfile({...profile, degree: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-blue-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100" 
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700 px-3 py-2 bg-slate-50 rounded-lg border border-transparent">{profile.degree}</p>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    Guardar y Finalizar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
