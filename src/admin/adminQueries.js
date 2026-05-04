import { supabase } from '../supabase';

// ─── Country display helpers ──────────────────────────────────────────────────
const COUNTRY_NAMES = {
  US: { name: 'United States',   flag: '🇺🇸' },
  GB: { name: 'United Kingdom',  flag: '🇬🇧' },
  FR: { name: 'France',          flag: '🇫🇷' },
  DE: { name: 'Germany',         flag: '🇩🇪' },
  IT: { name: 'Italy',           flag: '🇮🇹' },
  ES: { name: 'Spain',           flag: '🇪🇸' },
  JP: { name: 'Japan',           flag: '🇯🇵' },
  MX: { name: 'Mexico',          flag: '🇲🇽' },
  CA: { name: 'Canada',          flag: '🇨🇦' },
  AU: { name: 'Australia',       flag: '🇦🇺' },
  TR: { name: 'Turkey',          flag: '🇹🇷' },
  GR: { name: 'Greece',          flag: '🇬🇷' },
  TH: { name: 'Thailand',        flag: '🇹🇭' },
  PT: { name: 'Portugal',        flag: '🇵🇹' },
  NL: { name: 'Netherlands',     flag: '🇳🇱' },
  CH: { name: 'Switzerland',     flag: '🇨🇭' },
  AT: { name: 'Austria',         flag: '🇦🇹' },
  BE: { name: 'Belgium',         flag: '🇧🇪' },
  PL: { name: 'Poland',          flag: '🇵🇱' },
  CZ: { name: 'Czech Republic',  flag: '🇨🇿' },
  HR: { name: 'Croatia',         flag: '🇭🇷' },
  HU: { name: 'Hungary',         flag: '🇭🇺' },
  RO: { name: 'Romania',         flag: '🇷🇴' },
  RU: { name: 'Russia',          flag: '🇷🇺' },
  CN: { name: 'China',           flag: '🇨🇳' },
  IN: { name: 'India',           flag: '🇮🇳' },
  BR: { name: 'Brazil',          flag: '🇧🇷' },
  AR: { name: 'Argentina',       flag: '🇦🇷' },
  CL: { name: 'Chile',           flag: '🇨🇱' },
  CO: { name: 'Colombia',        flag: '🇨🇴' },
  PE: { name: 'Peru',            flag: '🇵🇪' },
  SG: { name: 'Singapore',       flag: '🇸🇬' },
  MY: { name: 'Malaysia',        flag: '🇲🇾' },
  ID: { name: 'Indonesia',       flag: '🇮🇩' },
  KR: { name: 'South Korea',     flag: '🇰🇷' },
  VN: { name: 'Vietnam',         flag: '🇻🇳' },
  PH: { name: 'Philippines',     flag: '🇵🇭' },
  TW: { name: 'Taiwan',          flag: '🇹🇼' },
  AE: { name: 'UAE',             flag: '🇦🇪' },
  SA: { name: 'Saudi Arabia',    flag: '🇸🇦' },
  MA: { name: 'Morocco',         flag: '🇲🇦' },
  EG: { name: 'Egypt',           flag: '🇪🇬' },
  ZA: { name: 'South Africa',    flag: '🇿🇦' },
  NG: { name: 'Nigeria',         flag: '🇳🇬' },
  NZ: { name: 'New Zealand',     flag: '🇳🇿' },
  SE: { name: 'Sweden',          flag: '🇸🇪' },
  NO: { name: 'Norway',          flag: '🇳🇴' },
  DK: { name: 'Denmark',         flag: '🇩🇰' },
  FI: { name: 'Finland',         flag: '🇫🇮' },
  IE: { name: 'Ireland',         flag: '🇮🇪' },
  IL: { name: 'Israel',          flag: '🇮🇱' },
  HK: { name: 'Hong Kong',       flag: '🇭🇰' },
  MO: { name: 'Macau',           flag: '🇲🇴' },
};

export function countryDisplay(code) {
  if (!code) return { flag: '🌍', name: 'Unknown' };
  const info = COUNTRY_NAMES[code.toUpperCase()];
  return info || { flag: '', name: code };
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
