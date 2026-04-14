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
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  { code: "JMD", symbol: "J$", name: "Jamaican Dollar", flag: "🇯🇲" },
  { code: "TTD", symbol: "TT$", name: "Trinidad Dollar", flag: "🇹🇹" },
  { code: "XCD", symbol: "EC$", name: "East Caribbean Dollar", flag: "🏝️" },
  { code: "BBD", symbol: "Bds$", name: "Barbadian Dollar", flag: "🇧🇧" },
  { code: "BSD", symbol: "B$", name: "Bahamian Dollar", flag: "🇧🇸" },
  { code: "CRC", symbol: "₡", name: "Costa Rican Colón", flag: "🇨🇷" },
  { code: "PAB", symbol: "B/.", name: "Panamanian Balboa", flag: "🇵🇦" },
  { code: "GTQ", symbol: "Q", name: "Guatemalan Quetzal", flag: "🇬🇹" },
  { code: "HNL", symbol: "L", name: "Honduran Lempira", flag: "🇭🇳" },
  { code: "NIO", symbol: "C$", name: "Nicaraguan Córdoba", flag: "🇳🇮" },
  { code: "UYU", symbol: "$U", name: "Uruguayan Peso", flag: "🇺🇾" },
  { code: "BOB", symbol: "Bs", name: "Bolivian Boliviano", flag: "🇧🇴" },
  { code: "PYG", symbol: "₲", name: "Paraguayan Guarani", flag: "🇵🇾" },
  { code: "VES", symbol: "Bs.S", name: "Venezuelan Bolívar", flag: "🇻🇪" },
  { code: "CUP", symbol: "₱", name: "Cuban Peso", flag: "🇨🇺" },
  { code: "AWG", symbol: "ƒ", name: "Aruban Florin", flag: "🇦🇼" },
  { code: "ANG", symbol: "ƒ", name: "Neth. Antillean Guilder", flag: "🇨🇼" },
  { code: "BZD", symbol: "BZ$", name: "Belize Dollar", flag: "🇧🇿" },
  { code: "SRD", symbol: "SRD", name: "Surinamese Dollar", flag: "🇸🇷" },
  { code: "GYD", symbol: "G$", name: "Guyanese Dollar", flag: "🇬🇾" },
  { code: "FJD", symbol: "FJ$", name: "Fijian Dollar", flag: "🇫🇯" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "ISK", symbol: "kr", name: "Icelandic Króna", flag: "🇮🇸" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", flag: "🇧🇬" },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna", flag: "🇭🇷" },
  { code: "RSD", symbol: "din", name: "Serbian Dinar", flag: "🇷🇸" },
  { code: "GEL", symbol: "₾", name: "Georgian Lari", flag: "🇬🇪" },
  { code: "AMD", symbol: "֏", name: "Armenian Dram", flag: "🇦🇲" },
  { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge", flag: "🇰🇿" },
  { code: "UZS", symbol: "сўм", name: "Uzbekistani Som", flag: "🇺🇿" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", flag: "🇱🇰" },
  { code: "NPR", symbol: "रू", name: "Nepalese Rupee", flag: "🇳🇵" },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat", flag: "🇲🇲" },
  { code: "KHR", symbol: "៛", name: "Cambodian Riel", flag: "🇰🇭" },
  { code: "LAK", symbol: "₭", name: "Lao Kip", flag: "🇱🇦" },
  { code: "BND", symbol: "B$", name: "Brunei Dollar", flag: "🇧🇳" },
  { code: "MNT", symbol: "₮", name: "Mongolian Tugrik", flag: "🇲🇳" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", flag: "🇰🇼" },
  { code: "BHD", symbol: "BD", name: "Bahraini Dinar", flag: "🇧🇭" },
  { code: "OMR", symbol: "﷼", name: "Omani Rial", flag: "🇴🇲" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal", flag: "🇶🇦" },
  { code: "JOD", symbol: "JD", name: "Jordanian Dinar", flag: "🇯🇴" },
  { code: "LBP", symbol: "ل.ل", name: "Lebanese Pound", flag: "🇱🇧" },
  { code: "IQD", symbol: "ع.د", name: "Iraqi Dinar", flag: "🇮🇶" },
  { code: "TND", symbol: "DT", name: "Tunisian Dinar", flag: "🇹🇳" },
  { code: "DZD", symbol: "DA", name: "Algerian Dinar", flag: "🇩🇿" },
  { code: "LYD", symbol: "LD", name: "Libyan Dinar", flag: "🇱🇾" },
  { code: "XAF", symbol: "FCFA", name: "Central African CFA", flag: "🌍" },
  { code: "XOF", symbol: "CFA", name: "West African CFA", flag: "🌍" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", flag: "🇹🇿" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling", flag: "🇺🇬" },
  { code: "RWF", symbol: "FRw", name: "Rwandan Franc", flag: "🇷🇼" },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr", flag: "🇪🇹" },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", flag: "🇿🇲" },
  { code: "MWK", symbol: "MK", name: "Malawian Kwacha", flag: "🇲🇼" },
  { code: "MZN", symbol: "MT", name: "Mozambican Metical", flag: "🇲🇿" },
  { code: "BWP", symbol: "P", name: "Botswana Pula", flag: "🇧🇼" },
  { code: "NAD", symbol: "N$", name: "Namibian Dollar", flag: "🇳🇦" },
  { code: "SZL", symbol: "E", name: "Swazi Lilangeni", flag: "🇸🇿" },
  { code: "LSL", symbol: "M", name: "Lesotho Loti", flag: "🇱🇸" },
  { code: "MUR", symbol: "₨", name: "Mauritian Rupee", flag: "🇲🇺" },
  { code: "SCR", symbol: "₨", name: "Seychellois Rupee", flag: "🇸🇨" },
  { code: "MVR", symbol: "Rf", name: "Maldivian Rufiyaa", flag: "🇲🇻" },
  { code: "XPF", symbol: "₣", name: "CFP Franc", flag: "🏝️" },
  { code: "WST", symbol: "T", name: "Samoan Tala", flag: "🇼🇸" },
  { code: "TOP", symbol: "T$", name: "Tongan Paʻanga", flag: "🇹🇴" },
  { code: "PGK", symbol: "K", name: "Papua New Guinean Kina", flag: "🇵🇬" },
  { code: "SBD", symbol: "SI$", name: "Solomon Islands Dollar", flag: "🇸🇧" },
  { code: "VUV", symbol: "VT", name: "Vanuatu Vatu", flag: "🇻🇺" },
];

const curByCode = (code) => CURRENCIES.find(c => c.code === code) || CURRENCIES[0];

// ─── DEFAULT TRIP ─────────────────────────────────────────────────
const DEFAULT_TRIP = {
  name: "Puerto Rico 2025", destination: "Puerto Rico",
  departureDate: "2025-07-10", returnDate: "2025-07-15",
  budget: 2500, currency: "USD",
};

const SEED_EXPENSES = [
  { id: 1, title: "American Airlines - Round Trip", amount: 340, category: "flight", phase: "Pre-Trip", date: "2025-07-01", payment: "💳 Credit Card", status: "paid", planned: true, notes: "Seat 14A", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 340, originalCurrency: "USD", exchangeRate: 1 },
  { id: 2, title: "Airbnb - 5 nights", amount: 620, category: "hotel", phase: "Pre-Trip", date: "2025-07-01", payment: "💳 Credit Card", status: "paid", planned: true, notes: "Condado area", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 620, originalCurrency: "USD", exchangeRate: 1 },
  { id: 3, title: "Checked Baggage Fee", amount: 35, category: "flight", phase: "Pre-Trip", date: "2025-07-02", payment: "💳 Credit Card", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 35, originalCurrency: "USD", exchangeRate: 1 },
  { id: 4, title: "Luquillo Beach Excursion", amount: 85, category: "activities", phase: "Pre-Trip", date: "2025-07-03", payment: "💳 Credit Card", status: "pending", planned: true, notes: "Deposit - $30 balance due", refundable: true, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 85, originalCurrency: "USD", exchangeRate: 1 },
  { id: 5, title: "Uber - Airport to Airbnb", amount: 28, category: "transport", phase: "During Trip", date: "2025-07-10", payment: "📱 Venmo/PayPal", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 28, originalCurrency: "USD", exchangeRate: 1 },
  { id: 6, title: "La Factoria - Dinner", amount: 94, category: "food", phase: "During Trip", date: "2025-07-10", payment: "💵 Cash", status: "paid", planned: false, notes: "Old San Juan", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 94, originalCurrency: "USD", exchangeRate: 1 },
  { id: 7, title: "El Yunque Tour", amount: 65, category: "activities", phase: "During Trip", date: "2025-07-11", payment: "💳 Credit Card", status: "paid", planned: true, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 65, originalCurrency: "USD", exchangeRate: 1 },
  { id: 8, title: "Groceries - Walmart", amount: 42, category: "food", phase: "During Trip", date: "2025-07-11", payment: "💳 Credit Card", status: "paid", planned: false, notes: "Snacks", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 42, originalCurrency: "USD", exchangeRate: 1 },
  { id: 9, title: "Gas for Rental", amount: 55, category: "transport", phase: "During Trip", date: "2025-07-12", payment: "💵 Cash", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 55, originalCurrency: "USD", exchangeRate: 1 },
  { id: 10, title: "Arecibo Observatory", amount: 15, category: "activities", phase: "During Trip", date: "2025-07-12", payment: "💵 Cash", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 15, originalCurrency: "USD", exchangeRate: 1 },
  { id: 11, title: "Souvenir Shopping", amount: 78, category: "shopping", phase: "During Trip", date: "2025-07-13", payment: "💵 Cash", status: "paid", planned: false, notes: "Old San Juan crafts", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 78, originalCurrency: "USD", exchangeRate: 1 },
  { id: 12, title: "Uber to Airport", amount: 31, category: "transport", phase: "Post-Trip", date: "2025-07-15", payment: "📱 Venmo/PayPal", status: "pending", planned: true, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 31, originalCurrency: "USD", exchangeRate: 1 },
  { id: 13, title: "Airport Lunch", amount: 22, category: "food", phase: "Post-Trip", date: "2025-07-15", payment: "💳 Credit Card", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: 22, originalCurrency: "USD", exchangeRate: 1 },
];

// ─── HELPERS ──────────────────────────────────────────────────────
const fmtCur = (n, code = "USD") => {
  const c = curByCode(code);
  const v = Number(n || 0).toFixed(code === "JPY" || code === "KRW" ? 0 : 2);
  return `${c.symbol}${v}`;
};
const fmt = (n) => fmtCur(n, "USD");
const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[11];
const uid = () => Date.now() + Math.floor(Math.random() * 10000);
function pct(s, b) { return b ? Math.min(100, Math.round((s / b) * 100)) : 0; }
function healthColor(p) { return p < 60 ? T.green : p < 85 ? T.orange : T.red; }
function autoPhase(d, dep, ret) { if (!d || !dep || !ret) return "During Trip"; return d < dep ? "Pre-Trip" : d > ret ? "Post-Trip" : "During Trip"; }
function daysBetween(a, b) { return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000) + 1); }
function tripHealthGrade(u, up, pp) {
  const s = 100 - Math.max(0, u - 50) * 0.6 - up * 0.25 - pp * 0.15;
  return s >= 90 ? ["A", T.green] : s >= 80 ? ["B", T.green] : s >= 70 ? ["C", T.yellow] : s >= 60 ? ["D", T.orange] : ["F", T.red];
}

