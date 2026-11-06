import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, GraduationCap, Users } from 'lucide-react';
import { UserRole } from '../../types';
import { scaleIn, btnPrimary } from '../../utils/animations';
import { describeError } from '../../services/api/apiClient';
import { AuthApi } from '../../services/api/cacesApi';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
  // Si se recibe, la pantalla pide correo y contrasena reales (modo servidor).
  onCredentialsLogin?: (email: string, password: string) => Promise<void>;
}

export const LoginScreen = ({ onLogin, onCredentialsLogin }: LoginScreenProps) => {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [recovery, setRecovery] = useState<'none' | 'forgot' | 'reset'>(() =>
    onCredentialsLogin && new URLSearchParams(window.location.search).has('reset') ? 'reset' : 'none');
  // Sin proveedor de correo, la clave la restablece el administrador: no se ofrece un formulario que nunca enviaria nada.
  // Mientras no se sepa (servidor despertando), se muestra la indicacion del administrador.
  const [recoveryByEmail, setRecoveryByEmail] = useState(false);

  useEffect(() => {
    if (!onCredentialsLogin) return;
    let active = true;
    // Esta consulta tambien despierta el servidor mientras la persona escribe sus datos.
    AuthApi.options()
      .then(options => { if (active) setRecoveryByEmail(options.passwordRecovery === 'email'); })
      .catch(() => { /* se mantiene la indicacion del administrador */ });
    return () => { active = false; };
  }, [onCredentialsLogin]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans overflow-hidden relative">
      {/* Decorative background circles */}
      <motion.div 
        animate={{ y: [-10, 10, -10], opacity: [0.3, 0.5, 0.3] }} 
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        animate={{ y: [10, -10, 10], opacity: [0.2, 0.4, 0.2] }} 
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-md bg-white rounded-[28px] shadow-2xl shadow-black/30 border border-white/10 overflow-hidden relative z-10"
      >
        <div className="p-10 text-center space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-[#2563eb] p-4 rounded-2xl shadow-xl shadow-blue-600/30">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">EduSudamericano</h1>
              <p className="text-[10px] font-black text-[#2563eb] uppercase tracking-[0.25em] mt-1">
                Gestión de acreditación CACES
              </p>
            </div>
          </div>

          {onCredentialsLogin && recovery !== 'none' ? (
            <PasswordRecovery mode={recovery} onDone={() => { window.history.replaceState({}, '', window.location.pathname); setRecovery('none'); }} />
          ) : onCredentialsLogin ? (
            <CredentialsForm onSubmit={onCredentialsLogin} />
          ) : (
          <>
          <div className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Perfil de acceso</label>
              <div className="grid grid-cols-2 gap-2">
                {(['ADMIN', 'COORDINADOR', 'EVALUADOR', 'DOCENTE'] as UserRole[]).map(r => (
                  <motion.button
                    key={r}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-xl text-[9px] font-black border transition-all ${
                      role === r
                        ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-md'
                        : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f4f6f9]'
                    }`}
                  >
                    {r}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Usuario institucional</label>
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
                        : role === 'DOCENTE'
                          ? 'docente@edu.ec'
                          : 'evaluador@edusudamericano.edu.ec'
                  }
                  readOnly
                  className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-sm text-[#1e293b] focus:ring-2 focus:ring-[#2563eb] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={role === 'DOCENTE' ? '123456' : '••••••••'}
                  readOnly
                  className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <motion.button
            {...btnPrimary}
            onClick={() => onLogin(role)}
            className="w-full py-4 bg-[#2563eb] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/25 active:scale-95"
          >
            Iniciar sesión
          </motion.button>
          </>
          )}

          <div className="pt-4 flex items-center justify-center gap-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest">
            {onCredentialsLogin ? (
              recoveryByEmail ? (
                <button type="button" onClick={() => setRecovery('forgot')} className="hover:text-[#2563eb] transition-colors">¿Olvidó su clave?</button>
              ) : (
                <span className="text-center normal-case tracking-normal font-bold">¿Olvidó su clave? Pida al administrador que la restablezca desde Usuarios y roles.</span>
              )
            ) : (
              <span className="text-center normal-case tracking-normal text-amber-700">Modo demostración: elige un perfil, no se pide contraseña y los datos quedan solo en este navegador.</span>
            )}
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

const inputClass = 'w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-sm text-[#1e293b] focus:ring-2 focus:ring-[#2563eb] outline-none transition-all';

const CredentialsForm = ({ onSubmit }: { onSubmit: (email: string, password: string) => Promise<void> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  // Si la respuesta tarda, lo mas probable es que el servidor gratuito este despertando: se avisa en vez de parecer colgado.
  useEffect(() => {
    if (!isSubmitting) { setIsSlow(false); return; }
    const timer = setTimeout(() => setIsSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(email.trim(), password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 text-left">
        <label htmlFor="login-email" className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Usuario institucional</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            <Users className="w-4 h-4" />
          </span>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="usuario@edusudamericano.edu.ec"
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2 text-left">
        <label htmlFor="login-password" className="text-[10px] font-black text-[#64748b] uppercase tracking-widest ml-1">Contraseña</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={event => setPassword(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-left text-xs font-bold text-rose-600">{error}</p>
      )}

      {isSlow && (
        <p role="status" className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-left text-xs font-bold text-blue-700">
          Activando el servidor. La primera conexión del día puede tardar hasta un minuto; no cierres la página.
        </p>
      )}

      <motion.button
        {...btnPrimary}
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-[#2563eb] hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/25 active:scale-95 disabled:opacity-60"
      >
        {isSubmitting ? 'Verificando...' : 'Iniciar sesión'}
      </motion.button>
    </form>
  );
};

const PasswordRecovery = ({ mode, onDone }: { mode: 'forgot' | 'reset'; onDone: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (mode === 'reset' && password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === 'forgot') {
        await AuthApi.forgotPassword(email.trim());
        setMessage('Si el correo está registrado, recibirás un enlace para restablecer la clave. Si no llega, solicita al administrador que la restablezca.');
      } else {
        await AuthApi.resetPassword(new URLSearchParams(window.location.search).get('reset') ?? '', password);
        setMessage('Contraseña actualizada. Ya puedes iniciar sesión.');
      }
    } catch (submitError) {
      setError(describeError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <h2 className="text-center text-sm font-black uppercase tracking-widest text-[#0f172a]">
        {mode === 'forgot' ? 'Recuperar contraseña' : 'Nueva contraseña'}
      </h2>
      {message ? (
        <p role="status" className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">{message}</p>
      ) : mode === 'forgot' ? (
        <div className="space-y-2">
          <label htmlFor="recovery-email" className="ml-1 text-[10px] font-black uppercase tracking-widest text-[#64748b]">Correo institucional</label>
          <input id="recovery-email" type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className={inputClass.replace('pl-12', 'pl-4')} />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="recovery-password" className="ml-1 text-[10px] font-black uppercase tracking-widest text-[#64748b]">Nueva contraseña (mín. 12)</label>
            <input id="recovery-password" type="password" required minLength={12} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass.replace('pl-12', 'pl-4')} />
          </div>
          <div className="space-y-2">
            <label htmlFor="recovery-confirm" className="ml-1 text-[10px] font-black uppercase tracking-widest text-[#64748b]">Confirmar contraseña</label>
            <input id="recovery-confirm" type="password" required minLength={12} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputClass.replace('pl-12', 'pl-4')} />
          </div>
        </>
      )}
      {error && <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">{error}</p>}
      {!message && (
        <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-[#2563eb] py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-60">
          {isSubmitting ? 'Enviando...' : mode === 'forgot' ? 'Enviar enlace' : 'Guardar contraseña'}
        </button>
      )}
      <button type="button" onClick={onDone} className="w-full text-center text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-[#2563eb]">
        Volver al inicio de sesión
      </button>
    </form>
  );
};
