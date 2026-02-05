import { useState, useEffect } from 'react';
import { AuthUser, ClinicInfo } from '../services/authService';
import { getClinicInfo, getUserPermissions } from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  clinic: ClinicInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissions: {
    canViewAllAppointments: boolean;
    canViewAllProfessionals: boolean;
    canManageUsers: boolean;
    professionalId?: string;
  };
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    clinic: null,
    isLoading: true,
    isAuthenticated: false,
    permissions: {
      canViewAllAppointments: false,
      canViewAllProfessionals: false,
      canManageUsers: false,
    },
  });

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        const storedClinic = localStorage.getItem('authClinic');
        
        if (storedUser && storedClinic) {
          const user = JSON.parse(storedUser);
          const clinic = JSON.parse(storedClinic);
          const permissions = getUserPermissions(user);
          
          setAuthState({
            user,
            clinic,
            permissions,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState(prev => ({ 
            ...prev, 
            isLoading: false,
            permissions: {
              canViewAllAppointments: false,
              canViewAllProfessionals: false,
              canManageUsers: false,
            }
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar estado de autenticação:', error);
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false,
          permissions: {
            canViewAllAppointments: false,
            canViewAllProfessionals: false,
            canManageUsers: false,
          }
        }));
      }
    };

    loadAuthState();
  }, []);

  const login = async (user: AuthUser, clinic: ClinicInfo) => {
    const permissions = getUserPermissions(user);
    
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('authClinic', JSON.stringify(clinic));
    localStorage.setItem('isAuthenticated', 'true');
    
    setAuthState({
      user,
      clinic,
      permissions,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authClinic');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    
    setAuthState({
      user: null,
      clinic: null,
      permissions: {
        canViewAllAppointments: false,
        canViewAllProfessionals: false,
        canManageUsers: false,
      },
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
};