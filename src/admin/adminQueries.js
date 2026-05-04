import { supabase } from '../supabase';

// ─── Country display helpers ──────────────────────────────────────────────────
// Flag: regional indicator symbols A=0x1F1E6, so offset by char code from 'A'
export const codeToFlag = (code) => {
  if (!code || code.length !== 2) return '';
  try {
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
  } catch {
    return '';
  }
};

// Name: Intl.DisplayNames covers every ISO 3166-1 alpha-2 code natively
export const codeToCountryName = (code) => {
  if (!code) return 'Unknown';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
};

export function countryDisplay(code) {
  if (!code) return { flag: '🌍', name: 'Unknown' };
  return { flag: codeToFlag(code), name: codeToCountryName(code) };
}

// ─── Date helper ─────────────────────────────────────────────────────────────
function sinceDate(dateRange) {
  if (dateRange === 'all') return null;
  const d = new Date();
  if (dateRange === 'today') { d.setHours(0, 0, 0, 0); return d.toISOString(); }
  const days = { '7d': 7, '30d': 30, '90d': 90 };
  d.setDate(d.getDate() - (days[dateRange] || 30));
  return d.toISOString();
}

export async function getVisitorCount(dateRange) {
  const since = sinceDate(dateRange);
  let q = supabase.from('page_views').select('visitor_id');
  if (since) q = q.gte('created_at', since);
  const { data } = await q;
  return new Set((data || []).map(r => r.visitor_id)).size;
}

export async function getPageViewsCount(dateRange) {
  const since = sinceDate(dateRange);
  let q = supabase.from('page_views').select('*', { count: 'exact', head: true });
  if (since) q = q.gte('created_at', since);
  const { count } = await q;
  return count || 0;
}

export async function getTopReferrers(dateRange, limit = 5) {
  const since = sinceDate(dateRange);
  let q = supabase.from('page_views').select('referrer').not('referrer', 'is', null);
  if (since) q = q.gte('created_at', since);
  const { data } = await q;
  const counts = {};
  (data || []).forEach(r => {
    if (r.referrer) counts[r.referrer] = (counts[r.referrer] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([referrer, count]) => ({ referrer, count }));
}

export async function getKpis(dateRange) {
  const since = sinceDate(dateRange);

  let signupsQ = supabase.from('profiles').select('*', { count: 'exact', head: true });
  if (since) signupsQ = signupsQ.gte('created_at', since);
  const { count: signups } = await signupsQ;

  let tripsQ = supabase.from('trips').select('*', { count: 'exact', head: true });
  if (since) tripsQ = tripsQ.gte('created_at', since);
  const { count: activeTrips } = await tripsQ;

  const { count: proSubscribers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro');

  const visitors = await getVisitorCount(dateRange);

  return {
    signups: signups || 0,
    activeTrips: activeTrips || 0,
    proSubscribers: proSubscribers || 0,
    estimatedMrr: (proSubscribers || 0) * 9.99,
    visitors,
  };
}

export async function getSignupsOverTime(dateRange) {
  const since = sinceDate(dateRange);
  let q = supabase.from('profiles').select('created_at').order('created_at', { ascending: true });
  if (since) q = q.gte('created_at', since);
  const { data } = await q;
  const counts = {};
  (data || []).forEach(r => {
    const date = r.created_at.slice(0, 10);
    counts[date] = (counts[date] || 0) + 1;
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

export async function getPlanBreakdown() {
  const { data } = await supabase.from('profiles').select('plan');
  let free = 0, pro = 0;
  (data || []).forEach(r => (r.plan === 'pro' ? pro++ : free++));
  return { free, pro };
}

export async function getRecentSignups(limit = 10) {
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getTopCountries(limit = 5) {
  const { data } = await supabase.from('trips').select('country');
  const counts = {};
  (data || []).forEach(r => {
    if (r.country) counts[r.country] = (counts[r.country] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([country, count]) => ({ country, count }));
}

export async function getActivityFeed(limit = 50) {
  const [{ data: profiles }, { data: grants }, { data: trips }] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, created_at').order('created_at', { ascending: false }).limit(limit),
    supabase.from('pro_grants').select('email, note, granted_at').order('granted_at', { ascending: false }).limit(limit),
    supabase.from('trips').select('id, name, created_at').order('created_at', { ascending: false }).limit(limit),
  ]);

  const events = [
    ...(profiles || []).map(p => ({
      id: `signup-${p.id}`,
      type: 'signup',
      description: `${p.email || p.full_name || 'Unknown'} signed up`,
      timestamp: p.created_at,
    })),
    ...(grants || []).map(g => ({
      id: `grant-${g.email}-${g.granted_at}`,
      type: 'upgrade',
      description: `${g.email} granted Pro${g.note ? ` — ${g.note}` : ''}`,
      timestamp: g.granted_at,
    })),
    ...(trips || []).map(t => ({
      id: `trip-${t.id}`,
      type: 'trip',
      description: `Trip created: "${t.name}"`,
      timestamp: t.created_at,
    })),
  ];

  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
}

export async function listGrants() {
  const { data, error } = await supabase
    .from('pro_grants').select('*').order('granted_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function grantPro(email, note) {
  const { data, error } = await supabase.rpc('grant_pro', { p_email: email, p_note: note });
  if (error) throw error;
  return data;
}

export async function revokePro(email) {
  const { data, error } = await supabase.rpc('revoke_pro', { p_email: email });
  if (error) throw error;
  return data;
}
