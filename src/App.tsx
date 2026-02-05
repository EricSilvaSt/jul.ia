import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LiaAppointmentsPage from './pages/LiaAppointmentsPage';
import ProfessionalsPage from './pages/ProfessionalsPage';
import CommitmentsPage from './pages/CommitmentsPage';
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
        <Routes>
            <Route path="/login" element={
              <LoginPage />
            } />
            
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
              <Route path="/lia" element={<LiaAppointmentsPage />} />
              <Route path="/professionals" element={<ProfessionalsPage />} />
              <Route path="/commitments" element={<CommitmentsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
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