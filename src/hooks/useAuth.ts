import { useState, useCallback } from 'react';
import { UserRole, User } from '../types';
import { NotificationService } from '../services/notificationService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    setUser({
      id: '1',
      email: 'admin@edusudamericano.edu.ec',
      name: role === 'ADMIN' ? 'Admin Sudamericano' : role === 'COORDINADOR' ? 'Coord. Académico' : 'Evaluador Externo',
      role: role
    });
    
    NotificationService.add({
      title: 'Sesión Iniciada',
      message: `Bienvenido al sistema de acreditación EduSudamericano. Perfil activo: ${role}`,
      type: 'info'
    });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUserRole(role);
    if (user) {
      setUser({ ...user, role });
    }
    NotificationService.add({
      title: 'Cambiando Perfil',
      message: `Asumiendo rol de: ${role}`,
      type: 'info'
    });
  }, [user]);

  return {
    isAuthenticated,
    userRole,
    user,
    login,
    logout,
    switchRole
  };
};
