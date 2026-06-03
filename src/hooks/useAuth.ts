import { useState, useCallback } from 'react';
import { UserRole, User } from '../types';
import { NotificationService } from '../services/notificationService';

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

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

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
    userRole,
    user,
    login,
    logout,
    switchRole
  };
};
