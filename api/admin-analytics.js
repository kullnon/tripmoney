import { createClient } from '@supabase/supabase-js';

// TODO: When GoatCounter is configured, proxy requests here using GOATCOUNTER_API_TOKEN.
// Currently returns a stub so the endpoint exists and auth is wired up.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // Verify the JWT and get the authenticated user
  const anonClient = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );

  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  // Check is_admin server-side using service role (bypasses RLS)
  const serviceClient = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data: profile } = await serviceClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return res.status(403).json({ error: 'Forbidden' });

  // TODO: proxy GoatCounter analytics when GOATCOUNTER_API_TOKEN is set in Vercel env
  return res.status(200).json({ stub: true });
}
