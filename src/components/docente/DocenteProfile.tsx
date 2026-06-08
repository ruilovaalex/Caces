import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, BookOpen, Calendar, GraduationCap, Edit3, LogOut, CheckCircle2 } from 'lucide-react';
import {
  fadeInUp, fadeInLeft, scaleInBounce, staggerContainer, staggerContainerFast,
  springBounce, easeOut, hoverScale, tapScale,
} from '../../utils/animations';

interface DocenteProfileProps {
  onLogout: () => void;
}

export const DocenteProfile = ({ onLogout }: DocenteProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveCheck, setShowSaveCheck] = useState(false);
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
    setShowSaveCheck(true);
    setTimeout(() => {
      setShowSaveCheck(false);
      setIsEditing(false);
    }, 800);
  };

  const profileFields = [
    { key: 'name', label: 'Nombre Completo', Icon: User, type: 'text' },
    { key: 'email', label: 'Correo Institucional', Icon: Mail, type: 'email' },
    { key: 'phone', label: 'Teléfono', Icon: Phone, type: 'tel' },
    { key: 'department', label: 'Departamento', Icon: BookOpen, type: 'text' },
    { key: 'period', label: 'Período Académico', Icon: Calendar, type: 'select', options: ['2025', '2024'] },
    { key: 'degree', label: 'Título Académico', Icon: GraduationCap, type: 'text' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Mi Perfil</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Configuración y estadísticas</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="md:col-span-1 space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={fadeInUp}
            transition={easeOut}
            className="premium-card bg-white p-6 rounded-lg text-center"
          >
            {/* Animated avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springBounce}
              className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 border-4 border-white shadow-lg"
            >
              <User className="w-10 h-10" />
            </motion.div>
            <h3 className="text-lg font-black text-slate-800">{profile.name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Docente Adjunto</p>
            
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <motion.button
                whileHover={hoverScale}
                whileTap={tapScale}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditing ? 'Guardar Cambios' : 'Editar Perfil'}
              </motion.button>
              <motion.button
                whileHover={hoverScale}
                whileTap={tapScale}
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-black uppercase tracking-widest text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            transition={{ ...easeOut, delay: 0.15 }}
            className="premium-card bg-white p-6 rounded-lg"
          >
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
          </motion.div>
        </motion.div>

        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
        >
          <div className="premium-card bg-white p-6 rounded-lg h-full relative overflow-hidden">
            {/* Save check overlay */}
            <AnimatePresence>
              {showSaveCheck && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                  </motion.div>
                  <p className="mt-3 text-sm font-black text-emerald-700 uppercase tracking-widest">Guardado</p>
                </motion.div>
              )}
            </AnimatePresence>

            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Información Personal y Académica</h3>
            
            <div className="space-y-5">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                variants={staggerContainerFast}
                initial="initial"
                animate="animate"
              >
                {profileFields.map((field, i) => {
                  const { key, label, Icon, type } = field;
                  const options = 'options' in field ? field.options : [];

                  return (
                    <motion.div
                      key={key}
                      variants={fadeInLeft}
                      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.25 + i * 0.07 }}
                      className="space-y-2"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </label>
                      <AnimatePresence mode="wait">
                        {isEditing ? (
                          <motion.div
                            key="edit"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {type === 'select' ? (
                              <select
                                value={profile[key as keyof typeof profile]}
                                onChange={(e) => setProfile({...profile, [key]: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-50 border border-blue-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
                              >
                                {options.map(o => <option key={o}>{o}</option>)}
                              </select>
                            ) : (
                              <input
                                type={type}
                                value={profile[key as keyof typeof profile]}
                                onChange={(e) => setProfile({...profile, [key]: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-50 border border-blue-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
                              />
                            )}
                          </motion.div>
                        ) : (
                          <motion.p
                            key="view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-sm font-bold text-slate-700 px-3 py-2 bg-slate-50 rounded-lg border border-transparent"
                          >
                            {profile[key as keyof typeof profile]}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
              
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="pt-4 flex justify-end"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={tapScale}
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                    >
                      Guardar y Finalizar
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
