import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import JuliaAppointmentsPage from './pages/JuliaAppointmentsPage';
import DentistsPage from './pages/DentistsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/Layout/MainLayout';
import ChatInterface from './components/Chat/ChatInterface';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  console.log('🎯 App component rendering...', window.location.href);
  console.log('🔍 Current path:', window.location.pathname);
  console.log('🔍 Hash:', window.location.hash);
  
  return (
    <Router>
      <div>
        {/* Debug info - remover em produção */}
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '5px', 
          fontSize: '10px',
          zIndex: 9999 
        }}>
          Path: {window.location.pathname} | Hash: {window.location.hash}
        </div>
        
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/julia" element={<JuliaAppointmentsPage />} />
          <Route path="/dentists" element={<DentistsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      </div>
    </Router>
  );
}

export default App;