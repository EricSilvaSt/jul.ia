import React, { useState } from 'react';
import { Menu, X, Calendar, Users, BarChart2, Settings, LogOut, MessageCircle, CalendarCheck, Lock } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasPremiumAccess } from '../../services/authService';
import logo from '../../assets/logo';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, clinic, logout, permissions } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const hasReportsAccess = clinic ? hasPremiumAccess(clinic.plano) : false;

  const menuItems = [
    { name: 'Painel', icon: <Calendar size={20} />, path: '/dashboard' },
    { name: 'Lia', icon: <MessageCircle size={20} />, path: '/lia' },
    { name: 'Compromissos', icon: <CalendarCheck size={20} />, path: '/commitments' },
    { 
      name: 'Profissionais', 
      icon: <Users size={20} />, 
      path: '/professionals',
      requiresPermission: 'canViewAllDentists'
    },
    { 
      name: 'Relatórios', 
      icon: hasReportsAccess ? <BarChart2 size={20} /> : <Lock size={20} />, 
      path: '/analytics',
      requiresPremium: !hasReportsAccess
    },
    { name: 'Chat', icon: <MessageCircle size={20} />, path: '/chat' },
    { 
      name: 'Configurações', 
      icon: <Settings size={20} />, 
      path: '/settings'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-40 w-full bg-white shadow-sm px-4 py-2 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <img src={logo} alt="Júl.IA Agenda Logo" className="h-12" />
      </div>

      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:static lg:z-0 lg:flex lg:flex-col`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <img src={logo} alt="Júl.IA Agenda Logo" className="h-18" />
          <button
            onClick={closeSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.requiresPremium || (item.requiresPermission && !permissions[item.requiresPermission as keyof typeof permissions]) ? (
                  <div className="flex items-center p-3 rounded-lg text-gray-400 cursor-not-allowed">
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {item.requiresPremium ? 'Premium' : 'Restrito'}
                    </span>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    } transition-colors duration-200`}
                    onClick={closeSidebar}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {user && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Logado como:</p>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.role === 'clinic' ? 'Acesso de Teste' : 
                 user.role === 'admin' ? 'Administrador' : 'Profissional'}
              </p>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <LogOut size={20} className="mr-3" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        <div className="p-6 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;