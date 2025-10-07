import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is missing from environment variables');
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is missing from environment variables');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    anonKey: supabaseAnonKey ? 'Present' : 'Missing',
    serviceKey: supabaseServiceKey ? 'Present' : 'Missing'
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente com service role para operações administrativas (como login)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);