import { createClient } from '@supabase/supabase-js';

// Valores padrão para evitar erro na Netlify se as env vars não estiverem configuradas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Log de debug das variáveis de ambiente
console.log('🔧 Supabase Environment Check:', {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  hasServiceKey: !!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  environment: import.meta.env.MODE,
  actualUrl: import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing',
  actualAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
});

// Avisar se as variáveis estão faltando, mas não travar a aplicação
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase configuration incomplete:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    anonKey: supabaseAnonKey ? 'Present' : 'Missing',
    serviceKey: supabaseServiceKey ? 'Present' : 'Missing',
    note: 'App will work in demo mode with limited functionality'
  });
}

// Criar cliente Supabase (mesmo com valores placeholder)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Cliente com service role para operações administrativas (como login)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)