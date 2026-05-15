export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'FALLBACK_NONE_SET';
  // Show first 25 chars only — masks the project ref but reveals what's loaded
  res.json({
    supabase_url_prefix: url.slice(0, 30),
    has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_anthropic_key: !!process.env.ANTHROPIC_API_KEY,
    has_google_creds: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    has_cron_secret: !!process.env.CRON_SECRET,
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV
  });
}