// Storage (localStorage for PWA)
function loadDataSync(k, fb) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } }
function saveDataSync(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
// Async wrappers for compatibility
async function loadData(k, fb) { return loadDataSync(k, fb); }
async function saveData(k, v) { saveDataSync(k, v); }

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────
function PhaseTag({ phase }) {
  const c = PHASE_COLORS[phase] || T.textDim;
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c, background: c + "22", borderRadius: 4, padding: "2px 7px", textTransform: "uppercase" }}>{phase}</span>;
}
function StatusBadge({ status }) {
  const m = { paid: [T.green, "Paid"], pending: [T.orange, "Pending"], partial: [T.yellow, "Partial"], refund: [T.purple, "Refund"] };
  const [c, l] = m[status] || [T.textDim, status];
  return <span style={{ fontSize: 10, fontWeight: 700, color: c, background: c + "22", borderRadius: 4, padding: "2px 7px" }}>{l}</span>;
}
function ProgressBar({ value, color, height = 6 }) {
  return <div style={{ background: T.border, borderRadius: 99, height, overflow: "hidden", width: "100%" }}><div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} /></div>;
}
function Card({ children, style = {}, onClick }) {
  const [h, setH] = useState(false);
  return <div onClick={onClick} style={{ background: h && onClick ? T.cardHover : T.card, borderRadius: 16, padding: 16, border: `1px solid ${T.border}`, cursor: onClick ? "pointer" : "default", transition: "background 0.15s", ...style }} onMouseEnter={() => onClick && setH(true)} onMouseLeave={() => setH(false)}>{children}</div>;
}
function BudgetRing({ pct: p, size = 80 }) {
  const r = (size - 12) / 2, circ = 2 * Math.PI * r, dash = circ * (1 - Math.min(100, p) / 100), c = healthColor(p);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle" fill={c} fontSize={size > 70 ? 16 : 12} fontWeight={800} style={{ transform: "rotate(90deg)", transformOrigin: `${size / 2}px ${size / 2}px` }}>{Math.min(p, 999)}%</text>
    </svg>
  );
}
function DonutChart({ data, size = 140 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return null;
  const cx = size / 2, cy = size / 2, r = size * 0.38, sw = size * 0.18;
  let cum = -90;
  const arcs = data.map(d => {
    const a = (d.value / total) * 360, st = cum; cum += a;
    const s1 = (st * Math.PI) / 180, s2 = ((st + a) * Math.PI) / 180;
    return { ...d, path: `M ${cx + r * Math.cos(s1)} ${cy + r * Math.sin(s1)} A ${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${cx + r * Math.cos(s2)} ${cy + r * Math.sin(s2)}` };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((a, i) => <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth={sw} />)}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={T.text} fontSize={14} fontWeight={900}>{total.toFixed(0)}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={T.textDim} fontSize={9}>entries</text>
    </svg>
  );
}
function AlertBanner({ children, color = T.orange, icon = "⚠️" }) {
  return <div style={{ background: color + "12", border: `1px solid ${color}44`, borderRadius: 12, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 16 }}>{icon}</span><span style={{ color, fontSize: 13, fontWeight: 700, flex: 1 }}>{children}</span></div>;
}
function SegmentedControl({ options, value, onChange, colors }) {
  return (
    <div style={{ display: "flex", background: T.bg, borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map(o => <button key={o} onClick={() => onChange(o)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: value === o ? (colors?.[o] || T.accent) + "30" : "transparent", color: value === o ? (colors?.[o] || T.accent) : T.textDim }}>{o}</button>)}
    </div>
  );
}
function ToggleChip({ label, active, onToggle, activeColor = T.accent }) {
  return <button onClick={onToggle} style={{ flex: 1, padding: "11px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 13, background: active ? activeColor + "22" : T.card, color: active ? activeColor : T.textMid, border: `1px solid ${active ? activeColor + "66" : T.border}` }}>{label}</button>;
}
function BackButton({ onClick, label = "Back" }) {
  return <button onClick={onClick} style={{ color: T.accent, background: "none", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 600, marginBottom: 16, padding: 0 }}>← {label}</button>;
}
const inputStyle = { width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "13px 14px", color: T.text, fontSize: 15, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
function InputRow({ label, children }) {
  return <div style={{ marginBottom: 14 }}><div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>{children}</div>;
}

// ─── CURRENCY PICKER ──────────────────────────────────────────────
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search currency..." autoFocus
              style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} />
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

// ─── PDF REPORT GENERATOR ─────────────────────────────────────────
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
  const byPhase = PHASES.map(ph => ({ phase: ph, total: expenses.filter(e => e.phase === ph).reduce((s, e) => s + e.amount, 0) }));
  const foreignExpenses = expenses.filter(e => e.originalCurrency && e.originalCurrency !== trip.currency);
  const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #fff; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; font-weight: 900; margin-bottom: 4px; }
    h2 { font-size: 18px; font-weight: 800; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #00D4FF; color: #0A0F1E; }
    h3 { font-size: 14px; font-weight: 700; margin: 16px 0 8px; color: #4A5880; text-transform: uppercase; letter-spacing: 0.5px; }
    .subtitle { color: #8A9BC4; font-size: 14px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin: 16px 0; }
    .stat { background: #f8f9fc; border-radius: 12px; padding: 14px; }
    .stat-value { font-size: 20px; font-weight: 900; }
    .stat-label { font-size: 11px; color: #8A9BC4; font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    th { text-align: left; padding: 10px 8px; border-bottom: 2px solid #e2e8f0; font-weight: 700; font-size: 11px; text-transform: uppercase; color: #8A9BC4; letter-spacing: 0.5px; }
    td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; }
    .amount { font-weight: 800; text-align: right; }
    .phase-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; display: inline-block; }
    .status-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-left: 4px; }
    .bar-row { display: flex; align-items: center; gap: 10px; margin: 6px 0; }
    .bar-label { width: 120px; font-size: 13px; font-weight: 600; }
    .bar-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 99px; }
    .bar-value { width: 80px; text-align: right; font-weight: 800; font-size: 13px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #8A9BC4; text-align: center; }
    .foreign { color: #8A9BC4; font-size: 11px; }
    @media print { body { padding: 20px; } }
  </style></head><body>
    <h1>✈️ TripMoney Report</h1>
    <p class="subtitle">${trip.name} · ${trip.destination} · ${trip.departureDate} to ${trip.returnDate} (${tripDays} days)</p>

    <h2>Budget Summary</h2>
    <div class="grid">
      <div class="stat"><div class="stat-value" style="color:#00D4FF">${f(total)}</div><div class="stat-label">Total Spent</div></div>
      <div class="stat"><div class="stat-value" style="color:#8A9BC4">${f(trip.budget)}</div><div class="stat-label">Budget</div></div>
      <div class="stat"><div class="stat-value" style="color:${trip.budget - total >= 0 ? '#00E5A0' : '#FF4560'}">${f(trip.budget - total)}</div><div class="stat-label">${trip.budget - total >= 0 ? 'Remaining' : 'Over Budget'}</div></div>
      <div class="stat"><div class="stat-value" style="color:#FFD600">${f(total / tripDays)}</div><div class="stat-label">Avg/Day</div></div>
    </div>
    <div class="grid">
      <div class="stat"><div class="stat-value" style="color:#00E5A0">${f(paid)}</div><div class="stat-label">Paid</div></div>
      <div class="stat"><div class="stat-value" style="color:#FF8A00">${f(pending)}</div><div class="stat-label">Pending</div></div>
      <div class="stat"><div class="stat-value" style="color:#7B61FF">${f(planned)}</div><div class="stat-label">Planned</div></div>
      <div class="stat"><div class="stat-value" style="color:#FF4560">${f(unplanned)}</div><div class="stat-label">Unplanned</div></div>
    </div>

    <h2>Spending by Phase</h2>
    ${byPhase.map(p => `<div class="bar-row"><div class="bar-label">${p.phase}</div><div class="bar-track"><div class="bar-fill" style="width:${total ? (p.total / total * 100) : 0}%;background:${PHASE_COLORS[p.phase]}"></div></div><div class="bar-value">${f(p.total)}</div></div>`).join("")}

    <h2>Spending by Category</h2>
    ${byCat.map(c => `<div class="bar-row"><div class="bar-label">${c.icon} ${c.label}</div><div class="bar-track"><div class="bar-fill" style="width:${total ? (c.total / total * 100) : 0}%;background:${c.color}"></div></div><div class="bar-value">${f(c.total)}</div></div>`).join("")}

    <h2>All Expenses (${expenses.length})</h2>
    <table>
      <tr><th>Date</th><th>Expense</th><th>Category</th><th>Phase</th><th>Status</th><th style="text-align:right">Amount</th></tr>
      ${sorted.map(e => {
        const cat = catById(e.category);
        const isForeign = e.originalCurrency && e.originalCurrency !== trip.currency;
        return `<tr>
          <td>${e.date}</td>
          <td><strong>${e.title}</strong>${e.notes ? `<br><span style="color:#8A9BC4;font-size:11px">${e.notes}</span>` : ""}</td>
          <td>${cat.icon} ${cat.label}</td>
          <td><span class="phase-tag" style="color:${PHASE_COLORS[e.phase]};background:${PHASE_COLORS[e.phase]}22">${e.phase}</span></td>
          <td><span class="status-tag" style="color:${e.status === 'paid' ? '#00E5A0' : e.status === 'pending' ? '#FF8A00' : '#7B61FF'};background:${e.status === 'paid' ? '#00E5A022' : e.status === 'pending' ? '#FF8A0022' : '#7B61FF22'}">${e.status}</span></td>
          <td class="amount">${e.status === "refund" ? "-" : ""}${f(e.amount)}${isForeign ? `<br><span class="foreign">(${curByCode(e.originalCurrency).symbol}${e.originalAmount} @ ${e.exchangeRate})</span>` : ""}</td>
        </tr>`;
      }).join("")}
      <tr style="font-weight:900;border-top:2px solid #1a1a2e"><td colspan="5">TOTAL</td><td class="amount">${f(total)}</td></tr>
    </table>

    ${foreignExpenses.length > 0 ? `
    <h2>Foreign Currency Transactions</h2>
    <table>
      <tr><th>Date</th><th>Expense</th><th>Original</th><th>Rate</th><th style="text-align:right">Converted (${trip.currency})</th></tr>
      ${foreignExpenses.map(e => `<tr><td>${e.date}</td><td>${e.title}</td><td>${curByCode(e.originalCurrency).symbol}${e.originalAmount} ${e.originalCurrency}</td><td>${e.exchangeRate}</td><td class="amount">${f(e.amount)}</td></tr>`).join("")}
    </table>` : ""}

    <div class="footer">
      Generated by TripMoney · ${new Date().toLocaleDateString()} · ${trip.currency} base currency
    </div>
  </body></html>`;
}

// ─── EMAIL REPORT SCREEN ──────────────────────────────────────────
function EmailReportScreen({ trip, expenses, onBack }) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(`TripMoney Report: ${trip.name}`);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleSend = () => {
    const html = generateReportHTML(trip, expenses);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Open mailto with report summary in body
    const cur = curByCode(trip.currency);
    const total = expenses.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0);
    const body = encodeURIComponent(
      `${trip.name} - Trip Expense Report\n\n` +
      `Destination: ${trip.destination}\n` +
      `Dates: ${trip.departureDate} to ${trip.returnDate}\n` +
      `Budget: ${cur.symbol}${trip.budget.toFixed(2)} ${trip.currency}\n` +
      `Total Spent: ${cur.symbol}${total.toFixed(2)} ${trip.currency}\n` +
      `Remaining: ${cur.symbol}${(trip.budget - total).toFixed(2)} ${trip.currency}\n` +
      `Expenses: ${expenses.length} entries\n\n` +
      `--- EXPENSE DETAILS ---\n\n` +
      expenses.sort((a, b) => a.date.localeCompare(b.date)).map(e => {
        const cat = catById(e.category);
        const isForeign = e.originalCurrency && e.originalCurrency !== trip.currency;
        return `${e.date} | ${cat.icon} ${e.title} | ${cur.symbol}${e.amount.toFixed(2)}${isForeign ? ` (${curByCode(e.originalCurrency).symbol}${e.originalAmount} ${e.originalCurrency})` : ""} | ${e.status}${e.notes ? ` | ${e.notes}` : ""}`;
      }).join("\n") +
      `\n\n--- SUMMARY ---\n` +
      PHASES.map(ph => `${ph}: ${cur.symbol}${expenses.filter(e => e.phase === ph).reduce((s, e) => s + e.amount, 0).toFixed(2)}`).join("\n") +
      `\n\nGenerated by TripMoney`
    );

    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`, "_blank");
    setSent(true);
  };

  const handleDownload = () => {
    const html = generateReportHTML(trip, expenses);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TripMoney-${trip.name.replace(/\s+/g, "-")}-Report.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    const html = generateReportHTML(trip, expenses);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={onBack} />
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 6 }}>📤 Share Report</div>
      <div style={{ color: T.textMid, fontSize: 13, marginBottom: 24 }}>Email a complete trip report or download as PDF.</div>

      {sent && <div style={{ background: T.green + "22", border: `1px solid ${T.green}44`, borderRadius: 12, padding: "12px", marginBottom: 16, color: T.green, fontWeight: 700, textAlign: "center" }}>✅ Email client opened! Check your mail app.</div>}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Email Report</div>
        <InputRow label="Recipient Email">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="name@example.com" style={inputStyle} />
        </InputRow>
        <InputRow label="Subject">
          <input value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} />
        </InputRow>
        <button onClick={handleSend} disabled={!email} style={{
          width: "100%", background: email ? T.accent : T.border, color: email ? T.bg : T.textDim,
          border: "none", borderRadius: 14, padding: "15px", fontSize: 16, fontWeight: 900, cursor: email ? "pointer" : "not-allowed",
        }}>📧 Open Email with Report</button>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Download Options</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handlePrintPDF} style={{
            width: "100%", background: T.purple + "22", color: T.purple, border: `1px solid ${T.purple}44`,
            borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>📄 Save as PDF (Print)</button>
          <button onClick={handleDownload} style={{
            width: "100%", background: T.card, color: T.accent, border: `1px solid ${T.accent}44`,
            borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>💾 Download HTML Report</button>
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: preview ? 12 : 0 }}>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Report Preview</div>
          <button onClick={() => setPreview(!preview)} style={{ color: T.accent, background: "none", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{preview ? "Hide" : "Show"}</button>
        </div>
        {preview && (
          <div style={{ background: "#fff", borderRadius: 8, padding: 12, maxHeight: 300, overflowY: "auto", fontSize: 11, color: "#1a1a2e" }}>
            {(() => {
              const cur = curByCode(trip.currency);
              const f = (n) => `${cur.symbol}${Number(n || 0).toFixed(2)}`;
              const total = expenses.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0);
              return (
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>✈️ {trip.name}</div>
                  <div style={{ color: "#8A9BC4", marginBottom: 12 }}>{trip.destination} · {trip.departureDate} to {trip.returnDate}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    <div style={{ background: "#f8f9fc", padding: 8, borderRadius: 8 }}><div style={{ fontWeight: 800, color: "#00D4FF" }}>{f(total)}</div><div style={{ fontSize: 10, color: "#8A9BC4" }}>Spent</div></div>
                    <div style={{ background: "#f8f9fc", padding: 8, borderRadius: 8 }}><div style={{ fontWeight: 800, color: trip.budget - total >= 0 ? "#00E5A0" : "#FF4560" }}>{f(trip.budget - total)}</div><div style={{ fontSize: 10, color: "#8A9BC4" }}>Remaining</div></div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#8A9BC4", marginBottom: 6 }}>EXPENSES ({expenses.length})</div>
                  {expenses.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(e => (
                    <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span>{e.date} · {e.title}</span><span style={{ fontWeight: 800 }}>{f(e.amount)}</span>
                    </div>
                  ))}
                  {expenses.length > 5 && <div style={{ color: "#8A9BC4", marginTop: 4 }}>...and {expenses.length - 5} more</div>}
                </div>
              );
            })()}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── SCREENS ──────────────────────────────────────────────────────

function WelcomeScreen({ onStart, onCreateTrip }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>✈️</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: -1 }}>Trip<span style={{ color: T.accent }}>Money</span></div>
      <div style={{ color: T.textMid, fontSize: 15, marginTop: 10, marginBottom: 40, lineHeight: 1.5, maxWidth: 260 }}>Track every dollar — from planning to landing.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
        <button onClick={onCreateTrip} style={{ background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>Start New Trip →</button>
        <button onClick={onStart} style={{ background: "transparent", color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, fontSize: 14, cursor: "pointer" }}>Load Demo Trip</button>
      </div>
      <div style={{ marginTop: 40, display: "flex", gap: 24, color: T.textDim, fontSize: 12 }}><span>📴 Offline</span><span>📊 Reports</span><span>🔒 Private</span><span>🌍 Multi-Currency</span></div>
    </div>
  );
}

function CreateTripScreen({ onSave }) {
  const [form, setForm] = useState({ name: "", destination: "", departureDate: "", returnDate: "", budget: "2500", currency: "USD" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const days = form.departureDate && form.returnDate ? daysBetween(form.departureDate, form.returnDate) : 0;
  const ok = form.name && form.destination && form.departureDate && form.returnDate && form.budget;
  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px 60px" }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 6 }}>New Trip</div>
      <div style={{ color: T.textMid, fontSize: 14, marginBottom: 30 }}>Set up your trip to start tracking.</div>
      <InputRow label="Trip Name"><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Puerto Rico 2025" style={inputStyle} /></InputRow>
      <InputRow label="Destination"><input value={form.destination} onChange={e => set("destination", e.target.value)} placeholder="e.g. San Juan, Puerto Rico" style={inputStyle} /></InputRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <InputRow label="Departure"><input type="date" value={form.departureDate} onChange={e => set("departureDate", e.target.value)} style={inputStyle} /></InputRow>
        <InputRow label="Return"><input type="date" value={form.returnDate} onChange={e => set("returnDate", e.target.value)} style={inputStyle} /></InputRow>
      </div>
      {days > 0 && <div style={{ color: T.accent, fontSize: 13, fontWeight: 600, marginBottom: 14, marginTop: -6 }}>📅 {days} day trip</div>}
      <CurrencyPicker value={form.currency} onChange={v => set("currency", v)} label="Trip Currency" />
      <InputRow label={`Total Budget (${form.currency})`}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMid, fontWeight: 700 }}>{curByCode(form.currency).symbol}</span>
          <input value={form.budget} onChange={e => set("budget", e.target.value)} type="number" placeholder="2500" style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
      </InputRow>
      <button disabled={!ok} onClick={() => onSave({ ...form, budget: parseFloat(form.budget) || 2500 })} style={{ width: "100%", background: ok ? T.accent : T.border, color: ok ? T.bg : T.textDim, border: "none", borderRadius: 14, padding: 16, fontSize: 17, fontWeight: 900, cursor: ok ? "pointer" : "not-allowed", marginTop: 10 }}>Start Tracking →</button>
    </div>
  );
}

function QuickAddSheet({ onSave, onFullForm, onClose, trip }) {
  const [cat, setCat] = useState("food");
  const [amount, setAmount] = useState("");
  const [useForeign, setUseForeign] = useState(false);
  const [foreignCur, setForeignCur] = useState(trip.currency === "USD" ? "EUR" : "USD");
  const [rate, setRate] = useState("1");
  const [saved, setSaved] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const phase = autoPhase(todayStr, trip.departureDate, trip.returnDate);
  const converted = useForeign ? (parseFloat(amount) || 0) * (parseFloat(rate) || 1) : parseFloat(amount) || 0;
  const handleSave = () => {
    if (!amount) return;
    onSave({
      id: uid(), title: catById(cat).label, amount: useForeign ? converted : parseFloat(amount) || 0,
      category: cat, phase, date: todayStr, payment: "💳 Credit Card", status: "paid",
      planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false,
      originalAmount: parseFloat(amount) || 0, originalCurrency: useForeign ? foreignCur : trip.currency,
      exchangeRate: useForeign ? parseFloat(rate) || 1 : 1,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); setAmount(""); }, 1200);
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
        {saved && <div style={{ background: T.green + "22", border: `1px solid ${T.green}44`, borderRadius: 12, padding: 10, marginBottom: 12, color: T.green, fontWeight: 700, textAlign: "center", fontSize: 14 }}>✅ Saved!</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 18 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 2px", borderRadius: 12, cursor: "pointer", gap: 3, background: cat === c.id ? c.color + "33" : T.card, border: `2px solid ${cat === c.id ? c.color : "transparent"}` }}>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: cat === c.id ? c.color : T.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{c.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
        {/* Currency toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => setUseForeign(false)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${!useForeign ? T.accent : T.border}`, background: !useForeign ? T.accent + "22" : T.card, color: !useForeign ? T.accent : T.textDim, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{curByCode(trip.currency).flag} {trip.currency}</button>
          <button onClick={() => setUseForeign(true)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${useForeign ? T.purple : T.border}`, background: useForeign ? T.purple + "22" : T.card, color: useForeign ? T.purple : T.textDim, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🌍 Other Currency</button>
        </div>
        {useForeign && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <select value={foreignCur} onChange={e => setForeignCur(e.target.value)} style={{ ...inputStyle, flex: 1, fontSize: 13 }}>
              {CURRENCIES.filter(c => c.code !== trip.currency).map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
            </select>
            <div style={{ position: "relative", width: 90 }}>
              <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: T.textDim, fontSize: 10, fontWeight: 600 }}>Rate</span>
              <input value={rate} onChange={e => setRate(e.target.value)} type="number" step="0.01" style={{ ...inputStyle, paddingLeft: 36, width: "100%", fontSize: 13 }} />
            </div>
          </div>
        )}
        <div style={{ position: "relative", marginBottom: 8 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: T.accent, fontSize: 24, fontWeight: 900 }}>{useForeign ? curByCode(foreignCur).symbol : curByCode(trip.currency).symbol}</span>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0.00" style={{ ...inputStyle, paddingLeft: 44, fontSize: 28, fontWeight: 900, textAlign: "center", height: 60 }} autoFocus />
        </div>
        {useForeign && amount && <div style={{ color: T.accent, fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>≈ {fmtCur(converted, trip.currency)} {trip.currency}</div>}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", justifyContent: "center" }}>
          {[10, 20, 50, 100, 200].map(n => <button key={n} onClick={() => setAmount(String(n))} style={{ padding: "8px 18px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 99, color: T.textMid, fontSize: 14, cursor: "pointer", fontWeight: 700 }}>{useForeign ? curByCode(foreignCur).symbol : curByCode(trip.currency).symbol}{n}</button>)}
        </div>
        <button onClick={handleSave} style={{ width: "100%", background: amount ? T.accent : T.border, color: amount ? T.bg : T.textDim, border: "none", borderRadius: 14, padding: 16, fontSize: 17, fontWeight: 900, cursor: amount ? "pointer" : "not-allowed" }}>Save Expense</button>
      </div>
    </div>
  );
}

function DashboardScreen({ expenses, trip, setScreen, setSelectedExpense }) {
  const tc = trip.currency;
  const total = expenses.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0);
  const pending = expenses.filter(e => e.status === "pending" || e.status === "partial").reduce((s, e) => s + e.amount, 0);
  const remaining = trip.budget - total;
  const usedPct = pct(total, trip.budget);
  const color = healthColor(usedPct);
  const tripDays = daysBetween(trip.departureDate, trip.returnDate);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTotal = expenses.filter(e => e.date === todayStr).reduce((s, e) => s + e.amount, 0);
  const byPhase = PHASES.map(ph => ({ phase: ph, total: expenses.filter(e => e.phase === ph).reduce((s, e) => s + e.amount, 0) }));
  const byCat = CATEGORIES.map(c => ({ ...c, total: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const topCat = byCat[0];
  const dueSoon = expenses.filter(e => e.status === "pending" || e.status === "partial");
  const unplannedTotal = expenses.filter(e => !e.planned).reduce((s, e) => s + e.amount, 0);
  const [grade, gradeColor] = tripHealthGrade(usedPct, total ? (unplannedTotal / total) * 100 : 0, total ? (pending / total) * 100 : 0);
  const daysElapsed = Math.max(1, daysBetween(trip.departureDate, todayStr > trip.returnDate ? trip.returnDate : todayStr));
  const dailyRate = total / daysElapsed;
  const projected = dailyRate * tripDays;
  const foreignCount = expenses.filter(e => e.originalCurrency && e.originalCurrency !== tc).length;

  return (
    <div style={{ padding: "20px 16px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Active Trip</div>
          <div style={{ color: T.text, fontSize: 22, fontWeight: 900 }}>🇵🇷 {trip.name}</div>
          <div style={{ color: T.textMid, fontSize: 12 }}>{trip.departureDate} → {trip.returnDate} · {tripDays}d · {curByCode(tc).flag} {tc}</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: gradeColor + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: gradeColor, border: `2px solid ${gradeColor}44` }}>{grade}</div>
      </div>
      {usedPct >= 100 && <AlertBanner color={T.red} icon="🚨">Over budget by {fmtCur(Math.abs(remaining), tc)}!</AlertBanner>}
      {usedPct >= 85 && usedPct < 100 && <AlertBanner color={T.orange}>At {usedPct}% of budget. Watch spending!</AlertBanner>}

      <Card style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <BudgetRing pct={usedPct} size={90} />
        <div style={{ flex: 1 }}>
          <div style={{ color: T.textMid, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Budget Used</div>
          <div style={{ color, fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{fmtCur(total, tc)}</div>
          <div style={{ color: T.textMid, fontSize: 13 }}>of {fmtCur(trip.budget, tc)}</div>
          <div style={{ marginTop: 6 }}><ProgressBar value={usedPct} color={color} height={5} /></div>
          <div style={{ color: remaining < 0 ? T.red : T.green, fontSize: 12, fontWeight: 700, marginTop: 5 }}>{remaining < 0 ? `Over by ${fmtCur(Math.abs(remaining), tc)}` : `${fmtCur(remaining, tc)} remaining`}</div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          ["Today", fmtCur(todayTotal, tc), T.yellow, todayStr],
          ["Pending", fmtCur(pending, tc), T.orange, `${dueSoon.length} items`],
          ["Avg/Day", fmtCur(dailyRate, tc), T.accent, `${daysElapsed}d elapsed`],
          ["Projected", fmtCur(projected, tc), projected > trip.budget ? T.red : T.green, `full trip`],
        ].map(([l, v, c, sub]) => (
          <Card key={l} style={{ padding: 14 }}>
            <div style={{ color: T.textMid, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
            <div style={{ color: c, fontSize: 22, fontWeight: 900 }}>{v}</div>
            <div style={{ color: T.textDim, fontSize: 11 }}>{sub}</div>
          </Card>
        ))}
      </div>

      {foreignCount > 0 && (
        <Card style={{ padding: 12, background: T.purple + "10", borderColor: T.purple + "33" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🌍</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>{foreignCount} foreign currency transaction{foreignCount > 1 ? "s" : ""}</div>
              <div style={{ color: T.textDim, fontSize: 11 }}>All converted to {tc} for totals</div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>Trip Phases</div>
        {byPhase.map(({ phase, total: pt }) => (
          <div key={phase} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: PHASE_COLORS[phase], fontSize: 13, fontWeight: 700 }}>{phase}</span>
              <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{fmtCur(pt, tc)}</span>
            </div>
            <ProgressBar value={total > 0 ? pct(pt, total) : 0} color={PHASE_COLORS[phase]} />
          </div>
        ))}
      </Card>

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
            <div key={e.id} onClick={() => { setSelectedExpense(e); setScreen("expense-detail"); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: `1px solid ${T.border}`, cursor: "pointer" }}>
              <div><div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{e.title}</div><div style={{ color: T.textMid, fontSize: 11 }}>{e.phase} · {e.date}</div></div>
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
          {expenses.slice(-5).reverse().map(e => {
            const cat = catById(e.category);
            const isForeign = e.originalCurrency && e.originalCurrency !== tc;
            return (
              <Card key={e.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }} onClick={() => { setSelectedExpense(e); setScreen("expense-detail"); }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}><PhaseTag phase={e.phase} /><StatusBadge status={e.status} /></div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: e.status === "refund" ? T.purple : T.text, fontSize: 16, fontWeight: 800 }}>{e.status === "refund" ? "-" : ""}{fmtCur(e.amount, tc)}</div>
                  {isForeign && <div style={{ color: T.textDim, fontSize: 10 }}>{curByCode(e.originalCurrency).symbol}{e.originalAmount}</div>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HistoryScreen({ expenses, trip, setScreen, setSelectedExpense }) {
  const tc = trip.currency;
  const [search, setSearch] = useState("");
  const [filterPhase, setFilterPhase] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  let filtered = expenses.filter(e => {
    const ms = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.notes?.toLowerCase().includes(search.toLowerCase());
    const mp = filterPhase === "All" || e.phase === filterPhase;
    const mst = filterStatus === "All" || e.status === filterStatus;
    return ms && mp && mst;
  });
  if (sortBy === "amount") filtered = [...filtered].sort((a, b) => b.amount - a.amount);
  else filtered = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const grouped = {}; filtered.forEach(e => { if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e); });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: T.text, fontSize: 22, fontWeight: 900 }}>All Expenses</div>
        <div style={{ color: T.textMid, fontSize: 13, fontWeight: 600 }}>{filtered.length} entries</div>
      </div>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textDim, fontSize: 16 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, paddingLeft: 42 }} />
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
        {["All", ...PHASES].map(p => <button key={p} onClick={() => setFilterPhase(p)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", background: filterPhase === p ? T.accent : T.card, color: filterPhase === p ? T.bg : T.textMid, border: `1px solid ${filterPhase === p ? T.accent : T.border}` }}>{p}</button>)}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
        {["All", "paid", "pending", "partial", "refund"].map(s => <button key={s} onClick={() => setFilterStatus(s)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer", background: filterStatus === s ? T.purple : T.card, color: filterStatus === s ? "#fff" : T.textDim, border: `1px solid ${filterStatus === s ? T.purple : T.border}`, textTransform: "capitalize" }}>{s === "All" ? "All Status" : s}</button>)}
        <button onClick={() => setSortBy(s => s === "date" ? "amount" : "date")} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer", background: T.card, color: T.accent, border: `1px solid ${T.accent}44` }}>{sortBy === "date" ? "📅 Date" : "💰 Amount"}</button>
      </div>
      {dates.map(date => {
        const dayTotal = grouped[date].reduce((s, e) => s + e.amount, 0);
        return (
          <div key={date}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 8px" }}>
              <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{date}</div>
              <div style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{fmtCur(dayTotal, tc)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grouped[date].map(e => {
                const cat = catById(e.category);
                const isForeign = e.originalCurrency && e.originalCurrency !== tc;
                return (
                  <Card key={e.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }} onClick={() => { setSelectedExpense(e); setScreen("expense-detail"); }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: T.text, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                      <div style={{ color: T.textMid, fontSize: 11, marginTop: 2 }}>{e.payment}{isForeign ? ` · ${curByCode(e.originalCurrency).symbol}${e.originalAmount} ${e.originalCurrency}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                      <div style={{ color: e.status === "refund" ? T.purple : T.text, fontWeight: 800, fontSize: 15 }}>{e.status === "refund" ? "-" : ""}{fmtCur(e.amount, tc)}</div>
                      <StatusBadge status={e.status} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && <div style={{ textAlign: "center", color: T.textDim, marginTop: 60, fontSize: 15 }}>No expenses found</div>}
    </div>
  );
}

function ExpenseDetailScreen({ expense, trip, setScreen, onDelete, onDuplicate, onEdit }) {
  const [confirmDel, setConfirmDel] = useState(false);
  if (!expense) return null;
  const cat = catById(expense.category);
  const tc = trip.currency;
  const isForeign = expense.originalCurrency && expense.originalCurrency !== tc;
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={() => setScreen("history")} />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{cat.icon}</div>
        <div><div style={{ color: T.text, fontSize: 20, fontWeight: 900 }}>{expense.title}</div><div style={{ color: cat.color, fontSize: 14, fontWeight: 600 }}>{cat.label}</div></div>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: expense.status === "refund" ? T.purple : T.accent, fontSize: 36, fontWeight: 900, marginBottom: 2 }}>{expense.status === "refund" ? "-" : ""}{fmtCur(expense.amount, tc)}</div>
        {isForeign && <div style={{ color: T.textMid, fontSize: 14, marginBottom: 8 }}>Originally {curByCode(expense.originalCurrency).symbol}{expense.originalAmount} {expense.originalCurrency} @ {expense.exchangeRate}</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <PhaseTag phase={expense.phase} /><StatusBadge status={expense.status} />
          {expense.planned && <span style={{ fontSize: 10, fontWeight: 700, color: T.purple, background: T.purple + "22", borderRadius: 4, padding: "2px 7px" }}>PLANNED</span>}
          {expense.refundable && <span style={{ fontSize: 10, fontWeight: 700, color: T.green, background: T.green + "22", borderRadius: 4, padding: "2px 7px" }}>REFUNDABLE</span>}
          {expense.shared && <span style={{ fontSize: 10, fontWeight: 700, color: T.yellow, background: T.yellow + "22", borderRadius: 4, padding: "2px 7px" }}>SHARED ÷{expense.sharedCount}</span>}
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        {[["📅 Date", expense.date], ["💳 Payment", expense.payment], ["🗂️ Category", cat.label], ["🗺️ Phase", expense.phase], isForeign && ["💱 Currency", `${expense.originalCurrency} → ${tc}`], ["📝 Notes", expense.notes || "—"]].filter(Boolean).map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ color: T.textMid, fontSize: 14 }}>{l}</span><span style={{ color: T.text, fontSize: 14, fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>{v}</span>
          </div>
        ))}
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onEdit(expense)} style={{ flex: 1, background: T.accent + "22", color: T.accent, border: `1px solid ${T.accent}44`, borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>✏️ Edit</button>
          <button onClick={() => onDuplicate(expense)} style={{ flex: 1, background: T.purple + "22", color: T.purple, border: `1px solid ${T.purple}44`, borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>📋 Duplicate</button>
        </div>
        {!confirmDel ? (
          <button onClick={() => setConfirmDel(true)} style={{ width: "100%", background: T.red + "12", color: T.red, border: `1px solid ${T.red}33`, borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>🗑️ Delete</button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmDel(false)} style={{ flex: 1, background: T.card, color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button onClick={() => { onDelete(expense.id); setScreen("history"); }} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 900, cursor: "pointer" }}>Confirm Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

function AddExpenseScreen({ onSave, onBack, trip, editExpense = null }) {
  const isEdit = !!editExpense;
  const todayStr = new Date().toISOString().slice(0, 10);
  const tc = trip.currency;
  const [form, setForm] = useState(editExpense ? { ...editExpense, amount: String(editExpense.amount), estimated: editExpense.estimated ? String(editExpense.estimated) : "", originalAmount: String(editExpense.originalAmount || editExpense.amount), exchangeRate: String(editExpense.exchangeRate || 1) } : {
    title: "", amount: "", category: "food", phase: autoPhase(todayStr, trip.departureDate, trip.returnDate),
    date: todayStr, payment: "💳 Credit Card", status: "paid", planned: false, notes: "", refundable: false,
    shared: false, sharedCount: 2, estimated: "", isDailySummary: false,
    originalAmount: "", originalCurrency: tc, exchangeRate: "1",
  });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const useForeign = form.originalCurrency !== tc;

  const handleDateChange = (v) => { set("date", v); set("phase", autoPhase(v, trip.departureDate, trip.returnDate)); };

  // Auto-calculate converted amount when foreign
  const handleForeignAmountChange = (v) => {
    set("originalAmount", v);
    const converted = (parseFloat(v) || 0) * (parseFloat(form.exchangeRate) || 1);
    set("amount", String(converted.toFixed(2)));
  };
  const handleRateChange = (v) => {
    set("exchangeRate", v);
    const converted = (parseFloat(form.originalAmount) || 0) * (parseFloat(v) || 1);
    set("amount", String(converted.toFixed(2)));
  };

  const handleSave = () => {
    if (!form.amount && !form.originalAmount) return;
    const title = form.title || catById(form.category).label;
    const expense = {
      ...form, title, id: isEdit ? form.id : uid(),
      amount: parseFloat(form.amount) || 0,
      originalAmount: useForeign ? parseFloat(form.originalAmount) || 0 : parseFloat(form.amount) || 0,
      exchangeRate: useForeign ? parseFloat(form.exchangeRate) || 1 : 1,
      estimated: form.estimated ? parseFloat(form.estimated) : 0,
      sharedCount: form.shared ? Math.max(1, parseInt(form.sharedCount) || 2) : 1,
    };
    onSave(expense);
    setSaved(true);
    if (!isEdit) { setTimeout(() => setSaved(false), 1500); setForm(f => ({ ...f, title: "", amount: "", notes: "", estimated: "", originalAmount: "" })); }
  };

  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={onBack} />
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>{isEdit ? "Edit Expense" : "Add Expense"}</div>
      {saved && <div style={{ background: T.green + "22", border: `1px solid ${T.green}44`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: T.green, fontWeight: 700, textAlign: "center" }}>✅ {isEdit ? "Updated!" : "Saved!"}</div>}

      <InputRow label="Category">
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => set("category", c.id)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 12px", borderRadius: 12, cursor: "pointer", background: form.category === c.id ? c.color + "33" : T.card, border: `2px solid ${form.category === c.id ? c.color : T.border}`, gap: 4 }}>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: form.category === c.id ? c.color : T.textDim, whiteSpace: "nowrap" }}>{c.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </InputRow>

      <InputRow label="Expense Name"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder={`e.g. ${catById(form.category).label}...`} style={inputStyle} /></InputRow>

      {/* Currency selection */}
      <InputRow label="Currency">
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { set("originalCurrency", tc); set("exchangeRate", "1"); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${!useForeign ? T.accent : T.border}`, background: !useForeign ? T.accent + "22" : T.card, color: !useForeign ? T.accent : T.textDim, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{curByCode(tc).flag} {tc}</button>
          <select value={useForeign ? form.originalCurrency : ""} onChange={e => { set("originalCurrency", e.target.value); set("exchangeRate", "1"); }}
            style={{ ...inputStyle, flex: 2, fontSize: 13, color: useForeign ? T.purple : T.textDim }}>
            <option value="">🌍 Other currency...</option>
            {CURRENCIES.filter(c => c.code !== tc).map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
          </select>
        </div>
      </InputRow>

      {useForeign ? (
        <>
          <InputRow label={`Amount (${form.originalCurrency})`}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.purple, fontWeight: 700 }}>{curByCode(form.originalCurrency).symbol}</span>
              <input value={form.originalAmount} onChange={e => handleForeignAmountChange(e.target.value)} type="number" placeholder="0.00" style={{ ...inputStyle, paddingLeft: 36 }} />
            </div>
          </InputRow>
          <InputRow label={`Exchange Rate (1 ${form.originalCurrency} = ? ${tc})`}>
            <input value={form.exchangeRate} onChange={e => handleRateChange(e.target.value)} type="number" step="0.0001" placeholder="1.00" style={inputStyle} />
          </InputRow>
          {form.amount && <div style={{ color: T.accent, fontSize: 14, fontWeight: 700, marginBottom: 14, marginTop: -8 }}>≈ {fmtCur(form.amount, tc)} {tc}</div>}
        </>
      ) : (
        <InputRow label={`Amount (${tc})`}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMid, fontWeight: 700 }}>{curByCode(tc).symbol}</span>
            <input value={form.amount} onChange={e => { set("amount", e.target.value); set("originalAmount", e.target.value); }} type="number" placeholder="0.00" style={{ ...inputStyle, paddingLeft: 36 }} />
          </div>
        </InputRow>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[10, 20, 50, 100, 200].map(n => <button key={n} onClick={() => { const v = String(n); if (useForeign) { handleForeignAmountChange(v); } else { set("amount", v); set("originalAmount", v); } }} style={{ padding: "8px 16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 99, color: T.textMid, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{useForeign ? curByCode(form.originalCurrency).symbol : curByCode(tc).symbol}{n}</button>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <InputRow label="Phase"><SegmentedControl options={PHASES} value={form.phase} onChange={v => set("phase", v)} colors={PHASE_COLORS} /></InputRow>
        <InputRow label="Status"><SegmentedControl options={["paid", "pending", "partial", "refund"]} value={form.status} onChange={v => set("status", v)} colors={{ paid: T.green, pending: T.orange, partial: T.yellow, refund: T.purple }} /></InputRow>
      </div>
      <InputRow label="Payment"><select value={form.payment} onChange={e => set("payment", e.target.value)} style={inputStyle}>{PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}</select></InputRow>
      <InputRow label="Date"><input type="date" value={form.date} onChange={e => handleDateChange(e.target.value)} style={inputStyle} /></InputRow>
      <InputRow label="Notes"><textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Details..." rows={2} style={{ ...inputStyle, resize: "none" }} /></InputRow>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <ToggleChip label="📋 Planned" active={form.planned} onToggle={() => set("planned", !form.planned)} activeColor={T.purple} />
        <ToggleChip label="🔄 Refundable" active={form.refundable} onToggle={() => set("refundable", !form.refundable)} activeColor={T.green} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <ToggleChip label="👥 Shared" active={form.shared} onToggle={() => set("shared", !form.shared)} activeColor={T.yellow} />
        {form.shared && <div style={{ flex: 1 }}><input value={form.sharedCount} onChange={e => set("sharedCount", e.target.value)} type="number" min="2" placeholder="# people" style={{ ...inputStyle, textAlign: "center" }} /></div>}
      </div>
      <button onClick={handleSave} style={{ width: "100%", background: (form.amount || form.originalAmount) ? T.accent : T.border, color: (form.amount || form.originalAmount) ? T.bg : T.textDim, border: "none", borderRadius: 14, padding: 16, fontSize: 17, fontWeight: 900, cursor: (form.amount || form.originalAmount) ? "pointer" : "not-allowed" }}>{isEdit ? "Update" : "Save Expense"}</button>
    </div>
  );
}

function DailySummaryScreen({ onSave, onBack, trip, expenses }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const tc = trip.currency;
  const [date, setDate] = useState(todayStr);
  const [total, setTotal] = useState("");
  const [breakdown, setBreakdown] = useState([{ category: "food", amount: "" }, { category: "transport", amount: "" }]);
  const [notes, setNotes] = useState("");
  const phase = autoPhase(date, trip.departureDate, trip.returnDate);
  const existing = expenses.filter(e => e.date === date && !e.isDailySummary);
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={onBack} />
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Daily Summary</div>
      {existing.length > 0 && <AlertBanner color={T.orange}>You have {existing.length} individual entries for this date.</AlertBanner>}
      <InputRow label="Date"><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} /></InputRow>
      <div style={{ color: PHASE_COLORS[phase], fontSize: 12, fontWeight: 700, marginBottom: 14, marginTop: -8 }}>Phase: {phase}</div>
      <InputRow label={`Day Total (${tc})`}>
        <div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMid, fontWeight: 700 }}>{curByCode(tc).symbol}</span><input value={total} onChange={e => setTotal(e.target.value)} type="number" placeholder="0.00" style={{ ...inputStyle, paddingLeft: 28, fontSize: 22, fontWeight: 900 }} /></div>
      </InputRow>
      <InputRow label="Breakdown (optional)">
        {breakdown.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select value={r.category} onChange={e => { const b = [...breakdown]; b[i].category = e.target.value; setBreakdown(b); }} style={{ ...inputStyle, flex: 1 }}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select>
            <div style={{ position: "relative", width: 100 }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textDim }}>{curByCode(tc).symbol}</span><input value={r.amount} onChange={e => { const b = [...breakdown]; b[i].amount = e.target.value; setBreakdown(b); }} type="number" placeholder="0" style={{ ...inputStyle, paddingLeft: 24, width: "100%" }} /></div>
          </div>
        ))}
        <button onClick={() => setBreakdown(b => [...b, { category: "other", amount: "" }])} style={{ color: T.accent, background: "none", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>+ Add category</button>
      </InputRow>
      <InputRow label="Notes"><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How was your day?" rows={2} style={{ ...inputStyle, resize: "none" }} /></InputRow>
      <button onClick={() => { if (!total) return; onSave({ id: uid(), title: `Daily Summary — ${date}`, amount: parseFloat(total) || 0, category: "other", phase, date, payment: "💵 Cash", status: "paid", planned: false, notes: notes + (breakdown.filter(b => b.amount).length ? "\nBreakdown: " + breakdown.filter(b => b.amount).map(b => `${catById(b.category).label}: ${curByCode(tc).symbol}${b.amount}`).join(", ") : ""), refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: true, originalAmount: parseFloat(total) || 0, originalCurrency: tc, exchangeRate: 1 }); onBack(); }} style={{ width: "100%", background: total ? T.accent : T.border, color: total ? T.bg : T.textDim, border: "none", borderRadius: 14, padding: 16, fontSize: 17, fontWeight: 900, cursor: total ? "pointer" : "not-allowed" }}>Save Daily Summary</button>
    </div>
  );
}

function BudgetScreen({ expenses, trip }) {
  const tc = trip.currency;
  const total = expenses.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0);
  const usedPct = pct(total, trip.budget);
  const color = healthColor(usedPct);
  const pending = expenses.filter(e => e.status === "pending" || e.status === "partial").reduce((s, e) => s + e.amount, 0);
  const byCat = CATEGORIES.map(c => ({ ...c, spent: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0), count: expenses.filter(e => e.category === c.id).length })).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent);
  const byPayment = PAYMENT_METHODS.map(m => ({ method: m, spent: expenses.filter(e => e.payment === m).reduce((s, e) => s + e.amount, 0) })).filter(p => p.spent > 0).sort((a, b) => b.spent - a.spent);
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Budget Overview</div>
      {usedPct >= 85 && <div style={{ marginBottom: 12 }}><AlertBanner color={usedPct >= 100 ? T.red : T.orange} icon={usedPct >= 100 ? "🚨" : "⚠️"}>{usedPct >= 100 ? `Over budget by ${fmtCur(total - trip.budget, tc)}` : `${usedPct}% used`}</AlertBanner></div>}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div><div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Total Budget</div><div style={{ color: T.text, fontSize: 28, fontWeight: 900 }}>{fmtCur(trip.budget, tc)}</div></div>
          <BudgetRing pct={usedPct} size={72} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
          {[["Spent", fmtCur(total, tc), color], ["Remaining", fmtCur(Math.max(0, trip.budget - total), tc), T.green], ["Pending", fmtCur(pending, tc), T.orange]].map(([l, v, c]) => <div key={l} style={{ textAlign: "center" }}><div style={{ color: c, fontSize: 16, fontWeight: 900 }}>{v}</div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600 }}>{l}</div></div>)}
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>By Phase</div>
        {PHASES.map(ph => { const pt = expenses.filter(e => e.phase === ph).reduce((s, e) => s + e.amount, 0); const p = total > 0 ? pct(pt, total) : 0; return (
          <div key={ph} style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ color: PHASE_COLORS[ph], fontWeight: 700, fontSize: 14 }}>{ph}</span><span style={{ color: T.text, fontWeight: 800, fontSize: 14 }}>{fmtCur(pt, tc)} <span style={{ color: T.textDim, fontWeight: 400, fontSize: 12 }}>({p}%)</span></span></div><ProgressBar value={p} color={PHASE_COLORS[ph]} height={8} /></div>
        ); })}
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>By Category</div>
        {byCat.map(c => <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}><div style={{ fontSize: 22, width: 28 }}>{c.icon}</div><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{c.label} <span style={{ color: T.textDim, fontSize: 11 }}>({c.count})</span></span><span style={{ color: c.color, fontSize: 13, fontWeight: 800 }}>{fmtCur(c.spent, tc)}</span></div><ProgressBar value={total > 0 ? pct(c.spent, total) : 0} color={c.color} height={5} /></div></div>)}
      </Card>
      <Card>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>By Payment</div>
        {byPayment.map(({ method, spent }) => <div key={method} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}><span style={{ color: T.text, fontSize: 14 }}>{method}</span><span style={{ color: T.accent, fontSize: 14, fontWeight: 800 }}>{fmtCur(spent, tc)}</span></div>)}
      </Card>
    </div>
  );
}

function ReportsScreen({ expenses, trip, setScreen }) {
  const tc = trip.currency;
  const total = expenses.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0);
  const paid = expenses.filter(e => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter(e => e.status === "pending" || e.status === "partial").reduce((s, e) => s + e.amount, 0);
  const planned = expenses.filter(e => e.planned).reduce((s, e) => s + e.amount, 0);
  const unplanned = expenses.filter(e => !e.planned).reduce((s, e) => s + e.amount, 0);
  const tripDays = daysBetween(trip.departureDate, trip.returnDate);
  const byDay = {}; expenses.forEach(e => { byDay[e.date] = (byDay[e.date] || 0) + e.amount; }); const dayEntries = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)); const maxDay = Math.max(...Object.values(byDay), 1);
  const byCat = CATEGORIES.map(c => ({ ...c, value: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0) })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  const stats = [
    { l: "Total Cost", v: fmtCur(total, tc), c: T.accent }, { l: "Budget", v: fmtCur(trip.budget, tc), c: T.textMid },
    { l: "Variance", v: fmtCur(trip.budget - total, tc), c: trip.budget - total >= 0 ? T.green : T.red }, { l: "Avg/Day", v: fmtCur(total / tripDays, tc), c: T.yellow },
    { l: "Paid", v: fmtCur(paid, tc), c: T.green }, { l: "Pending", v: fmtCur(pending, tc), c: T.orange },
    { l: "Planned", v: fmtCur(planned, tc), c: T.purple }, { l: "Unplanned", v: fmtCur(unplanned, tc), c: T.red },
  ];
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Trip Report</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>{stats.map(({ l, v, c }) => <Card key={l} style={{ padding: 14 }}><div style={{ color: c, fontSize: 18, fontWeight: 900 }}>{v}</div><div style={{ color: T.textDim, fontSize: 11, fontWeight: 600, marginTop: 3 }}>{l}</div></Card>)}</div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Daily Spending</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>{dayEntries.map(([d, a]) => <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><div style={{ fontSize: 9, color: T.textDim, fontWeight: 700 }}>{curByCode(tc).symbol}{Math.round(a)}</div><div style={{ width: "100%", height: Math.max(6, (a / maxDay) * 75), background: `linear-gradient(180deg, ${T.accent}, ${T.accent}66)`, borderRadius: "4px 4px 2px 2px" }} /><div style={{ fontSize: 9, color: T.textDim }}>{d.slice(5)}</div></div>)}</div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Categories</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <DonutChart data={byCat} size={130} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>{byCat.slice(0, 6).map(c => <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} /><span style={{ color: T.textMid, fontSize: 11, flex: 1 }}>{c.label}</span><span style={{ color: T.text, fontSize: 11, fontWeight: 700 }}>{fmtCur(c.value, tc)}</span></div>)}</div>
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Planned vs Unplanned</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[[planned, "Planned", T.purple], [unplanned, "Unplanned", T.orange]].map(([v, l, c]) => <div key={l} style={{ flex: 1 }}><div style={{ color: c, fontSize: 20, fontWeight: 900 }}>{fmtCur(v, tc)}</div><div style={{ color: T.textDim, fontSize: 11 }}>{l} ({total > 0 ? Math.round(pct(v, total)) : 0}%)</div><div style={{ marginTop: 6 }}><ProgressBar value={total > 0 ? pct(v, total) : 0} color={c} height={6} /></div></div>)}
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Paid vs Pending</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[[paid, "Paid", T.green], [pending, "Pending", T.orange]].map(([v, l, c]) => <div key={l} style={{ flex: 1 }}><div style={{ color: c, fontSize: 20, fontWeight: 900 }}>{fmtCur(v, tc)}</div><div style={{ color: T.textDim, fontSize: 11 }}>{l} ({total > 0 ? Math.round(pct(v, total)) : 0}%)</div><div style={{ marginTop: 6 }}><ProgressBar value={total > 0 ? pct(v, total) : 0} color={c} height={6} /></div></div>)}
        </div>
      </Card>
      <button onClick={() => setScreen("email-report")} style={{ width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: 15, fontSize: 16, fontWeight: 900, cursor: "pointer", marginBottom: 10 }}>📤 Email / Download Report</button>
    </div>
  );
}

function SettingsScreen({ trip, onUpdateTrip, onClearData, onBack }) {
  const [form, setForm] = useState({ ...trip, budget: String(trip.budget) });
  const [confirmClear, setConfirmClear] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={onBack} />
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Settings</div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Trip Info</div>
        <InputRow label="Name"><input value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} /></InputRow>
        <InputRow label="Destination"><input value={form.destination} onChange={e => set("destination", e.target.value)} style={inputStyle} /></InputRow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputRow label="Departure"><input type="date" value={form.departureDate} onChange={e => set("departureDate", e.target.value)} style={inputStyle} /></InputRow>
          <InputRow label="Return"><input type="date" value={form.returnDate} onChange={e => set("returnDate", e.target.value)} style={inputStyle} /></InputRow>
        </div>
        <CurrencyPicker value={form.currency} onChange={v => set("currency", v)} label="Trip Currency" />
        <InputRow label="Budget"><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMid, fontWeight: 700 }}>{curByCode(form.currency).symbol}</span><input value={form.budget} onChange={e => set("budget", e.target.value)} type="number" style={{ ...inputStyle, paddingLeft: 36 }} /></div></InputRow>
        <button onClick={() => onUpdateTrip({ ...form, budget: parseFloat(form.budget) || 2500 })} style={{ width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>Save Changes</button>
      </Card>
      <Card style={{ borderColor: T.red + "33" }}>
        <div style={{ color: T.red, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Danger Zone</div>
        {!confirmClear ? <button onClick={() => setConfirmClear(true)} style={{ width: "100%", background: T.red + "15", color: T.red, border: `1px solid ${T.red}33`, borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🗑️ Clear All Data</button> : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmClear(false)} style={{ flex: 1, background: T.card, color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button onClick={() => { onClearData(); setConfirmClear(false); }} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 900, cursor: "pointer" }}>Confirm Clear</button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── NAV & APP ────────────────────────────────────────────────────
const NAV = [{ id: "dashboard", icon: "🏠", label: "Home" }, { id: "history", icon: "📋", label: "History" }, { id: "budget", icon: "💰", label: "Budget" }, { id: "reports", icon: "📊", label: "Reports" }];

export default function TripMoneyApp() {
  const [screen, setScreen] = useState("welcome");
  const [trip, setTrip] = useState(DEFAULT_TRIP);
  const [expenses, setExpenses] = useState(SEED_EXPENSES);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { (async () => { const t = await loadData("tm-trip", null); const e = await loadData("tm-expenses", null); const s = await loadData("tm-screen", null); if (t) setTrip(t); if (e) setExpenses(e); if (s && s !== "welcome") setScreen(s); setLoaded(true); })(); }, []);
  useEffect(() => { if (!loaded) return; saveData("tm-trip", trip); saveData("tm-expenses", expenses); if (["dashboard", "history", "budget", "reports"].includes(screen)) saveData("tm-screen", screen); }, [trip, expenses, screen, loaded]);

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
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ fontSize: 18, fontWeight: 900, color: T.accent }}>Trip</span><span style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Money</span></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: T.textMid, fontSize: 12 }}>{curByCode(trip.currency).flag} {trip.destination}</span>
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
        {screen === "daily-summary" && <DailySummaryScreen onSave={addExpense} onBack={() => setScreen("dashboard")} trip={trip} expenses={expenses} />}
        {screen === "budget" && <BudgetScreen expenses={expenses} trip={trip} />}
        {screen === "reports" && <ReportsScreen expenses={expenses} trip={trip} setScreen={setScreen} />}
        {screen === "expense-detail" && <ExpenseDetailScreen expense={selectedExpense} trip={trip} setScreen={setScreen} onDelete={deleteExpense} onDuplicate={duplicateExpense} onEdit={handleEdit} />}
        {screen === "settings" && <SettingsScreen trip={trip} onUpdateTrip={setTrip} onClearData={() => setExpenses([])} onBack={() => setScreen("dashboard")} />}
        {screen === "email-report" && <EmailReportScreen trip={trip} expenses={expenses} onBack={() => setScreen("reports")} />}
      </div>
      {showQuickAdd && <QuickAddSheet onSave={addExpense} onFullForm={() => { setShowQuickAdd(false); setScreen("add"); }} onClose={() => setShowQuickAdd(false)} trip={trip} />}
      {isNav && !showQuickAdd && (
        <div style={{ position: "fixed", bottom: 88, right: "calc(50% - 195px + 16px)", display: "flex", flexDirection: "column", gap: 10, zIndex: 100, alignItems: "flex-end" }}>
          <button onClick={() => setScreen("daily-summary")} style={{ width: 42, height: 42, borderRadius: 12, background: T.purple, border: "none", cursor: "pointer", fontSize: 16, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${T.purple}44` }}>📋</button>
          <button onClick={() => setShowQuickAdd(true)} style={{ width: 56, height: 56, borderRadius: "50%", background: T.accent, border: "none", cursor: "pointer", fontSize: 28, fontWeight: 900, color: T.bg, boxShadow: `0 8px 30px ${T.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>+</button>
        </div>
      )}
      {isNav && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: T.surface + "F0", backdropFilter: "blur(16px)", borderTop: `1px solid ${T.border}`, display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {NAV.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setScreen(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", gap: 3 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3, color: screen === id ? T.accent : T.textDim }}>{label}</span>
              {screen === id && <div style={{ width: 20, height: 2, background: T.accent, borderRadius: 99 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
