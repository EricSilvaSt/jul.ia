import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Debug detalhado para Netlify
console.log('🚀 MAIN.TSX - App starting...', new Date().toISOString());
console.log('🌍 MAIN.TSX - Environment:', {
  NODE_ENV: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
});
console.log('🔗 MAIN.TSX - Current URL:', window.location.href);
console.log('🔗 MAIN.TSX - Hash:', window.location.hash);
console.log('🔗 MAIN.TSX - Pathname:', window.location.pathname);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ MAIN.TSX - Root element not found!');
  document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: Arial;">ERRO: Elemento root não encontrado!</div>';
  throw new Error('Failed to find the root element');
}

console.log('✅ MAIN.TSX - Root element found, rendering app...');

// Adicionar listener para mudanças de rota
window.addEventListener('popstate', (event) => {
  console.log('🔄 MAIN.TSX - Route changed:', window.location.pathname, window.location.hash, event);
});

// Adicionar fallback de erro
window.addEventListener('error', (event) => {
  console.error('❌ MAIN.TSX - Global error:', event.error);
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: Arial;">
    <h2>ERRO GLOBAL:</h2>
    <p>${event.error?.message || 'Erro desconhecido'}</p>
    <pre>${event.error?.stack || 'Sem stack trace'}</pre>
  </div>`;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ MAIN.TSX - Unhandled promise rejection:', event.reason);
});

try {
  console.log('🎯 MAIN.TSX - Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('🎯 MAIN.TSX - Rendering App component...');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✅ MAIN.TSX - App rendered successfully!');
} catch (error) {
  console.error('❌ MAIN.TSX - Error during render:', error);
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: Arial;">
    <h2>ERRO NO RENDER:</h2>
    <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
    <pre>${error instanceof Error ? error.stack : 'Sem stack trace'}</pre>
  </div>`;
}

console.log('✅ App rendered successfully!');