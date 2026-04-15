import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
  bg: "#0A0F1E", surface: "#111827", card: "#1A2235", cardHover: "#1F2A40",
  border: "#1E2D45", accent: "#00D4FF", accentDim: "#0099BB",
  accentGlow: "rgba(0,212,255,0.15)", green: "#00E5A0", greenDim: "#00A872",
  orange: "#FF8A00", red: "#FF4560", purple: "#7B61FF", yellow: "#FFD600",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};
const PHASE_COLORS = { "Pre-Trip": T.purple, "During Trip": T.accent, "Post-Trip": T.green };
const CATEGORIES = [
  { id: "flight", label: "Flights", icon: "✈️", color: "#00D4FF" },
  { id: "hotel", label: "Accommodation", icon: "🏨", color: "#7B61FF" },
  { id: "food", label: "Food & Drinks", icon: "🍽️", color: "#FF8A00" },
  { id: "transport", label: "Transportation", icon: "🚗", color: "#00E5A0" },
  { id: "activities", label: "Activities", icon: "🏄", color: "#FFD600" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#FF4560" },
  { id: "essentials", label: "Essentials", icon: "🧴", color: "#00B4D8" },
  { id: "health", label: "Health & Safety", icon: "💊", color: "#FF6B9D" },
  { id: "financial", label: "Financial", icon: "💳", color: "#A8DADC" },
  { id: "comms", label: "Communication", icon: "📱", color: "#B5E48C" },
  { id: "tips", label: "Tips", icon: "💵", color: "#CAF0F8" },
  { id: "other", label: "Other", icon: "📦", color: "#ADB5BD" },
];
const PAYMENT_METHODS = ["💳 Credit Card", "🏦 Debit Card", "💵 Cash", "📱 Venmo/PayPal", "🍎 Apple Pay"];
const PHASES = ["Pre-Trip", "During Trip", "Post-Trip"];
const LEG_COLORS = ["#00D4FF", "#7B61FF", "#FF8A00", "#00E5A0", "#FFD600", "#FF4560", "#FF6B9D", "#B5E48C"];

// ─── CURRENCIES ───────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
  { code: "HTG", symbol: "G", name: "Haitian Gourde", flag: "🇭🇹" },
  { code: "DOP", symbol: "RD$", name: "Dominican Peso", flag: "🇩🇴" },
  { code: "COP", symbol: "COL$", name: "Colombian Peso", flag: "🇨🇴" },
  { code: "ARS", symbol: "AR$", name: "Argentine Peso", flag: "🇦🇷" },
  { code: "CLP", symbol: "CL$", name: "Chilean Peso", flag: "🇨🇱" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol", flag: "🇵🇪" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", flag: "🇹🇼" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", flag: "🇮🇱" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", flag: "🇪🇬" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", flag: "🇰🇪" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", flag: "🇬🇭" },
  { code: "MAD", symbol: "MAD", name: "Moroccan Dirham", flag: "🇲🇦" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", flag: "🇵🇱" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", flag: "🇷🇴" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", flag: "🇻🇳" },
  { code: "CUP", symbol: "₱", name: "Cuban Peso", flag: "🇨🇺" },
  { code: "JMD", symbol: "J$", name: "Jamaican Dollar", flag: "🇯🇲" },
  { code: "TTD", symbol: "TT$", name: "Trinidad Dollar", flag: "🇹🇹" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  { code: "CRC", symbol: "₡", name: "Costa Rican Colón", flag: "🇨🇷" },
  { code: "PAB", symbol: "B/.", name: "Panamanian Balboa", flag: "🇵🇦" },
  { code: "GTQ", symbol: "Q", name: "Guatemalan Quetzal", flag: "🇬🇹" },
  { code: "BOB", symbol: "Bs", name: "Bolivian Boliviano", flag: "🇧🇴" },
  { code: "FJD", symbol: "FJ$", name: "Fijian Dollar", flag: "🇫🇯" },
  { code: "XAF", symbol: "FCFA", name: "Central African CFA", flag: "🌍" },
  { code: "XOF", symbol: "CFA", name: "West African CFA", flag: "🌍" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", flag: "🇰🇼" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal", flag: "🇶🇦" },
  { code: "JOD", symbol: "JD", name: "Jordanian Dinar", flag: "🇯🇴" },
  { code: "LBP", symbol: "ل.ل", name: "Lebanese Pound", flag: "🇱🇧" },
  { code: "GEL", symbol: "₾", name: "Georgian Lari", flag: "🇬🇪" },
  { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge", flag: "🇰🇿" },
];
const curByCode = (code) => CURRENCIES.find(c => c.code === code) || CURRENCIES[0];

// ─── DEFAULT DATA ─────────────────────────────────────────────────
const DEFAULT_TRIP = {
  name: "Puerto Rico 2025", destination: "Puerto Rico",
  departureDate: "2025-07-10", returnDate: "2025-07-15",
  budget: 2500, currency: "USD", isMultiLeg: false,
  legs: [{ id: 1, from: "USA", to: "Puerto Rico", departureDate: "2025-07-10", returnDate: "2025-07-15", budget: 2500, currency: "USD" }],
};

const SEED_EXPENSES = [
  { id: 1, title: "American Airlines - Round Trip", amount: 340, category: "flight", phase: "Pre-Trip", date: "2025-07-01", payment: "💳 Credit Card", status: "paid", planned: true, notes: "Seat 14A", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 340, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 2, title: "Airbnb - 5 nights", amount: 620, category: "hotel", phase: "Pre-Trip", date: "2025-07-01", payment: "💳 Credit Card", status: "paid", planned: true, notes: "Condado area", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 620, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 3, title: "Checked Baggage Fee", amount: 35, category: "flight", phase: "Pre-Trip", date: "2025-07-02", payment: "💳 Credit Card", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 35, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 4, title: "Luquillo Beach Excursion", amount: 85, category: "activities", phase: "Pre-Trip", date: "2025-07-03", payment: "💳 Credit Card", status: "pending", planned: true, notes: "Deposit - $30 balance due", refundable: true, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 85, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 5, title: "Uber - Airport to Airbnb", amount: 28, category: "transport", phase: "During Trip", date: "2025-07-10", payment: "📱 Venmo/PayPal", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 28, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 6, title: "La Factoria - Dinner", amount: 94, category: "food", phase: "During Trip", date: "2025-07-10", payment: "💵 Cash", status: "paid", planned: false, notes: "Old San Juan", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 94, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 7, title: "El Yunque Tour", amount: 65, category: "activities", phase: "During Trip", date: "2025-07-11", payment: "💳 Credit Card", status: "paid", planned: true, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 65, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 8, title: "Groceries - Walmart", amount: 42, category: "food", phase: "During Trip", date: "2025-07-11", payment: "💳 Credit Card", status: "paid", planned: false, notes: "Snacks", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 42, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 9, title: "Gas for Rental", amount: 55, category: "transport", phase: "During Trip", date: "2025-07-12", payment: "💵 Cash", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 55, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 10, title: "Arecibo Observatory", amount: 15, category: "activities", phase: "During Trip", date: "2025-07-12", payment: "💵 Cash", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 15, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 11, title: "Souvenir Shopping", amount: 78, category: "shopping", phase: "During Trip", date: "2025-07-13", payment: "💵 Cash", status: "paid", planned: false, notes: "Old San Juan crafts", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 78, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 12, title: "Uber to Airport", amount: 31, category: "transport", phase: "Post-Trip", date: "2025-07-15", payment: "📱 Venmo/PayPal", status: "pending", planned: true, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 31, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
  { id: 13, title: "Airport Lunch", amount: 22, category: "food", phase: "Post-Trip", date: "2025-07-15", payment: "💳 Credit Card", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 22, originalCurrency: "USD", exchangeRate: 1, legId: 1 },
];

// ─── HELPERS ──────────────────────────────────────────────────────
const fmtCur = (n, code = "USD") => { const c = curByCode(code); return `${c.symbol}${Number(n || 0).toFixed(code === "JPY" || code === "KRW" ? 0 : 2)}`; };
const fmt = (n) => fmtCur(n, "USD");
const catById = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[11];
const uid = () => Date.now() + Math.floor(Math.random() * 10000);
function pct(s, b) { return b ? Math.min(100, Math.round((s / b) * 100)) : 0; }
function healthColor(p) { return p < 60 ? T.green : p < 85 ? T.orange : T.red; }
function autoPhase(d, dep, ret) { if (!d || !dep || !ret) return "During Trip"; return d < dep ? "Pre-Trip" : d > ret ? "Post-Trip" : "During Trip"; }
function daysBetween(a, b) { return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000) + 1); }
function tripHealthGrade(u, up, pp) { const s = 100 - Math.max(0, u - 50) * 0.6 - up * 0.25 - pp * 0.15; return s >= 90 ? ["A", T.green] : s >= 80 ? ["B", T.green] : s >= 70 ? ["C", T.yellow] : s >= 60 ? ["D", T.orange] : ["F", T.red]; }

// Auto-assign leg based on expense date
function autoLeg(date, legs) {
  if (!legs || legs.length <= 1) return legs?.[0]?.id || 1;
  for (const leg of legs) {
    if (date >= leg.departureDate && date <= leg.returnDate) return leg.id;
  }
  // Before first leg = first leg, after last = last leg
  if (date < legs[0].departureDate) return legs[0].id;
  return legs[legs.length - 1].id;
}

function loadDataSync(k, fb) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } }
function saveDataSync(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
async function loadData(k, fb) { return loadDataSync(k, fb); }
async function saveData(k, v) { saveDataSync(k, v); }

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────
function PhaseTag({ phase }) { const c = PHASE_COLORS[phase] || T.textDim; return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c, background: c + "22", borderRadius: 4, padding: "2px 7px", textTransform: "uppercase" }}>{phase}</span>; }
function LegTag({ leg, legs }) { const idx = legs.findIndex(l => l.id === leg); const c = LEG_COLORS[idx % LEG_COLORS.length] || T.textDim; const l = legs.find(l2 => l2.id === leg); return l ? <span style={{ fontSize: 10, fontWeight: 700, color: c, background: c + "22", borderRadius: 4, padding: "2px 7px" }}>{l.from}→{l.to}</span> : null; }
function StatusBadge({ status }) { const m = { paid: [T.green, "Paid"], pending: [T.orange, "Pending"], partial: [T.yellow, "Partial"], refund: [T.purple, "Refund"] }; const [c, l] = m[status] || [T.textDim, status]; return <span style={{ fontSize: 10, fontWeight: 700, color: c, background: c + "22", borderRadius: 4, padding: "2px 7px" }}>{l}</span>; }
function ProgressBar({ value, color, height = 6 }) { return <div style={{ background: T.border, borderRadius: 99, height, overflow: "hidden", width: "100%" }}><div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} /></div>; }
function Card({ children, style = {}, onClick }) { const [h, setH] = useState(false); return <div onClick={onClick} style={{ background: h && onClick ? T.cardHover : T.card, borderRadius: 16, padding: 16, border: `1px solid ${T.border}`, cursor: onClick ? "pointer" : "default", transition: "background 0.15s", ...style }} onMouseEnter={() => onClick && setH(true)} onMouseLeave={() => setH(false)}>{children}</div>; }
function BudgetRing({ pct: p, size = 80 }) { const r = (size - 12) / 2, circ = 2 * Math.PI * r, dash = circ * (1 - Math.min(100, p) / 100), c = healthColor(p); return <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={8} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} /><text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" fill={c} fontSize={size > 70 ? 16 : 12} fontWeight={800} style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}>{Math.min(p, 999)}%</text></svg>; }
function DonutChart({ data, size = 140 }) { const total = data.reduce((s, d) => s + d.value, 0); if (!total) return null; const cx = size/2, cy = size/2, r = size * 0.38, sw = size * 0.18; let cum = -90; const arcs = data.map(d => { const a = (d.value / total) * 360, st = cum; cum += a; const s1 = (st * Math.PI) / 180, s2 = ((st + a) * Math.PI) / 180; return { ...d, path: `M ${cx + r * Math.cos(s1)} ${cy + r * Math.sin(s1)} A ${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${cx + r * Math.cos(s2)} ${cy + r * Math.sin(s2)}` }; }); return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{arcs.map((a, i) => <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth={sw} />)}<text x={cx} y={cy - 6} textAnchor="middle" fill={T.text} fontSize={14} fontWeight={900}>{total.toFixed(0)}</text><text x={cx} y={cy + 10} textAnchor="middle" fill={T.textDim} fontSize={9}>entries</text></svg>; }
function AlertBanner({ children, color = T.orange, icon = "⚠️" }) { return <div style={{ background: color + "12", border: `1px solid ${color}44`, borderRadius: 12, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 16 }}>{icon}</span><span style={{ color, fontSize: 13, fontWeight: 700, flex: 1 }}>{children}</span></div>; }
function SegmentedControl({ options, value, onChange, colors }) { return <div style={{ display: "flex", background: T.bg, borderRadius: 10, padding: 3, gap: 2 }}>{options.map(o => <button key={o} onClick={() => onChange(o)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: value === o ? (colors?.[o] || T.accent) + "30" : "transparent", color: value === o ? (colors?.[o] || T.accent) : T.textDim }}>{o}</button>)}</div>; }
function ToggleChip({ label, active, onToggle, activeColor = T.accent }) { return <button onClick={onToggle} style={{ flex: 1, padding: "11px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 13, background: active ? activeColor + "22" : T.card, color: active ? activeColor : T.textMid, border: `1px solid ${active ? activeColor + "66" : T.border}` }}>{label}</button>; }
function BackButton({ onClick, label = "Back" }) { return <button onClick={onClick} style={{ color: T.accent, background: "none", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 600, marginBottom: 16, padding: 0 }}>← {label}</button>; }
const inputStyle = { width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "13px 14px", color: T.text, fontSize: 15, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
function InputRow({ label, children }) { return <div style={{ marginBottom: 14 }}><div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>{children}</div>; }

function CurrencyPicker({ value, onChange, label = "Currency" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const cur = curByCode(value);
  const filtered = CURRENCIES.filter(c => !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ position: "relative" }}>
      <InputRow label={label}>
        <button onClick={() => setOpen(!open)} style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textAlign: "left" }}>
          <span>{cur.flag}</span><span style={{ fontWeight: 700 }}>{cur.code}</span><span style={{ color: T.textDim, fontSize: 12 }}>{cur.name}</span>
          <span style={{ marginLeft: "auto", color: T.textDim }}>▾</span>
        </button>
      </InputRow>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, maxHeight: 260, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", marginTop: -8 }}>
          <div style={{ padding: 8, borderBottom: `1px solid ${T.border}` }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search currency..." autoFocus style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} />
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {filtered.map(c => (
              <button key={c.code} onClick={() => { onChange(c.code); setOpen(false); setSearch(""); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "none", background: c.code === value ? T.accent + "15" : "transparent", cursor: "pointer", color: T.text, fontSize: 14, textAlign: "left" }}>
                <span>{c.flag}</span><span style={{ fontWeight: 700 }}>{c.code}</span><span style={{ color: T.textDim, fontSize: 12, flex: 1 }}>{c.name}</span><span style={{ color: T.textDim, fontSize: 12 }}>{c.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LEG SELECTOR ─────────────────────────────────────────────────
function LegSelector({ trip, activeLegId, onChange }) {
  if (!trip.isMultiLeg || !trip.legs || trip.legs.length <= 1) return null;
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "8px 0", marginBottom: 8 }}>
      <button onClick={() => onChange("all")} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", background: activeLegId === "all" ? T.accent : T.card, color: activeLegId === "all" ? T.bg : T.textMid, border: `1px solid ${activeLegId === "all" ? T.accent : T.border}` }}>🌍 All Legs</button>
      {trip.legs.map((leg, i) => {
        const c = LEG_COLORS[i % LEG_COLORS.length];
        const active = activeLegId === leg.id;
        return (
          <button key={leg.id} onClick={() => onChange(leg.id)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", background: active ? c + "33" : T.card, color: active ? c : T.textDim, border: `1px solid ${active ? c : T.border}` }}>
            {leg.from}→{leg.to}
          </button>
        );
      })}
    </div>
  );
}

// ─── REPORT GENERATOR ─────────────────────────────────────────────
function generateReportHTML(trip, expenses) {
  const cur = curByCode(trip.currency);
  const f = (n) => `${cur.symbol}${Number(n || 0).toFixed(2)}`;
  const total = expenses.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0);
  const paid = expenses.filter(e => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter(e => e.status === "pending" || e.status === "partial").reduce((s, e) => s + e.amount, 0);
  const planned = expenses.filter(e => e.planned).reduce((s, e) => s + e.amount, 0);
  const unplanned = expenses.filter(e => !e.planned).reduce((s, e) => s + e.amount, 0);
  const tripDays = daysBetween(trip.departureDate, trip.returnDate);
  const byCat = CATEGORIES.map(c => ({ ...c, total: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
  const legSection = trip.isMultiLeg && trip.legs.length > 1 ? `<h2>Spending by Leg</h2>${trip.legs.map((leg, i) => { const lt = expenses.filter(e => e.legId === leg.id).reduce((s, e) => s + e.amount, 0); return `<div class="bar-row"><div class="bar-label">${leg.from} → ${leg.to}</div><div class="bar-track"><div class="bar-fill" style="width:${total ? (lt/total*100) : 0}%;background:${LEG_COLORS[i % LEG_COLORS.length]}"></div></div><div class="bar-value">${f(lt)} / ${f(leg.budget)}</div></div>`; }).join("")}` : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Sans',sans-serif;background:#fff;color:#1a1a2e;padding:40px;max-width:800px;margin:0 auto}
    h1{font-size:28px;font-weight:900;margin-bottom:4px}h2{font-size:18px;font-weight:800;margin:28px 0 12px;padding-bottom:6px;border-bottom:2px solid #00D4FF;color:#0A0F1E}
    .subtitle{color:#8A9BC4;font-size:14px;margin-bottom:24px}.grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin:16px 0}
    .stat{background:#f8f9fc;border-radius:12px;padding:14px}.stat-value{font-size:20px;font-weight:900}.stat-label{font-size:11px;color:#8A9BC4;font-weight:600;margin-top:2px}
    table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}th{text-align:left;padding:10px 8px;border-bottom:2px solid #e2e8f0;font-weight:700;font-size:11px;text-transform:uppercase;color:#8A9BC4}
    td{padding:10px 8px;border-bottom:1px solid #f1f5f9}.amount{font-weight:800;text-align:right}
    .bar-row{display:flex;align-items:center;gap:10px;margin:6px 0}.bar-label{width:140px;font-size:13px;font-weight:600}.bar-track{flex:1;height:8px;background:#f1f5f9;border-radius:99px;overflow:hidden}.bar-fill{height:100%;border-radius:99px}.bar-value{width:120px;text-align:right;font-weight:800;font-size:13px}
    .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#8A9BC4;text-align:center}
    @media print{body{padding:20px}}
  </style></head><body>
    <h1>✈️ MyTripMoney Report</h1>
    <p class="subtitle">${trip.name} · ${trip.isMultiLeg ? trip.legs.map(l => l.to).join(" → ") : trip.destination} · ${trip.departureDate} to ${trip.returnDate} (${tripDays} days)${trip.isMultiLeg ? ` · ${trip.legs.length} legs` : ""}</p>
    <h2>Budget Summary</h2>
    <div class="grid">
      <div class="stat"><div class="stat-value" style="color:#00D4FF">${f(total)}</div><div class="stat-label">Total Spent</div></div>
      <div class="stat"><div class="stat-value" style="color:#8A9BC4">${f(trip.budget)}</div><div class="stat-label">Budget</div></div>
      <div class="stat"><div class="stat-value" style="color:${trip.budget-total>=0?'#00E5A0':'#FF4560'}">${f(trip.budget-total)}</div><div class="stat-label">${trip.budget-total>=0?'Remaining':'Over Budget'}</div></div>
      <div class="stat"><div class="stat-value" style="color:#FFD600">${f(total/tripDays)}</div><div class="stat-label">Avg/Day</div></div>
    </div>
    ${legSection}
    <h2>Spending by Category</h2>
    ${byCat.map(c => `<div class="bar-row"><div class="bar-label">${c.icon} ${c.label}</div><div class="bar-track"><div class="bar-fill" style="width:${total?(c.total/total*100):0}%;background:${c.color}"></div></div><div class="bar-value">${f(c.total)}</div></div>`).join("")}
    <h2>All Expenses (${expenses.length})</h2>
    <table><tr><th>Date</th><th>Expense</th><th>Category</th>${trip.isMultiLeg ? "<th>Leg</th>" : ""}<th>Status</th><th style="text-align:right">Amount</th></tr>
    ${sorted.map(e => { const cat = catById(e.category); const leg = trip.legs.find(l => l.id === e.legId); return `<tr><td>${e.date}</td><td><strong>${e.title}</strong></td><td>${cat.icon} ${cat.label}</td>${trip.isMultiLeg ? `<td>${leg ? leg.from+"→"+leg.to : "-"}</td>` : ""}<td>${e.status}</td><td class="amount">${f(e.amount)}</td></tr>`; }).join("")}
    <tr style="font-weight:900;border-top:2px solid #1a1a2e"><td colspan="${trip.isMultiLeg ? 5 : 4}">TOTAL</td><td class="amount">${f(total)}</td></tr></table>
    <div class="footer">Generated by MyTripMoney · ${new Date().toLocaleDateString()} · ${trip.currency} base currency</div>
  </body></html>`;
}

function generateReportText(trip, expenses) {
  const cur = curByCode(trip.currency);
  const f = (n) => `${cur.symbol}${Number(n||0).toFixed(2)}`;
  const total = expenses.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0);
  let text = `${trip.name} - Trip Expense Report\n\n`;
  text += `Destination: ${trip.isMultiLeg ? trip.legs.map(l => l.from + "→" + l.to).join(", ") : trip.destination}\n`;
  text += `Dates: ${trip.departureDate} to ${trip.returnDate}\nBudget: ${f(trip.budget)} ${trip.currency}\nTotal Spent: ${f(total)} ${trip.currency}\nRemaining: ${f(trip.budget - total)} ${trip.currency}\nExpenses: ${expenses.length} entries\n\n`;
  if (trip.isMultiLeg) { text += "--- LEGS ---\n"; trip.legs.forEach(l => { const lt = expenses.filter(e => e.legId === l.id).reduce((s, e) => s + e.amount, 0); text += `${l.from} → ${l.to} (${l.departureDate} to ${l.returnDate}): ${f(lt)} / ${f(l.budget)}\n`; }); text += "\n"; }
  text += "--- EXPENSES ---\n\n";
  expenses.sort((a, b) => a.date.localeCompare(b.date)).forEach(e => { const cat = catById(e.category); text += `${e.date} | ${cat.icon} ${e.title} | ${f(e.amount)} | ${e.status}${e.notes ? " | " + e.notes : ""}\n`; });
  text += `\nGenerated by MyTripMoney`;
  return text;
}

// ─── EMAIL REPORT SCREEN ──────────────────────────────────────────
function EmailReportScreen({ trip, expenses, onBack }) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(`MyTripMoney Report: ${trip.name}`);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);

  const reportText = generateReportText(trip, expenses);
  const encodedBody = encodeURIComponent(reportText);
  const encodedSubject = encodeURIComponent(subject);

  const handleGmail = () => { window.open(`https://mail.google.com/mail/?view=cm&to=${email}&su=${encodedSubject}&body=${encodedBody}`, "_blank"); setSent(true); };
  const handleOutlook = () => { window.open(`https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${encodedSubject}&body=${encodedBody}`, "_blank"); setSent(true); };
  const handleMailto = () => { window.open(`mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`, "_blank"); setSent(true); };
  const handleCopy = () => { navigator.clipboard.writeText(reportText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const handlePrintPDF = () => { const html = generateReportHTML(trip, expenses); const win = window.open("", "_blank"); win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500); };
  const handleDownload = () => { const html = generateReportHTML(trip, expenses); const blob = new Blob([html], { type: "text/html" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `MyTripMoney-${trip.name.replace(/\s+/g, "-")}-Report.html`; a.click(); URL.revokeObjectURL(url); };

  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={onBack} />
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 6 }}>📤 Share Report</div>
      <div style={{ color: T.textMid, fontSize: 13, marginBottom: 24 }}>Send via email, copy, or download as PDF.</div>
      {sent && <div style={{ background: T.green + "22", border: `1px solid ${T.green}44`, borderRadius: 12, padding: 12, marginBottom: 16, color: T.green, fontWeight: 700, textAlign: "center" }}>✅ Email opened! Check your mail app.</div>}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Send via Email</div>
        <InputRow label="Recipient Email"><input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="name@example.com" style={inputStyle} /></InputRow>
        <InputRow label="Subject"><input value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} /></InputRow>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={handleGmail} disabled={!email} style={{ width: "100%", background: email ? "#EA433522" : T.border, color: email ? "#EA4335" : T.textDim, border: `1px solid ${email ? "#EA433544" : T.border}`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: email ? "pointer" : "not-allowed" }}>📧 Send via Gmail</button>
          <button onClick={handleOutlook} disabled={!email} style={{ width: "100%", background: email ? "#0078D422" : T.border, color: email ? "#0078D4" : T.textDim, border: `1px solid ${email ? "#0078D444" : T.border}`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: email ? "pointer" : "not-allowed" }}>📨 Send via Outlook</button>
          <button onClick={handleMailto} disabled={!email} style={{ width: "100%", background: email ? T.card : T.border, color: email ? T.textMid : T.textDim, border: `1px solid ${T.border}`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: email ? "pointer" : "not-allowed" }}>✉️ Default Email App</button>
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Other Options</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={handleCopy} style={{ width: "100%", background: copied ? T.green + "22" : T.accent + "22", color: copied ? T.green : T.accent, border: `1px solid ${copied ? T.green + "44" : T.accent + "44"}`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{copied ? "✅ Copied!" : "📋 Copy Report to Clipboard"}</button>
          <button onClick={handlePrintPDF} style={{ width: "100%", background: T.purple + "22", color: T.purple, border: `1px solid ${T.purple}44`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📄 Save as PDF (Print)</button>
          <button onClick={handleDownload} style={{ width: "100%", background: T.card, color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>💾 Download HTML</button>
        </div>
      </Card>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: preview ? 12 : 0 }}>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Preview</div>
          <button onClick={() => setPreview(!preview)} style={{ color: T.accent, background: "none", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{preview ? "Hide" : "Show"}</button>
        </div>
        {preview && <div style={{ background: T.bg, borderRadius: 8, padding: 12, maxHeight: 200, overflowY: "auto", fontSize: 11, color: T.textMid, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{reportText.slice(0, 800)}...</div>}
      </Card>
    </div>
  );
}

// ─── WELCOME ──────────────────────────────────────────────────────
function WelcomeScreen({ onStart, onCreateTrip }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      
      <div style={{ fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: -1 }}>My<span style={{ color: T.accent }}>Trip</span>Money</div>
      <div style={{ color: T.textMid, fontSize: 15, marginTop: 10, marginBottom: 40, lineHeight: 1.5, maxWidth: 260 }}>Track every dollar — from planning to landing.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
        <button onClick={onCreateTrip} style={{ background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>Start New Trip →</button>
        <button onClick={onStart} style={{ background: "transparent", color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, fontSize: 14, cursor: "pointer" }}>Load Demo Trip</button>
      </div>
      <div style={{ marginTop: 40, display: "flex", gap: 20, color: T.textDim, fontSize: 12, flexWrap: "wrap", justifyContent: "center" }}><span>📴 Offline</span><span>📊 Reports</span><span>🔒 Private</span><span>🌍 Multi-Currency</span><span>🗺️ Multi-Leg</span></div>
    </div>
  );
}

// ─── CREATE TRIP ──────────────────────────────────────────────────
function CreateTripScreen({ onSave }) {
  const [tripType, setTripType] = useState(null); // null, "single", "multi"
  const [form, setForm] = useState({ name: "", destination: "", departureDate: "", returnDate: "", budget: "2500", currency: "USD" });
  const [legs, setLegs] = useState([{ id: 1, from: "", to: "", departureDate: "", returnDate: "", budget: "", currency: "USD" }]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addLeg = () => {
    const lastLeg = legs[legs.length - 1];
    setLegs(l => [...l, { id: uid(), from: lastLeg.to, to: "", departureDate: lastLeg.returnDate, returnDate: "", budget: "", currency: lastLeg.currency }]);
  };
  const removeLeg = (id) => {
    setLegs(prev => {
      const next = prev.filter(x => x.id !== id);
      // Re-cascade from/departureDate after removal
      for (let i = 1; i < next.length; i++) {
        next[i] = { ...next[i], from: next[i - 1].to, departureDate: next[i - 1].returnDate };
      }
      return [...next];
    });
  };
  const updateLeg = (id, k, v) => {
    setLegs(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, [k]: v } : x);
      // Cascade: when "to" or "returnDate" changes, update next leg's "from" and "departureDate"
      for (let i = 1; i < updated.length; i++) {
        updated[i] = { ...updated[i], from: updated[i - 1].to, departureDate: updated[i - 1].returnDate };
      }
      return [...updated];
    });
  };

  const totalDays = form.departureDate && form.returnDate ? daysBetween(form.departureDate, form.returnDate) : 0;

  if (tripType === null) {
    return (
      <div style={{ minHeight: "100vh", padding: "40px 20px 60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 6, textAlign: "center" }}>What kind of trip?</div>
        <div style={{ color: T.textMid, fontSize: 14, marginBottom: 40, textAlign: "center" }}>This helps us set up the right tracking for you.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 340 }}>
          <Card onClick={() => setTripType("single")} style={{ cursor: "pointer", padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
            <div style={{ color: T.text, fontSize: 18, fontWeight: 800, marginBottom: 6 }}>One Destination</div>
            <div style={{ color: T.textMid, fontSize: 13 }}>A single round trip. USA → Puerto Rico → home.</div>
          </Card>
          <Card onClick={() => setTripType("multi")} style={{ cursor: "pointer", padding: 24, textAlign: "center", borderColor: T.purple + "44" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
            <div style={{ color: T.purple, fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Multi-Leg Journey</div>
            <div style={{ color: T.textMid, fontSize: 13 }}>Multiple stops. USA → Cuba → France → home.</div>
          </Card>
        </div>
      </div>
    );
  }

  if (tripType === "single") {
    const ok = form.name && form.destination && form.departureDate && form.returnDate && form.budget;
    return (
      <div style={{ minHeight: "100vh", padding: "40px 20px 60px" }}>
        <BackButton onClick={() => setTripType(null)} label="Back" />
        <div style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 6 }}>📍 Single Trip</div>
        <div style={{ color: T.textMid, fontSize: 14, marginBottom: 30 }}>One destination, one budget.</div>
        <InputRow label="Trip Name"><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Puerto Rico 2025" style={inputStyle} /></InputRow>
        <InputRow label="Destination"><input value={form.destination} onChange={e => set("destination", e.target.value)} placeholder="e.g. San Juan, Puerto Rico" style={inputStyle} /></InputRow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputRow label="Departure"><input type="date" value={form.departureDate} onChange={e => set("departureDate", e.target.value)} style={inputStyle} /></InputRow>
          <InputRow label="Return"><input type="date" value={form.returnDate} onChange={e => set("returnDate", e.target.value)} style={inputStyle} /></InputRow>
        </div>
        {totalDays > 0 && <div style={{ color: T.accent, fontSize: 13, fontWeight: 600, marginBottom: 14, marginTop: -6 }}>📅 {totalDays} day trip</div>}
        <CurrencyPicker value={form.currency} onChange={v => set("currency", v)} label="Trip Currency" />
        <InputRow label={`Budget (${form.currency})`}>
          <div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMid, fontWeight: 700 }}>{curByCode(form.currency).symbol}</span><input value={form.budget} onChange={e => set("budget", e.target.value)} type="number" placeholder="2500" style={{ ...inputStyle, paddingLeft: 36 }} /></div>
        </InputRow>
        <button disabled={!ok} onClick={() => onSave({ ...form, budget: parseFloat(form.budget) || 2500, isMultiLeg: false, legs: [{ id: 1, from: "Home", to: form.destination, departureDate: form.departureDate, returnDate: form.returnDate, budget: parseFloat(form.budget) || 2500, currency: form.currency }] })} style={{ width: "100%", background: ok ? T.accent : T.border, color: ok ? T.bg : T.textDim, border: "none", borderRadius: 14, padding: 16, fontSize: 17, fontWeight: 900, cursor: ok ? "pointer" : "not-allowed", marginTop: 10 }}>Start Tracking →</button>
      </div>
    );
  }

  // Multi-leg
  const totalBudget = legs.reduce((s, l) => s + (parseFloat(l.budget) || 0), 0);
  const allDates = legs.flatMap(l => [l.departureDate, l.returnDate]).filter(Boolean).sort();
  const firstDate = allDates[0] || "";
  const lastDate = allDates[allDates.length - 1] || "";
  const multiName = form.name || (legs.length > 0 ? legs.map(l => l.to).filter(Boolean).join(" → ") : "My Trip");
  const okMulti = form.name && legs.every(l => l.from && l.to && l.departureDate && l.returnDate && l.budget) && legs.length >= 2;

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px 60px" }}>
      <BackButton onClick={() => setTripType(null)} label="Back" />
      <div style={{ fontSize: 28, fontWeight: 900, color: T.purple, marginBottom: 6 }}>🗺️ Multi-Leg Trip</div>
      <div style={{ color: T.textMid, fontSize: 14, marginBottom: 24 }}>Add each leg of your journey.</div>

      <InputRow label="Trip Name"><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Caribbean & Europe 2025" style={inputStyle} /></InputRow>
      <CurrencyPicker value={form.currency} onChange={v => set("currency", v)} label="Base Currency (for totals)" />

      <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, marginTop: 8 }}>Journey Legs</div>

      {legs.map((leg, i) => {
        const isFirst = i === 0;
        const lockedFrom = !isFirst;
        const lockedDepart = !isFirst;
        return (
        <Card key={leg.id} style={{ marginBottom: 12, borderColor: LEG_COLORS[i % LEG_COLORS.length] + "44", background: LEG_COLORS[i % LEG_COLORS.length] + "08" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: LEG_COLORS[i % LEG_COLORS.length], fontSize: 14, fontWeight: 800 }}>Leg {i + 1}{!isFirst && <span style={{ color: T.textDim, fontSize: 11, fontWeight: 400, marginLeft: 6 }}>continues from Leg {i}</span>}</div>
            {legs.length > 1 && i === legs.length - 1 && <button onClick={() => removeLeg(leg.id)} style={{ color: T.red, background: "none", border: "none", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Remove</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>FROM {lockedFrom && "🔒"}</div><input value={leg.from} onChange={e => !lockedFrom && updateLeg(leg.id, "from", e.target.value)} placeholder="e.g. USA" readOnly={lockedFrom} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13, opacity: lockedFrom ? 0.6 : 1, cursor: lockedFrom ? "not-allowed" : "text" }} /></div>
            <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>TO</div><input value={leg.to} onChange={e => updateLeg(leg.id, "to", e.target.value)} placeholder="e.g. Cuba" style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>DEPART {lockedDepart && "🔒"}</div><input type="date" value={leg.departureDate} onChange={e => !lockedDepart && updateLeg(leg.id, "departureDate", e.target.value)} readOnly={lockedDepart} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13, opacity: lockedDepart ? 0.6 : 1, cursor: lockedDepart ? "not-allowed" : "text" }} /></div>
            <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>{i === legs.length - 1 && legs.length >= 2 ? "ARRIVE HOME" : "LEAVE TO"}</div><input type="date" value={leg.returnDate} onChange={e => updateLeg(leg.id, "returnDate", e.target.value)} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>BUDGET</div><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textDim, fontSize: 12 }}>{curByCode(leg.currency).symbol}</span><input value={leg.budget} onChange={e => updateLeg(leg.id, "budget", e.target.value)} type="number" placeholder="0" style={{ ...inputStyle, padding: "10px 12px 10px 28px", fontSize: 13 }} /></div></div>
            <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>CURRENCY</div><select value={leg.currency} onChange={e => updateLeg(leg.id, "currency", e.target.value)} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }}>{CURRENCIES.slice(0, 30).map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select></div>
          </div>
        </Card>
        );
      })}

      <button onClick={addLeg} style={{ width: "100%", background: T.card, color: T.accent, border: `1px dashed ${T.accent}44`, borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>+ Add Another Leg</button>

      {totalBudget > 0 && (
        <Card style={{ marginBottom: 16, background: T.accent + "10", borderColor: T.accent + "33" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: T.textMid, fontSize: 13 }}>Total Budget ({legs.length} legs)</span>
            <span style={{ color: T.accent, fontSize: 18, fontWeight: 900 }}>{fmtCur(totalBudget, form.currency)}</span>
          </div>
          {firstDate && lastDate && <div style={{ color: T.textDim, fontSize: 12, marginTop: 4 }}>{firstDate} → {lastDate} · {daysBetween(firstDate, lastDate)} days</div>}
        </Card>
      )}

      <button disabled={!okMulti} onClick={() => {
        const processedLegs = legs.map(l => ({ ...l, budget: parseFloat(l.budget) || 0 }));
        onSave({ name: form.name || multiName, destination: legs.map(l => l.to).join(", "), departureDate: firstDate, returnDate: lastDate, budget: totalBudget, currency: form.currency, isMultiLeg: true, legs: processedLegs });
      }} style={{ width: "100%", background: okMulti ? T.purple : T.border, color: okMulti ? "#fff" : T.textDim, border: "none", borderRadius: 14, padding: 16, fontSize: 17, fontWeight: 900, cursor: okMulti ? "pointer" : "not-allowed" }}>Start Multi-Leg Trip →</button>
    </div>
  );
}

// ─── QUICK ADD ────────────────────────────────────────────────────
function QuickAddSheet({ onSave, onFullForm, onClose, trip }) {
  const [cat, setCat] = useState("food");
  const [amount, setAmount] = useState("");
  const [saved, setSaved] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const phase = autoPhase(todayStr, trip.departureDate, trip.returnDate);
  const legId = autoLeg(todayStr, trip.legs);
  const handleSave = () => {
    if (!amount) return;
    onSave({ id: uid(), title: catById(cat).label, amount: parseFloat(amount) || 0, category: cat, phase, date: todayStr, payment: "💳 Credit Card", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: parseFloat(amount) || 0, originalCurrency: trip.currency, exchangeRate: 1, legId });
    setSaved(true); setTimeout(() => { setSaved(false); setAmount(""); }, 1200);
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", background: T.bg, borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", border: `1px solid ${T.border}`, borderBottom: "none", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ width: 40, height: 4, background: T.border, borderRadius: 99, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: T.text, fontSize: 20, fontWeight: 900 }}>Quick Add</div>
          <button onClick={onFullForm} style={{ color: T.accent, background: "none", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Full Form →</button>
        </div>
        {saved && <div style={{ background: T.green + "22", border: `1px solid ${T.green}44`, borderRadius: 12, padding: 10, marginBottom: 12, color: T.green, fontWeight: 700, textAlign: "center" }}>✅ Saved!</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 18 }}>
          {CATEGORIES.map(c => <button key={c.id} onClick={() => setCat(c.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 2px", borderRadius: 12, cursor: "pointer", gap: 3, background: cat === c.id ? c.color + "33" : T.card, border: `2px solid ${cat === c.id ? c.color : "transparent"}` }}><span style={{ fontSize: 22 }}>{c.icon}</span><span style={{ fontSize: 8, fontWeight: 700, color: cat === c.id ? c.color : T.textDim }}>{c.label.split(" ")[0]}</span></button>)}
        </div>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: T.accent, fontSize: 24, fontWeight: 900 }}>{curByCode(trip.currency).symbol}</span>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0.00" style={{ ...inputStyle, paddingLeft: 44, fontSize: 28, fontWeight: 900, textAlign: "center", height: 60 }} autoFocus />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", justifyContent: "center" }}>
          {[10, 20, 50, 100, 200].map(n => <button key={n} onClick={() => setAmount(String(n))} style={{ padding: "8px 18px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 99, color: T.textMid, fontSize: 14, cursor: "pointer", fontWeight: 700 }}>{curByCode(trip.currency).symbol}{n}</button>)}
        </div>
        {trip.isMultiLeg && <div style={{ color: T.textDim, fontSize: 12, textAlign: "center", marginBottom: 8 }}>Auto-assigned to: {trip.legs.find(l => l.id === legId)?.from}→{trip.legs.find(l => l.id === legId)?.to}</div>}
        <button onClick={handleSave} style={{ width: "100%", background: amount ? T.accent : T.border, color: amount ? T.bg : T.textDim, border: "none", borderRadius: 14, padding: 16, fontSize: 17, fontWeight: 900, cursor: amount ? "pointer" : "not-allowed" }}>Save Expense</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────
function DashboardScreen({ expenses, trip, setScreen, setSelectedExpense }) {
  const [activeLeg, setActiveLeg] = useState("all");
  const tc = trip.currency;
  const filteredExp = activeLeg === "all" ? expenses : expenses.filter(e => e.legId === activeLeg);
  const activeBudget = activeLeg === "all" ? trip.budget : (trip.legs.find(l => l.id === activeLeg)?.budget || trip.budget);
  const activeDep = activeLeg === "all" ? trip.departureDate : (trip.legs.find(l => l.id === activeLeg)?.departureDate || trip.departureDate);
  const activeRet = activeLeg === "all" ? trip.returnDate : (trip.legs.find(l => l.id === activeLeg)?.returnDate || trip.returnDate);

  const total = filteredExp.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0);
  const pending = filteredExp.filter(e => e.status === "pending" || e.status === "partial").reduce((s, e) => s + e.amount, 0);
  const remaining = activeBudget - total;
  const usedPct = pct(total, activeBudget);
  const color = healthColor(usedPct);
  const tripDays = daysBetween(activeDep, activeRet);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTotal = filteredExp.filter(e => e.date === todayStr).reduce((s, e) => s + e.amount, 0);
  const daysElapsed = Math.max(1, daysBetween(activeDep, todayStr > activeRet ? activeRet : todayStr));
  const dailyRate = total / daysElapsed;
  const projected = dailyRate * tripDays;

  const byCat = CATEGORIES.map(c => ({ ...c, total: filteredExp.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const topCat = byCat[0];
  const dueSoon = filteredExp.filter(e => e.status === "pending" || e.status === "partial");
  const unplannedTotal = filteredExp.filter(e => !e.planned).reduce((s, e) => s + e.amount, 0);
  const [grade, gradeColor] = tripHealthGrade(usedPct, total ? (unplannedTotal / total) * 100 : 0, total ? (pending / total) * 100 : 0);

  const activeLegData = trip.legs.find(l => l.id === activeLeg);
  const headerName = activeLeg === "all" ? trip.name : `${activeLegData?.from} → ${activeLegData?.to}`;

  return (
    <div style={{ padding: "20px 16px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{trip.isMultiLeg ? "Multi-Leg Trip" : "Active Trip"}</div>
          <div style={{ color: T.text, fontSize: 20, fontWeight: 900 }}>{headerName}</div>
          <div style={{ color: T.textMid, fontSize: 12 }}>{activeDep} → {activeRet} · {tripDays}d · {curByCode(tc).flag} {tc}</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: gradeColor + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: gradeColor, border: `2px solid ${gradeColor}44` }}>{grade}</div>
      </div>

      <LegSelector trip={trip} activeLegId={activeLeg} onChange={setActiveLeg} />

      {usedPct >= 100 && <AlertBanner color={T.red} icon="🚨">Over budget by {fmtCur(Math.abs(remaining), tc)}!</AlertBanner>}
      {usedPct >= 85 && usedPct < 100 && <AlertBanner color={T.orange}>At {usedPct}% of budget!</AlertBanner>}

      <Card style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <BudgetRing pct={usedPct} size={90} />
        <div style={{ flex: 1 }}>
          <div style={{ color: T.textMid, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Budget Used</div>
          <div style={{ color, fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{fmtCur(total, tc)}</div>
          <div style={{ color: T.textMid, fontSize: 13 }}>of {fmtCur(activeBudget, tc)}</div>
          <div style={{ marginTop: 6 }}><ProgressBar value={usedPct} color={color} height={5} /></div>
          <div style={{ color: remaining < 0 ? T.red : T.green, fontSize: 12, fontWeight: 700, marginTop: 5 }}>{remaining < 0 ? `Over by ${fmtCur(Math.abs(remaining), tc)}` : `${fmtCur(remaining, tc)} remaining`}</div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["Today", fmtCur(todayTotal, tc), T.yellow, todayStr], ["Pending", fmtCur(pending, tc), T.orange, `${dueSoon.length} items`], ["Avg/Day", fmtCur(dailyRate, tc), T.accent, `${daysElapsed}d`], ["Projected", fmtCur(projected, tc), projected > activeBudget ? T.red : T.green, "full trip"]].map(([l, v, c, sub]) => (
          <Card key={l} style={{ padding: 14 }}><div style={{ color: T.textMid, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{l}</div><div style={{ color: c, fontSize: 22, fontWeight: 900 }}>{v}</div><div style={{ color: T.textDim, fontSize: 11 }}>{sub}</div></Card>
        ))}
      </div>

      {/* Leg breakdown for multi-leg "all" view */}
      {trip.isMultiLeg && activeLeg === "all" && (
        <Card>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>By Leg</div>
          {trip.legs.map((leg, i) => {
            const lt = expenses.filter(e => e.legId === leg.id).reduce((s, e) => s + e.amount, 0);
            const lp = pct(lt, leg.budget);
            return (
              <div key={leg.id} style={{ marginBottom: 12 }} onClick={() => setActiveLeg(leg.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, cursor: "pointer" }}>
                  <span style={{ color: LEG_COLORS[i % LEG_COLORS.length], fontSize: 13, fontWeight: 700 }}>{leg.from} → {leg.to}</span>
                  <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{fmtCur(lt, tc)} / {fmtCur(leg.budget, tc)}</span>
                </div>
                <ProgressBar value={lp} color={LEG_COLORS[i % LEG_COLORS.length]} />
              </div>
            );
          })}
        </Card>
      )}

      {topCat && (
        <Card style={{ background: topCat.color + "18", borderColor: topCat.color + "33" }}>
          <div style={{ color: T.textMid, fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>🏆 Biggest Category</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 32 }}>{topCat.icon}</div>
            <div><div style={{ color: T.text, fontSize: 18, fontWeight: 800 }}>{topCat.label}</div><div style={{ color: topCat.color, fontSize: 22, fontWeight: 900 }}>{fmtCur(topCat.total, tc)}</div></div>
          </div>
        </Card>
      )}

      {dueSoon.length > 0 && (
        <Card style={{ borderColor: T.orange + "44", background: T.orange + "0A" }}>
          <div style={{ color: T.orange, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>⏳ Pending ({dueSoon.length})</div>
          {dueSoon.slice(0, 3).map(e => (
            <div key={e.id} onClick={() => { setSelectedExpense(e); setScreen("expense-detail"); }} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${T.border}`, cursor: "pointer" }}>
              <div><div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{e.title}</div><div style={{ color: T.textMid, fontSize: 11 }}>{e.date}</div></div>
              <div style={{ color: T.orange, fontWeight: 800, fontSize: 15 }}>{fmtCur(e.amount, tc)}</div>
            </div>
          ))}
        </Card>
      )}

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ color: T.text, fontSize: 16, fontWeight: 800 }}>Recent</div>
          <button onClick={() => setScreen("history")} style={{ color: T.accent, background: "none", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>See All</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredExp.slice(-5).reverse().map(e => {
            const cat = catById(e.category);
            return (
              <Card key={e.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }} onClick={() => { setSelectedExpense(e); setScreen("expense-detail"); }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3 }}><PhaseTag phase={e.phase} /><StatusBadge status={e.status} />{trip.isMultiLeg && <LegTag leg={e.legId} legs={trip.legs} />}</div>
                </div>
                <div style={{ color: T.text, fontSize: 16, fontWeight: 800, flexShrink: 0 }}>{fmtCur(e.amount, tc)}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY ──────────────────────────────────────────────────────
function HistoryScreen({ expenses, trip, setScreen, setSelectedExpense }) {
  const tc = trip.currency;
  const [search, setSearch] = useState(""); const [filterPhase, setFilterPhase] = useState("All"); const [filterStatus, setFilterStatus] = useState("All"); const [filterLeg, setFilterLeg] = useState("All"); const [sortBy, setSortBy] = useState("date");
  let filtered = expenses.filter(e => { const ms = !search || e.title.toLowerCase().includes(search.toLowerCase()); const mp = filterPhase === "All" || e.phase === filterPhase; const mst = filterStatus === "All" || e.status === filterStatus; const ml = filterLeg === "All" || e.legId === filterLeg; return ms && mp && mst && ml; });
  if (sortBy === "amount") filtered = [...filtered].sort((a, b) => b.amount - a.amount); else filtered = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const grouped = {}; filtered.forEach(e => { if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e); }); const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: T.text, fontSize: 22, fontWeight: 900 }}>All Expenses</div><div style={{ color: T.textMid, fontSize: 13, fontWeight: 600 }}>{filtered.length}</div>
      </div>
      <div style={{ position: "relative", marginBottom: 12 }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textDim }}>🔍</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, paddingLeft: 42 }} /></div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
        {["All", ...PHASES].map(p => <button key={p} onClick={() => setFilterPhase(p)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", background: filterPhase === p ? T.accent : T.card, color: filterPhase === p ? T.bg : T.textMid, border: `1px solid ${filterPhase === p ? T.accent : T.border}` }}>{p}</button>)}
        <button onClick={() => setSortBy(s => s === "date" ? "amount" : "date")} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", background: T.card, color: T.accent, border: `1px solid ${T.accent}44` }}>{sortBy === "date" ? "📅" : "💰"}</button>
      </div>
      {trip.isMultiLeg && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
          <button onClick={() => setFilterLeg("All")} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer", background: filterLeg === "All" ? T.purple : T.card, color: filterLeg === "All" ? "#fff" : T.textDim, border: `1px solid ${filterLeg === "All" ? T.purple : T.border}` }}>All Legs</button>
          {trip.legs.map((leg, i) => <button key={leg.id} onClick={() => setFilterLeg(leg.id)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer", background: filterLeg === leg.id ? LEG_COLORS[i] + "33" : T.card, color: filterLeg === leg.id ? LEG_COLORS[i] : T.textDim, border: `1px solid ${filterLeg === leg.id ? LEG_COLORS[i] : T.border}` }}>{leg.from}→{leg.to}</button>)}
        </div>
      )}
      {dates.map(date => {
        const dayTotal = grouped[date].reduce((s, e) => s + e.amount, 0);
        return (<div key={date}><div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 8px" }}><div style={{ color: T.textMid, fontSize: 12, fontWeight: 700 }}>{date}</div><div style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{fmtCur(dayTotal, tc)}</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{grouped[date].map(e => { const cat = catById(e.category); return (
            <Card key={e.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }} onClick={() => { setSelectedExpense(e); setScreen("expense-detail"); }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: T.text, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div><div style={{ color: T.textMid, fontSize: 11, marginTop: 2 }}>{e.payment}</div></div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}><div style={{ color: T.text, fontWeight: 800, fontSize: 15 }}>{fmtCur(e.amount, tc)}</div><StatusBadge status={e.status} /></div>
            </Card>); })}</div></div>);
      })}
      {filtered.length === 0 && <div style={{ textAlign: "center", color: T.textDim, marginTop: 60 }}>No expenses found</div>}
    </div>
  );
}

// ─── EXPENSE DETAIL ───────────────────────────────────────────────
function ExpenseDetailScreen({ expense, trip, setScreen, onDelete, onDuplicate, onEdit }) {
  const [confirmDel, setConfirmDel] = useState(false);
  if (!expense) return null;
  const cat = catById(expense.category); const tc = trip.currency; const leg = trip.legs.find(l => l.id === expense.legId);
  const isForeign = expense.originalCurrency && expense.originalCurrency !== tc;
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={() => setScreen("history")} />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{cat.icon}</div>
        <div><div style={{ color: T.text, fontSize: 20, fontWeight: 900 }}>{expense.title}</div><div style={{ color: cat.color, fontSize: 14, fontWeight: 600 }}>{cat.label}</div></div>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.accent, fontSize: 36, fontWeight: 900, marginBottom: 2 }}>{fmtCur(expense.amount, tc)}</div>
        {isForeign && <div style={{ color: T.textMid, fontSize: 14, marginBottom: 8 }}>Originally {curByCode(expense.originalCurrency).symbol}{expense.originalAmount} {expense.originalCurrency} @ {expense.exchangeRate}</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <PhaseTag phase={expense.phase} /><StatusBadge status={expense.status} />
          {trip.isMultiLeg && leg && <LegTag leg={expense.legId} legs={trip.legs} />}
          {expense.planned && <span style={{ fontSize: 10, fontWeight: 700, color: T.purple, background: T.purple + "22", borderRadius: 4, padding: "2px 7px" }}>PLANNED</span>}
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        {[["📅 Date", expense.date], ["💳 Payment", expense.payment], ["🗂️ Category", cat.label], ["🗺️ Phase", expense.phase], trip.isMultiLeg && leg && ["✈️ Leg", `${leg.from} → ${leg.to}`], ["📝 Notes", expense.notes || "—"]].filter(Boolean).map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}><span style={{ color: T.textMid, fontSize: 14 }}>{l}</span><span style={{ color: T.text, fontSize: 14, fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>{v}</span></div>
        ))}
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onEdit(expense)} style={{ flex: 1, background: T.accent + "22", color: T.accent, border: `1px solid ${T.accent}44`, borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>✏️ Edit</button>
          <button onClick={() => onDuplicate(expense)} style={{ flex: 1, background: T.purple + "22", color: T.purple, border: `1px solid ${T.purple}44`, borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>📋 Duplicate</button>
        </div>
        {!confirmDel ? <button onClick={() => setConfirmDel(true)} style={{ width: "100%", background: T.red + "12", color: T.red, border: `1px solid ${T.red}33`, borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>🗑️ Delete</button> : (
          <div style={{ display: "flex", gap: 10 }}><button onClick={() => setConfirmDel(false)} style={{ flex: 1, background: T.card, color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, fontWeight: 700, cursor: "pointer" }}>Cancel</button><button onClick={() => { onDelete(expense.id); setScreen("history"); }} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 14, padding: 14, fontWeight: 900, cursor: "pointer" }}>Confirm</button></div>
        )}
      </div>
    </div>
  );
}

// ─── ADD/EDIT EXPENSE ─────────────────────────────────────────────
function AddExpenseScreen({ onSave, onBack, trip, editExpense = null }) {
  const isEdit = !!editExpense; const todayStr = new Date().toISOString().slice(0, 10); const tc = trip.currency;
  const [form, setForm] = useState(editExpense ? { ...editExpense, amount: String(editExpense.amount), originalAmount: String(editExpense.originalAmount || editExpense.amount), exchangeRate: String(editExpense.exchangeRate || 1) } : {
    title: "", amount: "", category: "food", phase: autoPhase(todayStr, trip.departureDate, trip.returnDate), date: todayStr, payment: "💳 Credit Card", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 2, estimated: "", isDailySummary: false, originalAmount: "", originalCurrency: tc, exchangeRate: "1", legId: autoLeg(todayStr, trip.legs),
  });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const useForeign = form.originalCurrency !== tc;
  const handleDateChange = (v) => { set("date", v); set("phase", autoPhase(v, trip.departureDate, trip.returnDate)); set("legId", autoLeg(v, trip.legs)); };
  const handleForeignAmountChange = (v) => { set("originalAmount", v); set("amount", String(((parseFloat(v) || 0) * (parseFloat(form.exchangeRate) || 1)).toFixed(2))); };
  const handleRateChange = (v) => { set("exchangeRate", v); set("amount", String(((parseFloat(form.originalAmount) || 0) * (parseFloat(v) || 1)).toFixed(2))); };
  const handleSave = () => {
    if (!form.amount && !form.originalAmount) return;
    const title = form.title || catById(form.category).label;
    onSave({ ...form, title, id: isEdit ? form.id : uid(), amount: parseFloat(form.amount) || 0, originalAmount: useForeign ? parseFloat(form.originalAmount) || 0 : parseFloat(form.amount) || 0, exchangeRate: useForeign ? parseFloat(form.exchangeRate) || 1 : 1, estimated: form.estimated ? parseFloat(form.estimated) : 0, sharedCount: form.shared ? Math.max(1, parseInt(form.sharedCount) || 2) : 1 });
    setSaved(true); if (!isEdit) { setTimeout(() => setSaved(false), 1500); setForm(f => ({ ...f, title: "", amount: "", notes: "", originalAmount: "" })); }
  };
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={onBack} />
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>{isEdit ? "Edit Expense" : "Add Expense"}</div>
      {saved && <div style={{ background: T.green + "22", border: `1px solid ${T.green}44`, borderRadius: 12, padding: 12, marginBottom: 16, color: T.green, fontWeight: 700, textAlign: "center" }}>✅ {isEdit ? "Updated!" : "Saved!"}</div>}
      <InputRow label="Category"><div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>{CATEGORIES.map(c => <button key={c.id} onClick={() => set("category", c.id)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 12px", borderRadius: 12, cursor: "pointer", background: form.category === c.id ? c.color + "33" : T.card, border: `2px solid ${form.category === c.id ? c.color : T.border}`, gap: 4 }}><span style={{ fontSize: 22 }}>{c.icon}</span><span style={{ fontSize: 9, fontWeight: 700, color: form.category === c.id ? c.color : T.textDim }}>{c.label.split(" ")[0]}</span></button>)}</div></InputRow>
      <InputRow label="Expense Name"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder={catById(form.category).label} style={inputStyle} /></InputRow>

      <InputRow label="Currency">
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { set("originalCurrency", tc); set("exchangeRate", "1"); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${!useForeign ? T.accent : T.border}`, background: !useForeign ? T.accent + "22" : T.card, color: !useForeign ? T.accent : T.textDim, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{curByCode(tc).flag} {tc}</button>
          <select value={useForeign ? form.originalCurrency : ""} onChange={e => { set("originalCurrency", e.target.value); set("exchangeRate", "1"); }} style={{ ...inputStyle, flex: 2, fontSize: 13 }}>
            <option value="">🌍 Other...</option>{CURRENCIES.filter(c => c.code !== tc).map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
          </select>
        </div>
      </InputRow>

      {useForeign ? (<>
        <InputRow label={`Amount (${form.originalCurrency})`}><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.purple, fontWeight: 700 }}>{curByCode(form.originalCurrency).symbol}</span><input value={form.originalAmount} onChange={e => handleForeignAmountChange(e.target.value)} type="number" placeholder="0.00" style={{ ...inputStyle, paddingLeft: 36 }} /></div></InputRow>
        <InputRow label={`Rate (1 ${form.originalCurrency} = ? ${tc})`}><input value={form.exchangeRate} onChange={e => handleRateChange(e.target.value)} type="number" step="0.0001" style={inputStyle} /></InputRow>
        {form.amount && <div style={{ color: T.accent, fontSize: 14, fontWeight: 700, marginBottom: 14, marginTop: -8 }}>≈ {fmtCur(form.amount, tc)}</div>}
      </>) : (
        <InputRow label={`Amount (${tc})`}><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMid, fontWeight: 700 }}>{curByCode(tc).symbol}</span><input value={form.amount} onChange={e => { set("amount", e.target.value); set("originalAmount", e.target.value); }} type="number" placeholder="0.00" style={{ ...inputStyle, paddingLeft: 36 }} /></div></InputRow>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>{[10, 20, 50, 100, 200].map(n => <button key={n} onClick={() => { if (useForeign) handleForeignAmountChange(String(n)); else { set("amount", String(n)); set("originalAmount", String(n)); } }} style={{ padding: "8px 16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 99, color: T.textMid, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{useForeign ? curByCode(form.originalCurrency).symbol : curByCode(tc).symbol}{n}</button>)}</div>

      {trip.isMultiLeg && (
        <InputRow label="Leg">
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {trip.legs.map((leg, i) => <button key={leg.id} onClick={() => set("legId", leg.id)} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", background: form.legId === leg.id ? LEG_COLORS[i] + "33" : T.card, color: form.legId === leg.id ? LEG_COLORS[i] : T.textDim, border: `1px solid ${form.legId === leg.id ? LEG_COLORS[i] : T.border}` }}>{leg.from}→{leg.to}</button>)}
          </div>
        </InputRow>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <InputRow label="Phase"><SegmentedControl options={PHASES} value={form.phase} onChange={v => set("phase", v)} colors={PHASE_COLORS} /></InputRow>
        <InputRow label="Status"><SegmentedControl options={["paid", "pending", "partial", "refund"]} value={form.status} onChange={v => set("status", v)} colors={{ paid: T.green, pending: T.orange, partial: T.yellow, refund: T.purple }} /></InputRow>
      </div>
      <InputRow label="Payment"><select value={form.payment} onChange={e => set("payment", e.target.value)} style={inputStyle}>{PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}</select></InputRow>
      <InputRow label="Date"><input type="date" value={form.date} onChange={e => handleDateChange(e.target.value)} style={inputStyle} /></InputRow>
      <InputRow label="Notes"><textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Details..." rows={2} style={{ ...inputStyle, resize: "none" }} /></InputRow>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}><ToggleChip label="📋 Planned" active={form.planned} onToggle={() => set("planned", !form.planned)} activeColor={T.purple} /><ToggleChip label="🔄 Refundable" active={form.refundable} onToggle={() => set("refundable", !form.refundable)} activeColor={T.green} /></div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}><ToggleChip label="👥 Shared" active={form.shared} onToggle={() => set("shared", !form.shared)} activeColor={T.yellow} />{form.shared && <div style={{ flex: 1 }}><input value={form.sharedCount} onChange={e => set("sharedCount", e.target.value)} type="number" min="2" placeholder="#" style={{ ...inputStyle, textAlign: "center" }} /></div>}</div>
      <button onClick={handleSave} style={{ width: "100%", background: (form.amount || form.originalAmount) ? T.accent : T.border, color: (form.amount || form.originalAmount) ? T.bg : T.textDim, border: "none", borderRadius: 14, padding: 16, fontSize: 17, fontWeight: 900, cursor: (form.amount || form.originalAmount) ? "pointer" : "not-allowed" }}>{isEdit ? "Update" : "Save Expense"}</button>
    </div>
  );
}

// ─── BUDGET ───────────────────────────────────────────────────────
function BudgetScreen({ expenses, trip }) {
  const tc = trip.currency; const total = expenses.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0); const usedPct = pct(total, trip.budget); const color = healthColor(usedPct); const pending = expenses.filter(e => e.status === "pending" || e.status === "partial").reduce((s, e) => s + e.amount, 0);
  const byCat = CATEGORIES.map(c => ({ ...c, spent: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0), count: expenses.filter(e => e.category === c.id).length })).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent);
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Budget</div>
      {usedPct >= 85 && <div style={{ marginBottom: 12 }}><AlertBanner color={usedPct >= 100 ? T.red : T.orange} icon={usedPct >= 100 ? "🚨" : "⚠️"}>{usedPct >= 100 ? `Over by ${fmtCur(total - trip.budget, tc)}` : `${usedPct}% used`}</AlertBanner></div>}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div><div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Total Budget</div><div style={{ color: T.text, fontSize: 28, fontWeight: 900 }}>{fmtCur(trip.budget, tc)}</div></div><BudgetRing pct={usedPct} size={72} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>{[["Spent", fmtCur(total, tc), color], ["Remaining", fmtCur(Math.max(0, trip.budget - total), tc), T.green], ["Pending", fmtCur(pending, tc), T.orange]].map(([l, v, c]) => <div key={l} style={{ textAlign: "center" }}><div style={{ color: c, fontSize: 16, fontWeight: 900 }}>{v}</div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600 }}>{l}</div></div>)}</div>
      </Card>
      {trip.isMultiLeg && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>By Leg</div>
          {trip.legs.map((leg, i) => { const lt = expenses.filter(e => e.legId === leg.id).reduce((s, e) => s + e.amount, 0); const lp = pct(lt, leg.budget); return (
            <div key={leg.id} style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ color: LEG_COLORS[i], fontWeight: 700, fontSize: 14 }}>{leg.from} → {leg.to}</span><span style={{ color: T.text, fontWeight: 800, fontSize: 14 }}>{fmtCur(lt, tc)} / {fmtCur(leg.budget, tc)}</span></div><ProgressBar value={lp} color={LEG_COLORS[i]} height={8} /></div>
          ); })}
        </Card>
      )}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>By Category</div>
        {byCat.map(c => <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}><div style={{ fontSize: 22, width: 28 }}>{c.icon}</div><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{c.label} ({c.count})</span><span style={{ color: c.color, fontSize: 13, fontWeight: 800 }}>{fmtCur(c.spent, tc)}</span></div><ProgressBar value={total > 0 ? pct(c.spent, total) : 0} color={c.color} height={5} /></div></div>)}
      </Card>
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────
function ReportsScreen({ expenses, trip, setScreen }) {
  const tc = trip.currency; const total = expenses.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0); const paid = expenses.filter(e => e.status === "paid").reduce((s, e) => s + e.amount, 0); const pending = expenses.filter(e => e.status === "pending" || e.status === "partial").reduce((s, e) => s + e.amount, 0); const planned = expenses.filter(e => e.planned).reduce((s, e) => s + e.amount, 0); const unplanned = expenses.filter(e => !e.planned).reduce((s, e) => s + e.amount, 0); const tripDays = daysBetween(trip.departureDate, trip.returnDate);
  const byDay = {}; expenses.forEach(e => { byDay[e.date] = (byDay[e.date] || 0) + e.amount; }); const dayEntries = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)); const maxDay = Math.max(...Object.values(byDay), 1);
  const byCat = CATEGORIES.map(c => ({ ...c, value: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0) })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  const stats = [{ l: "Total", v: fmtCur(total, tc), c: T.accent }, { l: "Budget", v: fmtCur(trip.budget, tc), c: T.textMid }, { l: "Variance", v: fmtCur(trip.budget - total, tc), c: trip.budget - total >= 0 ? T.green : T.red }, { l: "Avg/Day", v: fmtCur(total / tripDays, tc), c: T.yellow }, { l: "Paid", v: fmtCur(paid, tc), c: T.green }, { l: "Pending", v: fmtCur(pending, tc), c: T.orange }, { l: "Planned", v: fmtCur(planned, tc), c: T.purple }, { l: "Unplanned", v: fmtCur(unplanned, tc), c: T.red }];
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Report</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>{stats.map(({ l, v, c }) => <Card key={l} style={{ padding: 14 }}><div style={{ color: c, fontSize: 18, fontWeight: 900 }}>{v}</div><div style={{ color: T.textDim, fontSize: 11, fontWeight: 600, marginTop: 3 }}>{l}</div></Card>)}</div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Daily Spending</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90 }}>{dayEntries.map(([d, a]) => <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><div style={{ fontSize: 8, color: T.textDim, fontWeight: 700 }}>{curByCode(tc).symbol}{Math.round(a)}</div><div style={{ width: "100%", height: Math.max(4, (a / maxDay) * 70), background: T.accent, borderRadius: "3px 3px 1px 1px", opacity: 0.85 }} /><div style={{ fontSize: 8, color: T.textDim }}>{d.slice(5)}</div></div>)}</div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Categories</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <DonutChart data={byCat} size={120} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>{byCat.slice(0, 6).map(c => <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} /><span style={{ color: T.textMid, fontSize: 11, flex: 1 }}>{c.label}</span><span style={{ color: T.text, fontSize: 11, fontWeight: 700 }}>{fmtCur(c.value, tc)}</span></div>)}</div>
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Planned vs Unplanned</div>
        <div style={{ display: "flex", gap: 12 }}>{[[planned, "Planned", T.purple], [unplanned, "Unplanned", T.orange]].map(([v, l, c]) => <div key={l} style={{ flex: 1 }}><div style={{ color: c, fontSize: 20, fontWeight: 900 }}>{fmtCur(v, tc)}</div><div style={{ color: T.textDim, fontSize: 11 }}>{l} ({total > 0 ? Math.round(pct(v, total)) : 0}%)</div><div style={{ marginTop: 6 }}><ProgressBar value={total > 0 ? pct(v, total) : 0} color={c} height={6} /></div></div>)}</div>
      </Card>
      <button onClick={() => setScreen("email-report")} style={{ width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: 15, fontSize: 16, fontWeight: 900, cursor: "pointer" }}>📤 Share Report</button>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────
function SettingsScreen({ trip, onUpdateTrip, onClearData, onBack }) {
  const [form, setForm] = useState({ ...trip, budget: String(trip.budget) });
  const [legs, setLegs] = useState(trip.legs ? trip.legs.map(l => ({ ...l, budget: String(l.budget) })) : []);
  const [confirmClear, setConfirmClear] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateLeg = (id, k, v) => {
    setLegs(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, [k]: v } : x);
      // Cascade from/departureDate to subsequent legs
      for (let i = 1; i < updated.length; i++) {
        updated[i] = { ...updated[i], from: updated[i - 1].to, departureDate: updated[i - 1].returnDate };
      }
      return [...updated];
    });
  };

  const handleSave = () => {
    const processedLegs = legs.map(l => ({ ...l, budget: parseFloat(l.budget) || 0 }));
    const totalBudget = trip.isMultiLeg ? processedLegs.reduce((s, l) => s + l.budget, 0) : parseFloat(form.budget) || 2500;
    const allDates = processedLegs.flatMap(l => [l.departureDate, l.returnDate]).filter(Boolean).sort();
    const firstDate = allDates[0] || form.departureDate;
    const lastDate = allDates[allDates.length - 1] || form.returnDate;
    onUpdateTrip({
      ...form,
      budget: totalBudget,
      legs: processedLegs,
      departureDate: trip.isMultiLeg ? firstDate : form.departureDate,
      returnDate: trip.isMultiLeg ? lastDate : form.returnDate,
      destination: trip.isMultiLeg ? processedLegs.map(l => l.to).join(", ") : form.destination,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={onBack} />
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Settings</div>

      {saved && <div style={{ background: T.green + "22", border: `1px solid ${T.green}44`, borderRadius: 12, padding: 12, marginBottom: 16, color: T.green, fontWeight: 700, textAlign: "center" }}>✅ Changes saved!</div>}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Trip Info</div>
        <InputRow label="Name"><input value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} /></InputRow>
        <CurrencyPicker value={form.currency} onChange={v => set("currency", v)} label="Base Currency" />
        {!trip.isMultiLeg && (
          <>
            <InputRow label="Destination"><input value={form.destination || ""} onChange={e => set("destination", e.target.value)} style={inputStyle} /></InputRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <InputRow label="Departure"><input type="date" value={form.departureDate || ""} onChange={e => set("departureDate", e.target.value)} style={inputStyle} /></InputRow>
              <InputRow label="Return"><input type="date" value={form.returnDate || ""} onChange={e => set("returnDate", e.target.value)} style={inputStyle} /></InputRow>
            </div>
            <InputRow label="Budget"><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMid, fontWeight: 700 }}>{curByCode(form.currency).symbol}</span><input value={form.budget} onChange={e => set("budget", e.target.value)} type="number" style={{ ...inputStyle, paddingLeft: 36 }} /></div></InputRow>
          </>
        )}
      </Card>

      {trip.isMultiLeg && legs.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Edit Legs</div>
          {legs.map((leg, i) => {
            const isFirst = i === 0;
            const locked = !isFirst;
            return (
              <div key={leg.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < legs.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ color: LEG_COLORS[i % LEG_COLORS.length], fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Leg {i + 1}{locked && <span style={{ color: T.textDim, fontSize: 11, fontWeight: 400, marginLeft: 6 }}>continues from Leg {i}</span>}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>FROM {locked && "🔒"}</div><input value={leg.from} readOnly={locked} onChange={e => !locked && updateLeg(leg.id, "from", e.target.value)} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13, opacity: locked ? 0.6 : 1, cursor: locked ? "not-allowed" : "text" }} /></div>
                  <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>TO</div><input value={leg.to} onChange={e => updateLeg(leg.id, "to", e.target.value)} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>DEPART {locked && "🔒"}</div><input type="date" value={leg.departureDate} readOnly={locked} onChange={e => !locked && updateLeg(leg.id, "departureDate", e.target.value)} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13, opacity: locked ? 0.6 : 1, cursor: locked ? "not-allowed" : "text" }} /></div>
                  <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>{i === legs.length - 1 && legs.length >= 2 ? "ARRIVE HOME" : "LEAVE TO"}</div><input type="date" value={leg.returnDate} onChange={e => updateLeg(leg.id, "returnDate", e.target.value)} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>BUDGET</div><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textDim, fontSize: 12 }}>{curByCode(leg.currency).symbol}</span><input value={leg.budget} onChange={e => updateLeg(leg.id, "budget", e.target.value)} type="number" style={{ ...inputStyle, padding: "10px 12px 10px 28px", fontSize: 13 }} /></div></div>
                  <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>CURRENCY</div><select value={leg.currency} onChange={e => updateLeg(leg.id, "currency", e.target.value)} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }}>{CURRENCIES.slice(0, 30).map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select></div>
                </div>
              </div>
            );
          })}
          <div style={{ color: T.textMid, fontSize: 13, marginBottom: 8 }}>Total budget: <span style={{ color: T.accent, fontWeight: 900 }}>{fmtCur(legs.reduce((s, l) => s + (parseFloat(l.budget) || 0), 0), form.currency)}</span></div>
        </Card>
      )}

      <button onClick={handleSave} style={{ width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: 15, fontSize: 16, fontWeight: 900, cursor: "pointer", marginBottom: 16 }}>Save All Changes</button>

      <Card style={{ borderColor: T.red + "33" }}>
        <div style={{ color: T.red, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Danger Zone</div>
        {!confirmClear ? <button onClick={() => setConfirmClear(true)} style={{ width: "100%", background: T.red + "15", color: T.red, border: `1px solid ${T.red}33`, borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🗑️ Clear All Data</button> : (
          <div style={{ display: "flex", gap: 10 }}><button onClick={() => setConfirmClear(false)} style={{ flex: 1, background: T.card, color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button><button onClick={() => { onClearData(); setConfirmClear(false); }} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 12, padding: 12, fontWeight: 900, cursor: "pointer" }}>Confirm</button></div>
        )}
      </Card>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────
const NAV = [{ id: "dashboard", icon: "🏠", label: "Home" }, { id: "history", icon: "📋", label: "History" }, { id: "budget", icon: "💰", label: "Budget" }, { id: "reports", icon: "📊", label: "Reports" }];

export default function TripMoneyApp() {
  const [screen, setScreenRaw] = useState("welcome");
  const [trip, setTrip] = useState(DEFAULT_TRIP);
  const [expenses, setExpenses] = useState(SEED_EXPENSES);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Screen navigation with browser history (fixes phone back button)
  const screenHistory = useRef(["welcome"]);
  const setScreen = useCallback((s) => {
    screenHistory.current.push(s);
    window.history.pushState({ screen: s }, "");
    setScreenRaw(s);
  }, []);

  // Handle phone back button
  useEffect(() => {
    const handlePop = (e) => {
      if (showQuickAdd) { setShowQuickAdd(false); window.history.pushState({}, ""); return; }
      screenHistory.current.pop();
      const prev = screenHistory.current[screenHistory.current.length - 1];
      if (prev && prev !== "welcome") { setScreenRaw(prev); }
      else if (["dashboard", "history", "budget", "reports"].includes(screenHistory.current[screenHistory.current.length - 1])) { setScreenRaw(screenHistory.current[screenHistory.current.length - 1]); }
      else { setScreenRaw("dashboard"); screenHistory.current.push("dashboard"); window.history.pushState({}, ""); }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [showQuickAdd]);

  // Load persisted data
  useEffect(() => {
    const t = loadDataSync("tm-trip", null);
    const e = loadDataSync("tm-expenses", null);
    const s = loadDataSync("tm-screen", null);
    if (t) setTrip(t);
    if (e) setExpenses(e);
    if (s && s !== "welcome" && ["dashboard", "history", "budget", "reports"].includes(s)) {
      setScreenRaw(s);
      screenHistory.current = [s];
    }
    setLoaded(true);
    // Push initial history state
    window.history.replaceState({}, "");
  }, []);

  // Save on change
  useEffect(() => {
    if (!loaded) return;
    saveDataSync("tm-trip", trip);
    saveDataSync("tm-expenses", expenses);
    if (["dashboard", "history", "budget", "reports"].includes(screen)) saveDataSync("tm-screen", screen);
  }, [trip, expenses, screen, loaded]);

  const addExpense = (e) => setExpenses(p => [...p, e]);
  const updateExpense = (e) => setExpenses(p => p.map(x => x.id === e.id ? e : x));
  const deleteExpense = (id) => setExpenses(p => p.filter(x => x.id !== id));
  const duplicateExpense = (e) => { const d = { ...e, id: uid(), date: new Date().toISOString().slice(0, 10), status: "paid" }; addExpense(d); setSelectedExpense(d); };
  const handleEdit = (e) => { setEditExpense(e); setScreen("edit"); };
  const handleEditSave = (e) => { updateExpense(e); setEditExpense(null); setScreen("history"); };
  const isNav = ["dashboard", "history", "budget", "reports"].includes(screen);

  return (
    <div style={{ fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif", background: T.bg, color: T.text, maxWidth: 390, margin: "0 auto", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      {screen !== "welcome" && screen !== "create-trip" && (
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: T.bg + "EE", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ fontSize: 18, fontWeight: 900, color: T.text }}>My</span><span style={{ fontSize: 18, fontWeight: 900, color: T.accent }}>Trip</span><span style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Money</span></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: T.textMid, fontSize: 12 }}>{curByCode(trip.currency).flag} {trip.isMultiLeg ? `${trip.legs.length} legs` : trip.destination}</span>
            <button onClick={() => setScreen("settings")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, color: T.textDim }}>⚙️</button>
          </div>
        </div>
      )}
      <div>
        {screen === "welcome" && <WelcomeScreen onStart={() => { setTrip(DEFAULT_TRIP); setExpenses(SEED_EXPENSES); setScreen("dashboard"); }} onCreateTrip={() => setScreen("create-trip")} />}
        {screen === "create-trip" && <CreateTripScreen onSave={t => { setTrip(t); setExpenses([]); setScreen("dashboard"); }} />}
        {screen === "dashboard" && <DashboardScreen expenses={expenses} trip={trip} setScreen={setScreen} setSelectedExpense={setSelectedExpense} />}
        {screen === "history" && <HistoryScreen expenses={expenses} trip={trip} setScreen={setScreen} setSelectedExpense={setSelectedExpense} />}
        {screen === "add" && <AddExpenseScreen onSave={addExpense} onBack={() => setScreen("dashboard")} trip={trip} />}
        {screen === "edit" && <AddExpenseScreen onSave={handleEditSave} onBack={() => setScreen("expense-detail")} trip={trip} editExpense={editExpense} />}
        {screen === "budget" && <BudgetScreen expenses={expenses} trip={trip} />}
        {screen === "reports" && <ReportsScreen expenses={expenses} trip={trip} setScreen={setScreen} />}
        {screen === "expense-detail" && <ExpenseDetailScreen expense={selectedExpense} trip={trip} setScreen={setScreen} onDelete={deleteExpense} onDuplicate={duplicateExpense} onEdit={handleEdit} />}
        {screen === "settings" && <SettingsScreen trip={trip} onUpdateTrip={setTrip} onClearData={() => { setExpenses([]); setScreen("welcome"); localStorage.clear(); }} onBack={() => setScreen("dashboard")} />}
        {screen === "email-report" && <EmailReportScreen trip={trip} expenses={expenses} onBack={() => setScreen("reports")} />}
      </div>
      {showQuickAdd && <QuickAddSheet onSave={addExpense} onFullForm={() => { setShowQuickAdd(false); setScreen("add"); }} onClose={() => setShowQuickAdd(false)} trip={trip} />}
      {isNav && !showQuickAdd && (
        <div style={{ position: "fixed", bottom: 88, right: "calc(50% - 195px + 16px)", display: "flex", flexDirection: "column", gap: 10, zIndex: 100, alignItems: "flex-end" }}>
          <button onClick={() => setShowQuickAdd(true)} style={{ width: 56, height: 56, borderRadius: "50%", background: T.accent, border: "none", cursor: "pointer", fontSize: 28, fontWeight: 900, color: T.bg, boxShadow: `0 8px 30px ${T.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>+</button>
        </div>
      )}
      {isNav && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: T.surface + "F0", backdropFilter: "blur(16px)", borderTop: `1px solid ${T.border}`, display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {NAV.map(({ id, icon, label }) => <button key={id} onClick={() => setScreen(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", gap: 3 }}><span style={{ fontSize: 20 }}>{icon}</span><span style={{ fontSize: 10, fontWeight: 700, color: screen === id ? T.accent : T.textDim }}>{label}</span>{screen === id && <div style={{ width: 20, height: 2, background: T.accent, borderRadius: 99 }} />}</button>)}
        </div>
      )}
    </div>
  );
}
