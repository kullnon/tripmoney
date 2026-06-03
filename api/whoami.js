export default async function handler(req, res) {
  let gsc_client_email = null;
  try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (raw) gsc_client_email = JSON.parse(raw).client_email || null;
  } catch (e) {
    gsc_client_email = `parse_error: ${e.message}`;
  }
  res.json({
    supabase_url_prefix: (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "FALLBACK").slice(0, 30),
    has_anthropic: !!process.env.ANTHROPIC_API_KEY,
    has_google: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    has_cron: !!process.env.CRON_SECRET,
    vercel_env: process.env.VERCEL_ENV,
    gsc_client_email,
  });
}
