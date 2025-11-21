import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  console.log('🎯 App component rendering...');
  
  return (
    <Router>
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
    </Router>
  );
}

export default App;