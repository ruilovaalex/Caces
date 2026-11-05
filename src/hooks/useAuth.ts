import { useState, useCallback, useEffect } from 'react';
import { UserRole, User } from '../types';
import { NotificationService } from '../services/notificationService';
import { isApiMode, setUnauthorizedHandler, tokenStore } from '../services/api/apiClient';
import { AuthApi } from '../services/api/cacesApi';

const buildUserByRole = (role: UserRole): User => ({
  id:
    role === 'COORDINADOR'
        ? 'coord-1'
        : role === 'EVALUADOR'
          ? 'eval-1'
          : role === 'DOCENTE'
            ? 'docente-1'
            : 'admin-1',
  email:
    role === 'ADMIN'
      ? 'admin@edusudamericano.edu.ec'
      : role === 'COORDINADOR'
        ? 'coordinador@edusudamericano.edu.ec'
        : role === 'DOCENTE'
          ? 'docente@edu.ec'
          : 'evaluador@edusudamericano.edu.ec',
  name:
    role === 'ADMIN'
      ? 'Admin Sudamericano'
      : role === 'COORDINADOR'
        ? 'Coord. Academico'
        : role === 'DOCENTE'
          ? 'Prof. Pablo Mora'
          : 'Evaluador Externo',
  role
});

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [user, setUser] = useState<User | null>(null);
  // En modo servidor se intenta recuperar la sesion de la pestana antes de mostrar el login.
  const [isRestoring, setIsRestoring] = useState(isApiMode && Boolean(tokenStore.get()));

  const applyUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    setUserRole(nextUser.role);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    if (isApiMode) AuthApi.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!isApiMode) return;
    setUnauthorizedHandler(() => {
      setIsAuthenticated(false);
      setUser(null);
    });
    if (tokenStore.get()) {
      AuthApi.me()
        .then(applyUser)
        .catch(() => tokenStore.clear())
        .finally(() => setIsRestoring(false));
    }
    return () => setUnauthorizedHandler(null);
  }, [applyUser]);

  // Modo local (demostracion): se elige un perfil sin contrasena.
  const login = useCallback((role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    setUser(buildUserByRole(role));

    NotificationService.add({
      title: 'Sesion Iniciada',
      message: `Bienvenido al sistema de acreditacion EduSudamericano. Perfil activo: ${role}`,
      type: 'info'
    });
  }, []);

  // Modo servidor: autenticacion real con correo y contrasena.
  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    applyUser(await AuthApi.login(email, password));
  }, [applyUser]);

  const switchRole = useCallback((role: UserRole) => {
    setUserRole(role);
    setUser(buildUserByRole(role));
    NotificationService.add({
      title: 'Cambiando Perfil',
      message: `Asumiendo rol de: ${role}`,
      type: 'info'
    });
  }, []);

  return {
    isAuthenticated,
    isRestoring,
    userRole,
    user,
    login,
    loginWithCredentials,
    logout,
    // El cambio libre de perfil solo existe en el modo local de demostracion.
    switchRole: isApiMode ? undefined : switchRole
  };
};
