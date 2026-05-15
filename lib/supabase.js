// lib/supabase.js — server-only Supabase clients for /api routes
// Env: VITE_SUPABASE_URL (already set in Vercel), SUPABASE_SERVICE_ROLE_KEY
import { createClient } from '@supabase/supabase-js';

function getUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
}

export function getAnonClient() {
  return createClient(getUrl(), process.env.VITE_SUPABASE_ANON_KEY || '');
}

export function getServiceClient() {
  return createClient(getUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    global: {
      fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
    },
  });
}
