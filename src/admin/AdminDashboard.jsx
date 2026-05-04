import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getKpis, getSignupsOverTime, getPlanBreakdown, getRecentSignups, getTopCountries, getTopReferrers, countryDisplay } from './adminQueries';

const T = {
  bg: "#0A0F1E", surface: "#111827", card: "#1A2235", cardHover: "#1F2A40",
  border: "#1E2D45", accent: "#00D4FF", accentDim: "#0099BB",
  accentGlow: "rgba(0,212,255,0.15)", green: "#00E5A0", greenDim: "#00A872",
  orange: "#FF8A00", red: "#FF4560", purple: "#7B61FF", yellow: "#FFD600",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'All Time', value: 'all' },
];

const MRR_TOOLTIP = "Rough estimate: count(pro) × $9.99/mo. Doesn't account for annual subs or granted accounts. v2 reads from Stripe API.";

function KpiCard({ label, value, color, sub, tooltip }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: '20px 24px', flex: '1 1 160px', position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          {label}
        </div>
        {tooltip && (
          <span
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            style={{ color: T.textDim, fontSize: 13, cursor: 'help', lineHeight: 1, userSelect: 'none' }}
          >
            ⓘ
          </span>
        )}
        {showTip && (
          <div style={{
            position: 'absolute', top: 44, left: 0, right: 0, zIndex: 20,
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: '10px 14px',
            color: T.textMid, fontSize: 12, lineHeight: 1.6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            {tooltip}
          </div>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: color || T.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('30d');
  const [kpis, setKpis] = useState(null);
  const [signupsChart, setSignupsChart] = useState([]);
  const [planBreakdown, setPlanBreakdown] = useState({ free: 0, pro: 0 });
  const [recentSignups, setRecentSignups] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getKpis(dateRange),
      getSignupsOverTime(dateRange),
      getPlanBreakdown(),
      getRecentSignups(10),
      getTopCountries(5),
      getTopReferrers(dateRange, 5),
    ]).then(([k, sc, pb, rs, tc, tr]) => {
      setKpis(k);
      setSignupsChart(sc);
      setPlanBreakdown(pb);
      setRecentSignups(rs);
      setTopCountries(tc);
      setTopReferrers(tr);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [dateRange]);

  const pieData = [
    { name: 'Free', value: planBreakdown.free, color: T.textMid },
    { name: 'Pro', value: planBreakdown.pro, color: T.accent },
  ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Date range pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {DATE_RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => setDateRange(r.value)}
            style={{
              padding: '6px 16px', borderRadius: 20,
              background: dateRange === r.value ? T.accent : T.card,
              color: dateRange === r.value ? T.bg : T.textMid,
              border: `1px solid ${dateRange === r.value ? T.accent : T.border}`,
              cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
            }}
          >
            {r.label}
          </button>
        ))}
        {loading && <span style={{ color: T.textDim, fontSize: 12, alignSelf: 'center', marginLeft: 8 }}>Loading…</span>}
      </div>

      {/* KPI cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10 }}>
        <KpiCard label="Visitors" value={kpis?.visitors ?? '…'} color={T.accent} />
        <KpiCard label="Signups" value={kpis?.signups ?? '…'} color={T.green} />
        <KpiCard label="Active Trips" value={kpis?.activeTrips ?? '…'} color={T.accent} />
        <KpiCard label="Pro Subscribers" value={kpis?.proSubscribers ?? '…'} color={T.purple} />
        <KpiCard
          label="Estimated MRR"
          value={kpis ? `$${kpis.estimatedMrr.toFixed(2)}` : '…'}
          color={T.yellow}
          tooltip={MRR_TOOLTIP}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'flex', gap: 16, marginTop: 28, marginBottom: 28, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <div style={{
          flex: '2 1 400px', background: T.card, borderRadius: 12,
          border: `1px solid ${T.border}`, padding: '20px 24px',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Signups Over Time</div>
          {signupsChart.length === 0 ? (
            <div style={{ color: T.textDim, fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={signupsChart}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: T.textDim, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v.slice(5)}
                />
                <YAxis
                  tick={{ fill: T.textDim, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius: 8, color: T.text, fontSize: 13,
                  }}
                  labelStyle={{ color: T.textMid }}
                />
                <Line type="monotone" dataKey="count" stroke={T.accent} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: T.accent }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{
          flex: '1 1 220px', background: T.card, borderRadius: 12,
          border: `1px solid ${T.border}`, padding: '20px 24px',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Plan Breakdown</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={72}
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 8, color: T.text, fontSize: 13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: d.color }} />
                <span style={{ color: T.textMid }}>{d.name}</span>
                <span style={{ color: T.text, fontWeight: 700 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{
          flex: '1 1 340px', background: T.card, borderRadius: 12,
          border: `1px solid ${T.border}`, padding: '20px 24px', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Recent Signups</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['User', 'Plan', 'Joined'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', color: T.textDim, fontWeight: 600,
                    paddingBottom: 10, borderBottom: `1px solid ${T.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSignups.length === 0 ? (
                <tr><td colSpan={3} style={{ color: T.textDim, textAlign: 'center', padding: '20px 0' }}>No signups yet</td></tr>
              ) : recentSignups.map((s, i) => (
                <tr key={s.id} style={{ borderTop: i === 0 ? 'none' : `1px solid ${T.border}` }}>
                  <td style={{ padding: '10px 0', color: T.text, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.email || s.full_name || '—'}
                  </td>
                  <td style={{ padding: '10px 0', color: s.plan === 'pro' ? T.accent : T.textMid, fontWeight: s.plan === 'pro' ? 700 : 400 }}>
                    {s.plan || 'free'}
                  </td>
                  <td style={{ padding: '10px 0', color: T.textDim }}>{s.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          flex: '1 1 220px', background: T.card, borderRadius: 12,
          border: `1px solid ${T.border}`, padding: '20px 24px', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Top Countries</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Country', 'Trips'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', color: T.textDim, fontWeight: 600,
                    paddingBottom: 10, borderBottom: `1px solid ${T.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCountries.length === 0 ? (
                <tr><td colSpan={2} style={{ color: T.textDim, textAlign: 'center', padding: '20px 0' }}>No country data yet</td></tr>
              ) : topCountries.map((c, i) => {
                const { flag, name } = countryDisplay(c.country);
                return (
                  <tr key={c.country} style={{ borderTop: i === 0 ? 'none' : `1px solid ${T.border}` }}>
                    <td style={{ padding: '10px 0', color: T.text }}>{flag} {name}</td>
                    <td style={{ padding: '10px 0', color: T.accent, fontWeight: 700 }}>{c.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{
          flex: '1 1 220px', background: T.card, borderRadius: 12,
          border: `1px solid ${T.border}`, padding: '20px 24px', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Top Referrers</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Source', 'Views'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', color: T.textDim, fontWeight: 600,
                    paddingBottom: 10, borderBottom: `1px solid ${T.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topReferrers.length === 0 ? (
                <tr><td colSpan={2} style={{ color: T.textDim, textAlign: 'center', padding: '20px 0' }}>No referrer data yet</td></tr>
              ) : topReferrers.map((r, i) => (
                <tr key={r.referrer} style={{ borderTop: i === 0 ? 'none' : `1px solid ${T.border}` }}>
                  <td style={{ padding: '10px 0', color: T.text, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.referrer}</td>
                  <td style={{ padding: '10px 0', color: T.accent, fontWeight: 700 }}>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
