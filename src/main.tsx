import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 App starting...', new Date().toISOString());
console.log('🌍 Environment:', {
  NODE_ENV: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD
});
console.log('🔗 Current URL:', window.location.href);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Failed to find the root element');
}

console.log('✅ Root element found, rendering app...');

// Adicionar listener para mudanças de rota
window.addEventListener('popstate', (event) => {
  console.log('🔄 Route changed:', window.location.pathname, event);
});

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log('✅ App rendered successfully!');