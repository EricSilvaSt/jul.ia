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
  console.log('🔐 APP.TSX - PrivateRoute checking authentication...');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  console.log('🔐 APP.TSX - isAuthenticated:', isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  console.log('🎯 APP.TSX - App component rendering...', window.location.href);
  console.log('🔍 APP.TSX - Current path:', window.location.pathname);
  console.log('🔍 APP.TSX - Hash:', window.location.hash);
  console.log('🔍 APP.TSX - localStorage auth:', localStorage.getItem('isAuthenticated'));
  
  try {
    console.log('🎯 APP.TSX - Rendering Router...');
    
    return (
      <Router>
        <div>
          {/* Debug info mais visível */}
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            right: 0, 
            background: 'rgba(255,0,0,0.9)', 
            color: 'white', 
            padding: '10px', 
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '300px',
            wordBreak: 'break-all'
          }}>
            <div><strong>DEBUG NETLIFY:</strong></div>
            <div>Path: {window.location.pathname}</div>
            <div>Hash: {window.location.hash}</div>
            <div>Auth: {localStorage.getItem('isAuthenticated') || 'null'}</div>
            <div>Env: {import.meta.env.MODE}</div>
          </div>
          
          <Routes>
            <Route path="/login" element={
              <div>
                {console.log('🔑 APP.TSX - Rendering LoginPage')}
                <LoginPage />
              </div>
            } />
            
            <Route
              path="/"
              element={
                <div>
                  {console.log('🏠 APP.TSX - Rendering MainLayout with PrivateRoute')}
                  <PrivateRoute>
                    <MainLayout />
                  </PrivateRoute>
                </div>
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
  } catch (error) {
    console.error('❌ APP.TSX - Error in App component:', error);
    return (
      <div style={{ color: 'red', padding: '20px', fontFamily: 'Arial' }}>
        <h2>ERRO NO APP COMPONENT:</h2>
        <p>{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <pre>{error instanceof Error ? error.stack : 'Sem stack trace'}</pre>
      </div>
    );
  }
}

export default App;