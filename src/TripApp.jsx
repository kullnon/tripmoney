import { useState, useEffect, useRef, useCallback } from "react";
import { fetchTrips, createTrip, updateTrip, deleteTrip as dbDeleteTrip, fetchExpenses, createExpense as dbCreateExpense, updateExpense as dbUpdateExpense, deleteExpense as dbDeleteExpense } from "./db";
import { MoneyInput, fmtNum, parseNum } from "./money";

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
const PAYMENT_METHODS = ["💳 Credit Card", "🏦 Debit Card", "💵 Cash", "📱 Venmo/PayPal", "🍎 Apple Pay", "💸 Zelle", "🧾 Check"];
const PHASES = ["Pre-Trip", "During Trip", "Post-Trip"];
const LEG_COLORS = ["#00D4FF", "#7B61FF", "#FF8A00", "#00E5A0", "#FFD600", "#FF4560", "#FF6B9D", "#B5E48C"];

// ─── BACKDATING ───────────────────────────────────────────────────
// How far back an expense may be dated. Single knob — change this one number.
const BACKDATE_LIMIT_DAYS = 90;

// ─── DRAGGABLE FAB PAIR (mic + plus) ──────────────────────────────
// The pair is a vertically-stacked mic-over-plus, free-dragged anywhere in the
// safe zone above the footer nav. Coords are the pair's top-left, viewport-fixed.
const FAB_SIZE = 56;            // matches MyTripMoney's existing FAB buttons
const FAB_GAP = 10;            // gap between the mic (top) and + (bottom)
const FAB_MARGIN = 16;         // min gap from the screen edges
const FAB_NAV_H = 86;          // reserved footer-nav height incl. safe-area
const FAB_TAP_THRESHOLD = 6;   // px of movement under which a press is a TAP, not a drag
const FAB_PAIR_W = FAB_SIZE;                    // column layout → width is one button
const FAB_PAIR_H = FAB_SIZE * 2 + FAB_GAP;      // two buttons + the gap
function fabBounds() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const navEdge = vh - FAB_NAV_H;
  return {
    minX: FAB_MARGIN,
    maxX: Math.max(FAB_MARGIN, vw - FAB_PAIR_W - FAB_MARGIN),
    minY: 8,
    maxY: Math.max(8, navEdge - FAB_PAIR_H - 8),
  };
}
function clampFab(x, y) {
  const b = fabBounds();
  return { x: Math.min(Math.max(x, b.minX), b.maxX), y: Math.min(Math.max(y, b.minY), b.maxY) };
}
// Default rest: right side, aligned to the centered 390-wide app column, just above the nav.
function startFabPos() {
  const vw = window.innerWidth;
  const b = fabBounds();
  const appRight = Math.min(vw, (vw + 390) / 2);
  return clampFab(appRight - FAB_PAIR_W - FAB_MARGIN, b.maxY);
}

// ─── COUNTRIES ────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "AG", name: "Antigua and Barbuda", flag: "🇦🇬" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸" },
  { code: "BB", name: "Barbados", flag: "🇧🇧" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "BZ", name: "Belize", flag: "🇧🇿" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "DM", name: "Dominica", flag: "🇩🇲" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "GD", name: "Grenada", flag: "🇬🇩" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HT", name: "Haiti", flag: "🇭🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "LC", name: "Saint Lucia", flag: "🇱🇨" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "KN", name: "St Kitts and Nevis", flag: "🇰🇳" },
  { code: "VC", name: "St Vincent & Grenadines", flag: "🇻🇨" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "OT", name: "Other", flag: "🌍" },
];
const countryByCode = (code) => COUNTRIES.find(c => c.code === code) || COUNTRIES[COUNTRIES.length - 1];

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
// Money display: MyTripMoney's own currency symbol + locale/currency-aware
// thousands separators (via fmtNum). Display-only — never feed to an <input>.
const fmtCur = (n, code = "USD") => `${curByCode(code).symbol}${fmtNum(n, code)}`;
const fmt = (n) => fmtCur(n, "USD");

// ─── DATES (local, UTC-safe) ──────────────────────────────────────
// WRITE side: today's date as a LOCAL "YYYY-MM-DD". Using toISOString() here is
// the classic midnight-rollover bug — it's UTC, so an evening entry in the
// Americas rolls to tomorrow. Build the string from local calendar parts instead.
function localToday() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
// Add (or subtract) whole days to a local "YYYY-MM-DD", returning the same format.
function addDays(iso, days) {
  const [y, m, d] = String(iso).split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + days);
  const p = (x) => String(x).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}
// DISPLAY side: turn a stored ISO date into MM-DD-YYYY ("07-18-2026").
// Parsed at LOCAL midnight (iso + "T00:00:00") so it never shows the day before in
// negative-UTC-offset zones. Stored values/queries stay ISO; only the render changes.
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const p = (x) => String(x).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())}-${d.getFullYear()}`;
}
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

// localStorage helpers removed - using Supabase via db.js

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
// Brand mark for the in-app header: /favicon.png, always pinned, never removed —
// if it 404s we swap to an "M" badge (matches SiteHeader on the marketing site).
function HeaderLogo({ size = 24 }) {
  const [ok, setOk] = useState(true);
  const box = { width: size, height: size, borderRadius: 6, flexShrink: 0, display: "block" };
  return ok
    ? <img src="/favicon.png" alt="MyTripMoney" width={size} height={size} style={box} onError={() => setOk(false)} />
    : <span aria-hidden="true" style={{ ...box, display: "flex", alignItems: "center", justifyContent: "center", background: T.accent, color: T.bg, fontWeight: 900, fontSize: Math.round(size * 0.6), lineHeight: 1 }}>M</span>;
}
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
  const f = (n) => `${cur.symbol}${fmtNum(n, trip.currency)}`;
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
  const f = (n) => `${cur.symbol}${fmtNum(n, trip.currency)}`;
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
function WelcomeScreen({ onStart, onCreateTrip, onInstall, isInstalled, canInstall, isIOS, isMobile, isPro, onPaywall, user }) {
  const [existingCount, setExistingCount] = useState(0);
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const list = await fetchTrips(user.id);
        setExistingCount(list.length);
      } catch {}
    })();
  }, [user?.id]);
  const locked = !isPro && existingCount >= 1;
  const handleCreate = () => locked ? onPaywall("Multiple Trips") : onCreateTrip();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <img src="/pwa-192x192.png" alt="" style={{ width: 72, height: 72, marginBottom: 16 }} onError={e => e.target.style.display = "none"} />
      <div style={{ fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: -1 }}>My<span style={{ color: T.accent }}>Trip</span>Money</div>
      <div style={{ color: T.textMid, fontSize: 15, marginTop: 10, marginBottom: 32, lineHeight: 1.5, maxWidth: 260 }}>Track every dollar — from planning to landing.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
        <button onClick={handleCreate} style={{ background: locked ? T.card : T.accent, color: locked ? T.textMid : T.bg, border: locked ? `1px solid ${T.border}` : "none", borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>{locked ? "🔒 Start New Trip (Pro)" : "Start New Trip →"}</button>
        <button onClick={onStart} style={{ background: "transparent", color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, fontSize: 14, cursor: "pointer" }}>Load Demo Trip</button>
      </div>

      {!isInstalled && isMobile && onInstall && (
        <div style={{
          marginTop: 32, padding: 16, borderRadius: 16,
          background: `linear-gradient(135deg, ${T.accent}15, ${T.purple}15)`,
          border: `1px solid ${T.accent}33`, maxWidth: 320, width: "100%",
        }}>
          <div style={{ color: T.accent, fontSize: 12, fontWeight: 800, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>📲 Install the App</div>
          <div style={{ color: T.text, fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>Add MyTripMoney to your home screen for instant access.</div>
          <button onClick={onInstall} style={{ width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            {canInstall ? "Install Now" : isIOS ? "How to Install on iPhone" : "How to Install"}
          </button>
        </div>
      )}

      <div style={{ marginTop: 32, display: "flex", gap: 20, color: T.textDim, fontSize: 12, flexWrap: "wrap", justifyContent: "center" }}><span>📴 Offline</span><span>📊 Reports</span><span>🔒 Private</span><span>🌍 Multi-Currency</span><span>🗺️ Multi-Leg</span></div>
    </div>
  );
}

// ─── CREATE TRIP ──────────────────────────────────────────────────
function CreateTripScreen({ onSave, onBack, isPro, onPaywall, prefill = null }) {
  // Estimator handoff: skip the type chooser, pre-fill the single-trip form.
  // Dates stay blank — user must confirm them before saving (spec: don't auto-create).
  const [tripType, setTripType] = useState(prefill ? "single" : null);
  const [form, setForm] = useState(() => prefill ? {
    name: `${prefill.destination || ""} ${new Date().getFullYear()}`.trim(),
    destination: prefill.destination || "",
    departureDate: "",
    returnDate: "",
    budget: prefill.budget ? String(prefill.budget) : "",
    currency: prefill.currency || "USD",
  } : { name: "", destination: "", departureDate: "", returnDate: "", budget: "", currency: "USD" });
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
      <div style={{ minHeight: "100vh", padding: "40px 20px 60px", display: "flex", flexDirection: "column" }}>
        {onBack && <BackButton onClick={onBack} label="Back" />}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 6, textAlign: "center" }}>What kind of trip?</div>
          <div style={{ color: T.textMid, fontSize: 14, marginBottom: 40, textAlign: "center" }}>This helps us set up the right tracking for you.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 340 }}>
            <Card onClick={() => setTripType("single")} style={{ cursor: "pointer", padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
              <div style={{ color: T.text, fontSize: 18, fontWeight: 800, marginBottom: 6 }}>One Destination</div>
              <div style={{ color: T.textMid, fontSize: 13 }}>A single round trip. USA → Puerto Rico → home.</div>
            </Card>
            <Card onClick={() => { if (!isPro && onPaywall) { onPaywall("Multi-leg journeys"); return; } setTripType("multi"); }} style={{ cursor: "pointer", padding: 24, textAlign: "center", borderColor: T.purple + "44" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
              <div style={{ color: T.purple, fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Multi-Leg Journey</div>
              <div style={{ color: T.textMid, fontSize: 13 }}>Multiple stops. USA → Cuba → France → home.</div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (tripType === "single") {
    const ok = form.name && form.destination && form.departureDate && form.returnDate && form.budget;
    return (
      <div style={{ minHeight: "100vh", padding: "40px 20px 60px" }}>
        {(prefill ? onBack : true) && <BackButton onClick={prefill ? onBack : () => setTripType(null)} label="Back" />}
        <div style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 6 }}>📍 {prefill ? "Confirm your trip" : "Single Trip"}</div>
        <div style={{ color: T.textMid, fontSize: 14, marginBottom: prefill ? 16 : 30 }}>
          {prefill ? "We pre-filled your estimate. Add your travel dates to start tracking." : "One destination, one budget."}
        </div>
        {prefill && (
          <div style={{ background: T.accent + "15", border: `1px solid ${T.accent}44`, borderRadius: 12, padding: "10px 14px", marginBottom: 22, color: T.accent, fontSize: 13, fontWeight: 600 }}>
            ✨ From your estimate: {prefill.destination} · {prefill.days}d · {prefill.travelers > 1 ? `${prefill.travelers} travelers · ` : ""}{prefill.style === "midRange" ? "Mid-range" : prefill.style === "luxury" ? "Luxury" : "Budget"}
          </div>
        )}
        <InputRow label="Trip Name"><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Puerto Rico 2025" style={inputStyle} /></InputRow>
        <InputRow label="Destination"><input value={form.destination} onChange={e => set("destination", e.target.value)} placeholder="e.g. San Juan" style={inputStyle} /></InputRow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputRow label="Departure"><input type="date" value={form.departureDate} min={localToday()} onChange={e => { const v = e.target.value; set("departureDate", v); if (form.returnDate && v > form.returnDate) set("returnDate", v); }} style={inputStyle} /></InputRow>
          <InputRow label="Return"><input type="date" value={form.returnDate} min={form.departureDate || undefined} onChange={e => set("returnDate", e.target.value)} style={inputStyle} /></InputRow>
        </div>
        {totalDays > 0 && <div style={{ color: T.accent, fontSize: 13, fontWeight: 600, marginBottom: 14, marginTop: -6 }}>📅 {totalDays} day trip</div>}
        <CurrencyPicker value={form.currency} onChange={v => set("currency", v)} label="Trip Currency" />
        <InputRow label={`Budget (${form.currency})`}>
          <div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMid, fontWeight: 700 }}>{curByCode(form.currency).symbol}</span><MoneyInput value={form.budget} currency={form.currency} onChange={v => set("budget", v)} style={{ ...inputStyle, paddingLeft: 36 }} /></div>
        </InputRow>
        <button disabled={!ok} onClick={() => onSave({ ...form, budget: parseFloat(form.budget) || 0, isMultiLeg: false, legs: [{ id: 1, from: "Home", to: form.destination, departureDate: form.departureDate, returnDate: form.returnDate, budget: parseFloat(form.budget) || 0, currency: form.currency }] })} style={{ width: "100%", background: ok ? T.accent : T.border, color: ok ? T.bg : T.textDim, border: "none", borderRadius: 14, padding: 16, fontSize: 17, fontWeight: 900, cursor: ok ? "pointer" : "not-allowed", marginTop: 10 }}>Start Tracking →</button>
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
            <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>DEPART {lockedDepart && "🔒"}</div><input type="date" value={leg.departureDate} min={localToday()} onChange={e => { if (!lockedDepart) { const v = e.target.value; updateLeg(leg.id, "departureDate", v); if (leg.returnDate && v > leg.returnDate) updateLeg(leg.id, "returnDate", v); } }} readOnly={lockedDepart} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13, opacity: lockedDepart ? 0.6 : 1, cursor: lockedDepart ? "not-allowed" : "text" }} /></div>
            <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>{i === legs.length - 1 && legs.length >= 2 ? "ARRIVE HOME" : "LEAVE TO"}</div><input type="date" value={leg.returnDate} min={leg.departureDate || undefined} onChange={e => updateLeg(leg.id, "returnDate", e.target.value)} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>BUDGET</div><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textDim, fontSize: 12 }}>{curByCode(leg.currency).symbol}</span><MoneyInput value={leg.budget} currency={leg.currency} onChange={v => updateLeg(leg.id, "budget", v)} placeholder="0" style={{ ...inputStyle, padding: "10px 12px 10px 28px", fontSize: 13 }} /></div></div>
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
  const [payment, setPayment] = useState("💳 Credit Card");
  const [location, setLocation] = useState("");
  const [saved, setSaved] = useState(false);
  const todayStr = localToday();
  const phase = autoPhase(todayStr, trip.departureDate, trip.returnDate);
  const legId = autoLeg(todayStr, trip.legs);
  const handleSave = () => {
    if (!amount) return;
    onSave({ id: uid(), title: catById(cat).label, amount: parseNum(amount, trip.currency) || 0, category: cat, phase, date: todayStr, payment, location: location.trim() || null, status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0, isDailySummary: false, originalAmount: parseNum(amount, trip.currency) || 0, originalCurrency: trip.currency, exchangeRate: 1, legId });
    setSaved(true); setTimeout(() => { setSaved(false); setAmount(""); setLocation(""); }, 1200);
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
          <MoneyInput value={amount} currency={trip.currency} onChange={setAmount} style={{ ...inputStyle, paddingLeft: 44, fontSize: 28, fontWeight: 900, textAlign: "center", height: 60 }} autoFocus />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", justifyContent: "center" }}>
          {[10, 20, 50, 100, 200].map(n => <button key={n} onClick={() => setAmount(String(n))} style={{ padding: "8px 18px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 99, color: T.textMid, fontSize: 14, cursor: "pointer", fontWeight: 700 }}>{curByCode(trip.currency).symbol}{n}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <div><div style={{ color: T.textMid, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Payment</div><select value={payment} onChange={e => setPayment(e.target.value)} style={{ ...inputStyle, fontSize: 13 }}>{PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
          <div><div style={{ color: T.textMid, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Location</div><input value={location} onChange={e => setLocation(e.target.value)} placeholder="optional" maxLength={80} style={{ ...inputStyle, fontSize: 13 }} /></div>
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
  const todayStr = localToday();
  const todayTotal = filteredExp.filter(e => e.date === todayStr).reduce((s, e) => s + e.amount, 0);
  const daysElapsed = Math.max(1, daysBetween(activeDep, todayStr > activeRet ? activeRet : todayStr));
  const dailyRate = total / daysElapsed;
  const projected = dailyRate * tripDays;

  const byCat = CATEGORIES.map(c => ({ ...c, total: filteredExp.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const topCat = byCat[0];
  const dueSoon = filteredExp.filter(e => e.status === "pending" || e.status === "partial");

  const activeLegData = trip.legs.find(l => l.id === activeLeg);
  const headerName = activeLeg === "all" ? trip.name : `${activeLegData?.from} → ${activeLegData?.to}`;

  return (
    <div style={{ padding: "20px 16px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{trip.isMultiLeg ? "Multi-Leg Trip" : "Active Trip"}</div>
          <div style={{ color: T.text, fontSize: 20, fontWeight: 900 }}>{headerName}</div>
          <div style={{ color: T.textMid, fontSize: 12 }}>{formatDate(activeDep)} → {formatDate(activeRet)} · {tripDays}d · {curByCode(tc).flag} {tc}</div>
        </div>
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
        {[["Today", fmtCur(todayTotal, tc), T.yellow, formatDate(todayStr)], ["Pending", fmtCur(pending, tc), T.orange, `${dueSoon.length} items`], ["Avg/Day", fmtCur(dailyRate, tc), T.accent, `${daysElapsed}d`], ["Projected", fmtCur(projected, tc), projected > activeBudget ? T.red : T.green, "full trip"]].map(([l, v, c, sub]) => (
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
              <div><div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{e.title}</div><div style={{ color: T.textMid, fontSize: 11 }}>{formatDate(e.date)}</div></div>
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
          {[...filteredExp].sort((a, b) => (b.created_at || b.date || "").localeCompare(a.created_at || a.date || "")).slice(0, 5).map(e => {
            const cat = catById(e.category);
            return (
              <Card key={e.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }} onClick={() => { setSelectedExpense(e); setScreen("expense-detail"); }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}{e.location ? <span style={{ color: T.textMid, fontWeight: 500 }}> · {e.location}</span> : null}</div>
                  <div style={{ color: T.textMid, fontSize: 11, marginTop: 2 }}>{e.payment}</div>
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
function HistoryScreen({ expenses, trip, setScreen, setSelectedExpense, onEdit, onAddPrior }) {
  const tc = trip.currency;
  const [search, setSearch] = useState(""); const [filterPhase, setFilterPhase] = useState("All"); const [filterStatus, setFilterStatus] = useState("All"); const [filterLeg, setFilterLeg] = useState("All"); const [sortBy, setSortBy] = useState("date");
  let filtered = expenses.filter(e => { const ms = !search || e.title.toLowerCase().includes(search.toLowerCase()); const mp = filterPhase === "All" || e.phase === filterPhase; const mst = filterStatus === "All" || e.status === filterStatus; const ml = filterLeg === "All" || e.legId === filterLeg; return ms && mp && mst && ml; });
  // Order by when the expense was ADDED (created_at), NOT its expense date, so a
  // just-added backdated entry shows at the top. Falls back to date for legacy/demo rows.
  const ts = e => e.created_at || e.date || "";
  if (sortBy === "amount") filtered = [...filtered].sort((a, b) => b.amount - a.amount); else filtered = [...filtered].sort((a, b) => ts(b).localeCompare(ts(a)));
  const grouped = {}; filtered.forEach(e => { if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e); });
  const groupTs = d => grouped[d].reduce((m, e) => ts(e) > m ? ts(e) : m, "");
  const dates = Object.keys(grouped).sort((a, b) => groupTs(b).localeCompare(groupTs(a)));
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
          <div style={{ color: T.text, fontSize: 22, fontWeight: 900 }}>All Expenses</div>
          <div style={{ color: T.textMid, fontSize: 13, fontWeight: 600 }}>{filtered.length}</div>
        </div>
        {onAddPrior && <button onClick={onAddPrior} title="Log an expense on a past date" style={{ flexShrink: 0, background: T.accent + "18", color: T.accent, border: `1px solid ${T.accent}55`, borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", lineHeight: 1 }}>📅 Add prior expense</button>}
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
        return (<div key={date}><div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 8px" }}><div style={{ color: T.textMid, fontSize: 12, fontWeight: 700 }}>{formatDate(date)}</div><div style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{fmtCur(dayTotal, tc)}</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{grouped[date].map(e => { const cat = catById(e.category); return (
            <Card key={e.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }} onClick={() => { setSelectedExpense(e); setScreen("expense-detail"); }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: T.text, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}{e.location ? <span style={{ color: T.textMid, fontWeight: 500 }}> · {e.location}</span> : null}</div><div style={{ color: T.textMid, fontSize: 11, marginTop: 2 }}>{e.payment}</div></div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}><div style={{ color: T.text, fontWeight: 800, fontSize: 15 }}>{fmtCur(e.amount, tc)}</div><StatusBadge status={e.status} /></div>
              {onEdit && <button onClick={(ev) => { ev.stopPropagation(); onEdit(e); }} aria-label="Edit expense" title="Edit" style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer", color: T.textMid, fontSize: 15, padding: "5px 7px", flexShrink: 0, lineHeight: 1 }}>✏️</button>}
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
        {[["📅 Date", formatDate(expense.date)], ["💳 Payment", expense.payment], expense.location ? ["📍 Location", expense.location] : null, ["🗂️ Category", cat.label], ["🗺️ Phase", expense.phase], trip.isMultiLeg && leg && ["✈️ Leg", `${leg.from} → ${leg.to}`], ["📝 Notes", expense.notes || "—"]].filter(Boolean).map(([l, v]) => (
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

// ─── PRIOR-EXPENSE FLOW (date first, then voice) ──────────────────
// Step 1: pick the past date BEFORE anything else. Floor = BACKDATE_LIMIT_DAYS
// ago (matches the add form's bounds); future dates blocked. UTC-safe throughout.
function PriorDateScreen({ onPick, onCancel }) {
  const todayStr = localToday();
  const floor = addDays(todayStr, -BACKDATE_LIMIT_DAYS);
  const [date, setDate] = useState(todayStr);
  const onChange = (v) => setDate(!v ? todayStr : v < floor ? floor : v > todayStr ? todayStr : v);
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={onCancel} />
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 6 }}>📅 Add prior expense</div>
      <div style={{ color: T.textMid, fontSize: 14, marginBottom: 24 }}>When did this purchase happen? Pick any day from {formatDate(floor)} to today — you'll add the details next.</div>
      <Card style={{ marginBottom: 20 }}>
        <InputRow label="Date of expense"><input type="date" value={date} min={floor} max={todayStr} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, fontSize: 16 }} /></InputRow>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ color: T.accent, fontSize: 14, fontWeight: 700 }}>{date === todayStr ? "Today" : formatDate(date)}</div>
          {date !== todayStr && <button onClick={() => setDate(todayStr)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMid, borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Today</button>}
        </div>
      </Card>
      <button onClick={() => onPick(date)} style={{ width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 900, cursor: "pointer" }}>Continue →</button>
    </div>
  );
}

// Step 2: mic front-and-center for the chosen date. Speaking saves to THAT date;
// the full manual form stays one tap away, pre-set to the same date.
function PriorEntryScreen({ date, voiceState, onMic, onManual, onChangeDate, onBack }) {
  const listening = voiceState === "listening" || voiceState === "pending";
  const parsing = voiceState === "parsing";
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <style>{`@keyframes vpulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.7; } }`}</style>
      <BackButton onClick={onBack} />
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Add expense</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        <span style={{ color: T.textMid, fontSize: 14 }}>Logging for</span>
        <span style={{ color: T.accent, fontSize: 18, fontWeight: 900 }}>{formatDate(date)}</span>
        <button onClick={onChangeDate} style={{ background: "none", border: "none", color: T.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0 }}>Change</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 24, marginBottom: 32 }}>
        <button onClick={onMic} title={listening ? "Tap to stop" : "Tap and speak"} style={{ width: 112, height: 112, borderRadius: "50%", background: listening ? T.red : T.surface, border: `3px solid ${listening ? T.red : T.accent}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: listening ? "#fff" : T.accent, boxShadow: listening ? `0 10px 40px ${T.red}66` : `0 8px 30px ${T.accent}44`, animation: listening ? "vpulse 1s ease-in-out infinite" : "none" }}>
          {parsing ? <span style={{ fontSize: 38 }}>⏳</span> : <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>}
        </button>
        <div style={{ color: listening ? T.red : T.textMid, fontSize: 15, fontWeight: 700, textAlign: "center" }}>{parsing ? "Processing…" : listening ? "Listening… tap to stop" : "Tap the mic and say the expense"}</div>
        {!listening && !parsing && <div style={{ color: T.textDim, fontSize: 12, textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}>e.g. “forty dollars groceries at Whole Foods, debit” — it saves to {formatDate(date)}, not today.</div>}
      </div>
      <button onClick={onManual} style={{ width: "100%", background: T.card, color: T.text, border: `1px solid ${T.border}`, borderRadius: 14, padding: 15, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>✏️ Enter manually instead</button>
    </div>
  );
}

// ─── ADD/EDIT EXPENSE ─────────────────────────────────────────────
function AddExpenseScreen({ onSave, onBack, trip, editExpense = null, prefill = null, note = null, defaultDate = null, focusDate = false }) {
  const isEdit = !!editExpense; const todayStr = localToday(); const tc = trip.currency;
  // "Add prior expense" opens here with a past defaultDate; clamped to the backdating window.
  const startDate = defaultDate ? (defaultDate > todayStr ? todayStr : defaultDate) : todayStr;
  // Opened via the prior-expense flow's "Enter manually": scroll the date into view + emphasize it.
  const dateRef = useRef(null);
  useEffect(() => { if (focusDate && dateRef.current) dateRef.current.scrollIntoView({ behavior: "smooth", block: "center" }); }, [focusDate]);
  // Voice pre-fill: seed amount/category/title from the parse; everything else uses the normal defaults.
  const preAmount = (!isEdit && prefill && prefill.amount != null) ? String(prefill.amount) : "";
  const lowConf = !isEdit && !!prefill && prefill.confidence === "low";
  const [form, setForm] = useState(editExpense ? { ...editExpense, amount: String(editExpense.amount), originalAmount: String(editExpense.originalAmount || editExpense.amount), exchangeRate: String(editExpense.exchangeRate || 1) } : {
    title: prefill?.title || "", amount: preAmount, category: prefill?.category || "food", phase: autoPhase(startDate, trip.departureDate, trip.returnDate), date: startDate, payment: (prefill?.payment && PAYMENT_METHODS.includes(prefill.payment)) ? prefill.payment : "💳 Credit Card", status: "paid", planned: false, notes: "", refundable: false, shared: false, sharedCount: 2, estimated: "", isDailySummary: false, originalAmount: preAmount, originalCurrency: tc, exchangeRate: "1", legId: autoLeg(startDate, trip.legs), location: prefill?.location || "",
  });
  const flag = lowConf ? { boxShadow: `0 0 0 2px ${T.orange}88`, borderRadius: 14, padding: "8px 8px 2px", marginBottom: 8 } : undefined;
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const useForeign = form.originalCurrency !== tc;
  // Backdating window: today back to BACKDATE_LIMIT_DAYS ago. Future dates are
  // blocked entirely. When EDITING an already-saved expense that's older than the
  // window (a historical/seed entry), the lower bound relaxes to that date so a
  // routine edit never silently drags its date forward. The picker's min/max
  // enforce this in the UI; clampDate guards typed/programmatic values too.
  const backMin = addDays(todayStr, -BACKDATE_LIMIT_DAYS);
  const minDate = isEdit && editExpense.date && editExpense.date < backMin ? editExpense.date : backMin;
  const clampDate = (v) => { if (!v) return todayStr; if (v > todayStr) return todayStr; if (v < minDate) return minDate; return v; };
  const handleDateChange = (v) => { const d = clampDate(v); set("date", d); set("phase", autoPhase(d, trip.departureDate, trip.returnDate)); set("legId", autoLeg(d, trip.legs)); };
  const handleForeignAmountChange = (v) => { set("originalAmount", v); set("amount", String(((parseFloat(v) || 0) * (parseFloat(form.exchangeRate) || 1)).toFixed(2))); };
  const handleRateChange = (v) => { set("exchangeRate", v); set("amount", String(((parseFloat(form.originalAmount) || 0) * (parseFloat(v) || 1)).toFixed(2))); };
  const handleSave = () => {
    if (!form.amount && !form.originalAmount) return;
    const title = form.title || catById(form.category).label;
    onSave({ ...form, title, id: isEdit ? form.id : uid(), date: clampDate(form.date), location: (form.location || "").trim() || null, amount: parseNum(form.amount, tc) || 0, originalAmount: useForeign ? (parseNum(form.originalAmount, form.originalCurrency) || 0) : (parseNum(form.amount, tc) || 0), exchangeRate: useForeign ? parseFloat(form.exchangeRate) || 1 : 1, estimated: form.estimated ? (parseNum(form.estimated, tc) || 0) : 0, sharedCount: form.shared ? Math.max(1, parseInt(form.sharedCount) || 2) : 1 });
    setSaved(true); if (!isEdit) { setTimeout(() => setSaved(false), 1500); setForm(f => ({ ...f, title: "", amount: "", notes: "", originalAmount: "" })); }
  };
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <BackButton onClick={onBack} />
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>{isEdit ? "Edit Expense" : focusDate ? "Add Prior Expense" : "Add Expense"}</div>
      {focusDate && !isEdit && <div style={{ background: T.accent + "18", border: `1px solid ${T.accent}55`, borderRadius: 12, padding: 12, marginBottom: 16, color: T.accent, fontWeight: 700, fontSize: 13, textAlign: "center" }}>🗓️ Logging for {formatDate(startDate)} — change the date below if needed.</div>}
      {saved && <div style={{ background: T.green + "22", border: `1px solid ${T.green}44`, borderRadius: 12, padding: 12, marginBottom: 16, color: T.green, fontWeight: 700, textAlign: "center" }}>✅ {isEdit ? "Updated!" : "Saved!"}</div>}
      {note && <div style={{ background: T.orange + "18", border: `1px solid ${T.orange}55`, borderRadius: 12, padding: 12, marginBottom: 16, color: T.orange, fontWeight: 700, fontSize: 13, textAlign: "center" }}>🎤 {note}</div>}
      {!isEdit && prefill && !note && <div style={{ background: (lowConf ? T.orange : T.accent) + "18", border: `1px solid ${(lowConf ? T.orange : T.accent)}55`, borderRadius: 12, padding: 12, marginBottom: 16, color: lowConf ? T.orange : T.accent, fontWeight: 700, fontSize: 13, textAlign: "center" }}>{lowConf ? "🎤 Heard it — double-check the amount & category, then save." : "🎤 Pre-filled from voice — review and save."}</div>}
      <div style={flag}><InputRow label="Category"><div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>{CATEGORIES.map(c => <button key={c.id} onClick={() => set("category", c.id)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 12px", borderRadius: 12, cursor: "pointer", background: form.category === c.id ? c.color + "33" : T.card, border: `2px solid ${form.category === c.id ? c.color : T.border}`, gap: 4 }}><span style={{ fontSize: 22 }}>{c.icon}</span><span style={{ fontSize: 9, fontWeight: 700, color: form.category === c.id ? c.color : T.textDim }}>{c.label.split(" ")[0]}</span></button>)}</div></InputRow></div>
      <InputRow label="Expense Name"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder={catById(form.category).label} style={inputStyle} /></InputRow>
      <InputRow label="Location (optional)"><input value={form.location || ""} onChange={e => set("location", e.target.value)} placeholder="e.g. San Juan, PR" maxLength={80} style={inputStyle} /></InputRow>

      <InputRow label="Currency">
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { set("originalCurrency", tc); set("exchangeRate", "1"); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${!useForeign ? T.accent : T.border}`, background: !useForeign ? T.accent + "22" : T.card, color: !useForeign ? T.accent : T.textDim, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{curByCode(tc).flag} {tc}</button>
          <select value={useForeign ? form.originalCurrency : ""} onChange={e => { set("originalCurrency", e.target.value); set("exchangeRate", "1"); }} style={{ ...inputStyle, flex: 2, fontSize: 13 }}>
            <option value="">🌍 Other...</option>{CURRENCIES.filter(c => c.code !== tc).map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
          </select>
        </div>
      </InputRow>

      <div style={flag}>{useForeign ? (<>
        <InputRow label={`Amount (${form.originalCurrency})`}><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.purple, fontWeight: 700 }}>{curByCode(form.originalCurrency).symbol}</span><MoneyInput value={form.originalAmount} currency={form.originalCurrency} onChange={v => handleForeignAmountChange(v)} style={{ ...inputStyle, paddingLeft: 36 }} /></div></InputRow>
        <InputRow label={`Rate (1 ${form.originalCurrency} = ? ${tc})`}><input value={form.exchangeRate} onChange={e => handleRateChange(e.target.value)} type="number" step="0.0001" style={inputStyle} /></InputRow>
        {form.amount && <div style={{ color: T.accent, fontSize: 14, fontWeight: 700, marginBottom: 14, marginTop: -8 }}>≈ {fmtCur(form.amount, tc)}</div>}
      </>) : (
        <InputRow label={`Amount (${tc})`}><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMid, fontWeight: 700 }}>{curByCode(tc).symbol}</span><MoneyInput value={form.amount} currency={tc} onChange={v => { set("amount", v); set("originalAmount", v); }} style={{ ...inputStyle, paddingLeft: 36 }} /></div></InputRow>
      )}</div>
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
      <div ref={dateRef} style={focusDate ? { boxShadow: `0 0 0 2px ${T.accent}88`, borderRadius: 14, padding: "8px 8px 2px", marginBottom: 8 } : undefined }>
        <InputRow label="Date"><input type="date" value={form.date} min={minDate} max={todayStr} onChange={e => handleDateChange(e.target.value)} style={inputStyle} /><div style={{ color: T.textDim, fontSize: 11, marginTop: 6 }}>{form.date === todayStr ? "Today" : formatDate(form.date)} · backdate up to {BACKDATE_LIMIT_DAYS} days</div></InputRow>
      </div>
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

// ─── DONUT (Spending Breakdown) ───────────────────────────────────
// Ported from WadWall's Report donut: hand-built inline-SVG (no chart lib),
// center total + collision-avoided callouts, thin slices fall to the legend.
// Kept verbatim except it renders with MyTripMoney's dark theme + currency.
const DONUT_COLORS = ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7", "#e34948", "#0e9488", "#a83279"];
const DONUT_OTHER = "#a8a29e";
// Slices at/above this % get a direct callout ON the donut; thinner ones carry no
// external label and appear only in the trimmed legend (so there's zero duplication).
const DONUT_LABEL_MIN = 8;

// Collapse a descending-sorted [{label, value}] list into ≤9 slices: the top 8 by
// amount get palette colors in order; any remainder merges into a single grouped
// bucket labeled "Everything else" (NOT "Other" — that's a real category name).
function donutSlices(rows) {
  const clean = rows.map(r => ({ label: r.label, value: Number(r.value) || 0 })).filter(r => r.value > 0);
  const top = clean.slice(0, 8).map((r, i) => ({ ...r, color: DONUT_COLORS[i] }));
  const restVal = clean.slice(8).reduce((s, r) => s + r.value, 0);
  const slices = restVal > 0 ? [...top, { label: "Everything else", value: restVal, color: DONUT_OTHER }] : top;
  const total = slices.reduce((s, r) => s + r.value, 0);
  return { slices: slices.map(s => ({ ...s, pct: total ? (s.value / total) * 100 : 0 })), total };
}

// Hand-built inline-SVG donut — no chart library, no <canvas> — so it survives the
// Save-as-PDF / Print flow. Returns an SVG markup string used via dangerouslySetInnerHTML.
// Slices ≥ LABEL_MIN% get a compact stacked callout (name / amount · %) just outside the
// ring; thinner slices carry no external label and live only in the legend. Callouts are
// collision-avoided per side (pushed apart vertically) with short leader lines.
function donutSVG(slices, centerTop, centerSub, ink, inkDim, sym = "$") {
  const W = 400, H = 264, cx = W / 2, cy = H / 2, rOuter = 74, rInner = 45;
  const LABEL_MIN = DONUT_LABEL_MIN;
  const NAME_FS = 14, DETAIL_FS = 12, LINE_DY = NAME_FS + 1;
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const money = (v) => `${sym}${Math.round(v).toLocaleString()}`;
  const pt = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const single = slices.length === 1;
  let cum = -Math.PI / 2, wedges = "";
  const cand = [];
  slices.forEach(s => {
    const frac = s.pct / 100, start = cum, end = cum + frac * 2 * Math.PI, mid = (start + end) / 2;
    cum = end;
    if (single) {
      wedges += `<circle cx="${cx}" cy="${cy}" r="${(rOuter + rInner) / 2}" fill="none" stroke="${s.color}" stroke-width="${rOuter - rInner}"/>`;
    } else {
      const large = frac > 0.5 ? 1 : 0;
      const [ox1, oy1] = pt(rOuter, start), [ox2, oy2] = pt(rOuter, end);
      const [ix2, iy2] = pt(rInner, end), [ix1, iy1] = pt(rInner, start);
      wedges += `<path d="M ${ox1.toFixed(2)} ${oy1.toFixed(2)} A ${rOuter} ${rOuter} 0 ${large} 1 ${ox2.toFixed(2)} ${oy2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${rInner} ${rInner} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z" fill="${s.color}" stroke="${T.card}" stroke-width="2" stroke-linejoin="round"/>`;
    }
    if (s.pct >= LABEL_MIN) {
      const right = Math.cos(mid) >= 0;
      cand.push({ mid, right, idealY: cy + (rOuter + 8) * Math.sin(mid), name: esc(s.label).slice(0, 18), detail: `${money(s.value)} · ${Math.round(s.pct)}%` });
    }
  });

  const GAP = Math.round(NAME_FS * 0.72 + LINE_DY + DETAIL_FS * 0.25 + 6), TOP = 16, BOT = H - 16;
  const layout = (arr) => {
    arr.sort((a, b) => a.idealY - b.idealY);
    let prev = -Infinity;
    arr.forEach(l => { l.y = Math.max(l.idealY, prev + GAP, TOP); prev = l.y; });
    const over = arr.length ? arr[arr.length - 1].y - BOT : 0;
    if (over > 0) { let p = Infinity; for (let i = arr.length - 1; i >= 0; i--) { arr[i].y = Math.min(arr[i].y - over, p - GAP); p = arr[i].y; } }
    return arr;
  };
  const rightCol = layout(cand.filter(c => c.right));
  const leftCol = layout(cand.filter(c => !c.right));

  let labels = "";
  const draw = (l) => {
    const colX = l.right ? cx + rOuter + 16 : cx - rOuter - 16;
    const [p0x, p0y] = pt(rOuter, l.mid), [p1x, p1y] = pt(rOuter + 8, l.mid);
    const endX = l.right ? colX - 3 : colX + 3;
    const anchor = l.right ? "start" : "end";
    labels += `<polyline points="${p0x.toFixed(1)},${p0y.toFixed(1)} ${p1x.toFixed(1)},${p1y.toFixed(1)} ${endX.toFixed(1)},${l.y.toFixed(1)}" fill="none" stroke="${inkDim}" stroke-width="0.75"/>`;
    const nameY = l.y - 3, detailY = l.y - 3 + LINE_DY;
    labels += `<text x="${colX.toFixed(1)}" y="${nameY.toFixed(1)}" text-anchor="${anchor}" font-size="${NAME_FS}" font-weight="800" fill="${ink}">${l.name}</text>`;
    labels += `<text x="${colX.toFixed(1)}" y="${detailY.toFixed(1)}" text-anchor="${anchor}" font-size="${DETAIL_FS}" font-weight="600" fill="${inkDim}">${l.detail}</text>`;
  };
  rightCol.forEach(draw); leftCol.forEach(draw);

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Spending by category" style="max-width:380px;display:block;margin:0 auto;height:auto">${wedges}<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="23" font-weight="900" fill="${ink}">${esc(centerTop)}</text><text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="11" font-weight="600" fill="${inkDim}">${esc(centerSub)}</text>${labels}</svg>`;
}

// ─── REPORTS ──────────────────────────────────────────────────────
function ReportsScreen({ expenses, trip, setScreen }) {
  const tc = trip.currency; const total = expenses.reduce((s, e) => s + (e.status !== "refund" ? e.amount : -Math.abs(e.amount)), 0); const paid = expenses.filter(e => e.status === "paid").reduce((s, e) => s + e.amount, 0); const pending = expenses.filter(e => e.status === "pending" || e.status === "partial").reduce((s, e) => s + e.amount, 0); const tripDays = daysBetween(trip.departureDate, trip.returnDate);
  const byDay = {}; expenses.forEach(e => { byDay[e.date] = (byDay[e.date] || 0) + e.amount; }); const dayEntries = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)); const maxDay = Math.max(...Object.values(byDay), 1);
  const byCat = CATEGORIES.map(c => ({ ...c, value: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0) })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  const donut = donutSlices(byCat.map(c => ({ label: `${c.icon} ${c.label}`, value: c.value })));
  const donutCenter = `${curByCode(tc).symbol}${fmtNum(donut.total, tc)}`;
  const stats = [{ l: "Total", v: fmtCur(total, tc), c: T.accent }, { l: "Budget", v: fmtCur(trip.budget, tc), c: T.textMid }, { l: "Variance", v: fmtCur(trip.budget - total, tc), c: trip.budget - total >= 0 ? T.green : T.red }, { l: "Avg/Day", v: fmtCur(total / tripDays, tc), c: T.yellow }, { l: "Paid", v: fmtCur(paid, tc), c: T.green }, { l: "Pending", v: fmtCur(pending, tc), c: T.orange }];
  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Report</div>
      {donut.slices.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Spending Breakdown</div>
          <div dangerouslySetInnerHTML={{ __html: donutSVG(donut.slices, donutCenter, "spent", T.text, T.textDim, curByCode(tc).symbol) }} />
          {donut.slices.some(s => s.pct < DONUT_LABEL_MIN) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>{donut.slices.filter(s => s.pct < DONUT_LABEL_MIN).map(s => <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} /><span style={{ flex: 1, color: T.textMid }}>{s.label}</span><span style={{ color: T.text, fontWeight: 700 }}>{fmtCur(s.value, tc)}</span><span style={{ width: 44, textAlign: "right", color: T.textDim, fontWeight: 700 }}>{Math.round(s.pct)}%</span></div>)}</div>
          )}
        </Card>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>{stats.map(({ l, v, c }) => <Card key={l} style={{ padding: 14 }}><div style={{ color: c, fontSize: 18, fontWeight: 900 }}>{v}</div><div style={{ color: T.textDim, fontSize: 11, fontWeight: 600, marginTop: 3 }}>{l}</div></Card>)}</div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Daily Spending</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90 }}>{dayEntries.map(([d, a]) => <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><div style={{ fontSize: 8, color: T.textDim, fontWeight: 700 }}>{curByCode(tc).symbol}{Math.round(a)}</div><div style={{ width: "100%", height: Math.max(4, (a / maxDay) * 70), background: T.accent, borderRadius: "3px 3px 1px 1px", opacity: 0.85 }} /><div style={{ fontSize: 8, color: T.textDim }}>{d.slice(5)}</div></div>)}</div>
      </Card>
      <button onClick={() => setScreen("email-report")} style={{ width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: 15, fontSize: 16, fontWeight: 900, cursor: "pointer" }}>📤 Share Report</button>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────
function SettingsScreen({ trip, onUpdateTrip, onClearData, onDeleteTrip, onNewTrip, onBack, user, profile, isPro, onSignOut, onInstall, isInstalled, onPaywall }) {
  const [form, setForm] = useState({ ...trip, budget: String(trip.budget) });
  const [legs, setLegs] = useState(trip.legs ? trip.legs.map(l => ({ ...l, budget: String(l.budget) })) : []);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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

      {user && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Account</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
              {(profile?.full_name || user.email)[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: T.text, fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.full_name || user.email}</div>
              <div style={{ color: T.textMid, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
            <span style={{ background: isPro ? T.accent + "22" : T.textDim + "22", color: isPro ? T.accent : T.textDim, fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 99, textTransform: "uppercase" }}>{isPro ? "Pro" : "Free"}</span>
          </div>
          {!isInstalled && onInstall && (
            <button onClick={onInstall} style={{ width: "100%", background: `linear-gradient(135deg, ${T.accent}22, ${T.purple}22)`, color: T.accent, border: `1px solid ${T.accent}44`, borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>📲 Install on Home Screen</button>
          )}
          {onNewTrip && (
            <button onClick={onNewTrip} style={{ width: "100%", background: T.purple + "22", color: T.purple, border: `1px solid ${T.purple}44`, borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>🧳 Create New Trip</button>
          )}
          {!isPro && onPaywall && (
            <button onClick={() => onPaywall("Upgrade")} style={{ width: "100%", background: T.accent + "22", color: T.accent, border: "1px solid " + T.accent + "44", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>⭐ Upgrade to Pro</button>
          )}
          <button onClick={onSignOut} style={{ width: "100%", background: T.card, color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🚪 Sign Out</button>
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Trip Info</div>
        <InputRow label="Name"><input value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} /></InputRow>
        <CurrencyPicker value={form.currency} onChange={v => set("currency", v)} label="Base Currency" />
        {!trip.isMultiLeg && (
          <>
            <InputRow label="Destination"><input value={form.destination || ""} onChange={e => set("destination", e.target.value)} style={inputStyle} /></InputRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <InputRow label="Departure"><input type="date" value={form.departureDate || ""} onChange={e => { const v = e.target.value; set("departureDate", v); if (form.returnDate && v > form.returnDate) set("returnDate", v); }} style={inputStyle} /></InputRow>
              <InputRow label="Return"><input type="date" value={form.returnDate || ""} min={form.departureDate || undefined} onChange={e => set("returnDate", e.target.value)} style={inputStyle} /></InputRow>
            </div>
            <InputRow label="Budget"><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMid, fontWeight: 700 }}>{curByCode(form.currency).symbol}</span><MoneyInput value={form.budget} currency={form.currency} onChange={v => set("budget", v)} style={{ ...inputStyle, paddingLeft: 36 }} /></div></InputRow>
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
                  <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>DEPART {locked && "🔒"}</div><input type="date" value={leg.departureDate} readOnly={locked} onChange={e => { if (!locked) { const v = e.target.value; updateLeg(leg.id, "departureDate", v); if (leg.returnDate && v > leg.returnDate) updateLeg(leg.id, "returnDate", v); } }} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13, opacity: locked ? 0.6 : 1, cursor: locked ? "not-allowed" : "text" }} /></div>
                  <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>{i === legs.length - 1 && legs.length >= 2 ? "ARRIVE HOME" : "LEAVE TO"}</div><input type="date" value={leg.returnDate} min={leg.departureDate || undefined} onChange={e => updateLeg(leg.id, "returnDate", e.target.value)} style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><div style={{ color: T.textDim, fontSize: 10, fontWeight: 600, marginBottom: 4 }}>BUDGET</div><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textDim, fontSize: 12 }}>{curByCode(leg.currency).symbol}</span><MoneyInput value={leg.budget} currency={leg.currency} onChange={v => updateLeg(leg.id, "budget", v)} style={{ ...inputStyle, padding: "10px 12px 10px 28px", fontSize: 13 }} /></div></div>
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

        {/* Clear expenses */}
        {!confirmClear ? (
          <button onClick={() => setConfirmClear(true)} style={{ width: "100%", background: T.red + "10", color: T.red, border: `1px solid ${T.red}33`, borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
            🧹 Clear All Expenses
            <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>Keeps the trip but removes all expenses</div>
          </button>
        ) : (
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: T.text, fontSize: 13, marginBottom: 8, textAlign: "center" }}>Delete all expenses for this trip?</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmClear(false)} style={{ flex: 1, background: T.card, color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { onClearData(); setConfirmClear(false); }} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 12, padding: 12, fontWeight: 900, cursor: "pointer" }}>Clear Expenses</button>
            </div>
          </div>
        )}

        {/* Delete entire trip */}
        {onDeleteTrip && (
          !confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{ width: "100%", background: T.red + "22", color: T.red, border: `1px solid ${T.red}66`, borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              🗑️ Delete This Trip
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>Permanently remove the trip and all expenses</div>
            </button>
          ) : (
            <div>
              <div style={{ color: T.red, fontSize: 13, marginBottom: 8, textAlign: "center", fontWeight: 700 }}>⚠️ Delete "{trip.name}" forever?</div>
              <div style={{ color: T.textMid, fontSize: 12, marginBottom: 10, textAlign: "center" }}>This cannot be undone.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, background: T.card, color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { onDeleteTrip(); setConfirmDelete(false); }} style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 12, padding: 12, fontWeight: 900, cursor: "pointer" }}>Delete Forever</button>
              </div>
            </div>
          )
        )}
      </Card>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────
const NAV = [{ id: "dashboard", icon: "🏠", label: "Home" }, { id: "history", icon: "📋", label: "History" }, { id: "budget", icon: "💰", label: "Budget" }, { id: "reports", icon: "📊", label: "Reports" }];

function TripsListScreen({ user, currentTripDbId, onSelectTrip, onNewTrip, onBack, isPro, onPaywall }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expensesByTrip, setExpensesByTrip] = useState({});

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const list = await fetchTrips(user.id);
        setTrips(list);
        // fetch expense sums per trip (small parallel batch)
        const sums = {};
        await Promise.all(list.map(async (t) => {
          try {
            const exps = await fetchExpenses(t.dbId);
            sums[t.dbId] = exps.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
          } catch { sums[t.dbId] = 0; }
        }));
        setExpensesByTrip(sums);
      } catch (err) {
        console.error("Load trips failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "20px 20px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.accent, fontSize: 15, fontWeight: 700, cursor: "pointer", padding: 0 }}>← Back</button>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, margin: "0 0 6px", letterSpacing: -0.5 }}>My Trips</h1>
      <p style={{ color: T.textMid, fontSize: 14, margin: "0 0 6px" }}>Tap a trip to switch. Your data syncs across devices.</p>
      <p style={{ color: T.textDim, fontSize: 12, margin: "0 0 18px" }}>{isPro ? "Pro plan · Unlimited trips" : `Free plan · ${trips.length}/1 trips used · `}{!isPro && <span style={{ color: T.accent, fontWeight: 700 }}>Upgrade for unlimited</span>}</p>

      {(() => {
        const locked = !isPro && trips.length >= 1;
        return (
          <button onClick={() => locked ? onPaywall("Multiple Trips") : onNewTrip()} style={{ width: "100%", background: locked ? T.card : T.accent, color: locked ? T.textMid : T.bg, border: locked ? `1px solid ${T.border}` : "none", borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 900, cursor: "pointer", marginBottom: 20 }}>
            {locked ? "🔒 Start New Trip (Pro)" : "+ Start New Trip"}
          </button>
        );
      })()}

      {loading && <div style={{ color: T.textDim, textAlign: "center", padding: 40 }}>Loading your trips...</div>}

      {!loading && trips.length === 0 && (
        <div style={{ color: T.textDim, textAlign: "center", padding: 40, fontSize: 14 }}>No trips yet. Start your first one above.</div>
      )}

      {!loading && trips.map(t => {
        const spent = expensesByTrip[t.dbId] || 0;
        const budget = parseFloat(t.budget) || 0;
        const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
        const cur = curByCode(t.currency);
        const isActive = t.dbId === currentTripDbId;
        return (
          <button key={t.dbId} onClick={() => onSelectTrip(t)} style={{ width: "100%", background: T.card, border: `1px solid ${isActive ? T.accent : T.border}`, borderRadius: 16, padding: 16, marginBottom: 12, cursor: "pointer", textAlign: "left", display: "block" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{t.name}</span>
                  {isActive && <span style={{ background: T.accent, color: T.bg, fontSize: 9, fontWeight: 900, padding: "2px 6px", borderRadius: 6, letterSpacing: 0.5 }}>ACTIVE</span>}
                </div>
                <div style={{ color: T.textMid, fontSize: 12 }}>{(t.country ? countryByCode(t.country).flag : cur.flag)} {t.isMultiLeg ? `${t.legs.length} legs` : t.destination}</div>
                <div style={{ color: T.textDim, fontSize: 11, marginTop: 2 }}>{formatDate(t.departureDate)} → {formatDate(t.returnDate)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: T.text, fontSize: 14, fontWeight: 900 }}>{cur.symbol}{spent.toFixed(0)}</div>
                <div style={{ color: T.textDim, fontSize: 10 }}>of {cur.symbol}{budget.toFixed(0)}</div>
              </div>
            </div>
            <div style={{ height: 4, background: T.bg, borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: pct > 90 ? T.red : pct > 70 ? T.orange : T.green, transition: "width 0.3s" }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function TripMoneyApp({ user, profile, isPro, onSignOut, onInstall, isInstalled, canInstall, isIOS, isMobile, onPaywall } = {}) {
  const [screen, setScreenRaw] = useState("welcome");
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
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

  // CLOUD SYNC: Load trip + expenses from Supabase
  const [tripDbId, setTripDbId] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // VOICE-TO-EXPENSE (Groq Whisper): tap mic → MediaRecorder capture → /api/transcribe
  // (Groq whisper-large-v3-turbo, key stays server-side) → /api/parse-expense → save to
  // History. High confidence + valid amount auto-saves; uncertain parses fall back to the
  // pre-filled form. A 5s minimum listen window + never-stop-before-speech fix the
  // "mic too fast" cutoff (silence only finalizes after ≥5s AND ≥3s of quiet post-speech).
  const [voiceState, setVoiceState] = useState("idle"); // 'idle' | 'pending' | 'listening' | 'parsing'
  const [voicePrefill, setVoicePrefill] = useState(null);
  const [voiceNote, setVoiceNote] = useState(null);
  // Two-step "Add prior expense" flow (prior-date → prior-entry). `priorDate` is the picked
  // backdate (null everywhere else → today); `addFocusDate` emphasizes the date on the manual form.
  const [priorDate, setPriorDate] = useState(null);
  const [addFocusDate, setAddFocusDate] = useState(false);
  const [toast, setToast] = useState(null); // { title, amount, currency, voiceKey } | null
  const [micCard, setMicCard] = useState(null); // null | 'ask' | 'steps' — in-app mic permission card
  const [micBusy, setMicBusy] = useState(false); // Enable-Microphone request in flight
  const [micHint, setMicHint] = useState("");    // inline status/error under the Enable button
  const [micTries, setMicTries] = useState(0);   // bumps each blocked retry → re-flash the steps
  const openManualAdd = (note = null) => { setVoicePrefill(null); setVoiceNote(note); setPriorDate(null); setScreen("add"); };
  // Keep the prior-expense date alive only within its flow; drop the focus flag off the add form.
  useEffect(() => { if (!["prior-date", "prior-entry", "add"].includes(screen)) setPriorDate(null); }, [screen]);
  useEffect(() => { if (screen !== "add") setAddFocusDate(false); }, [screen]);
  // ── Voice capture plumbing (MediaRecorder → Groq Whisper) ──
  const recorderRef = useRef(null);   // active MediaRecorder
  const streamRef = useRef(null);     // getUserMedia stream (tracks stopped on teardown)
  const audioCtxRef = useRef(null);   // AudioContext backing the silence AnalyserNode
  const rafRef = useRef(null);        // requestAnimationFrame id for the RMS loop
  const chunksRef = useRef([]);       // recorded blob chunks
  const mimeRef = useRef("");         // chosen recording mime type
  const finalizeRef = useRef(null);   // lets the Stop button / tap-again end the session

  // Short app-controlled cue tones (throwaway AudioContext each time) — the only sounds.
  const cueTone = (freq, ms) => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t0 = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t0); osc.stop(t0 + ms / 1000 + 0.02);
      osc.onended = () => { try { ctx.close(); } catch (_) { /* ignore */ } };
    } catch (_) { /* cue is best-effort */ }
  };
  const startCue = () => cueTone(880, 120);
  const endCue = () => cueTone(520, 160);

  // First MediaRecorder mime the browser supports (Chrome/Android → webm/opus, Safari → mp4).
  const pickMime = () => {
    if (typeof window.MediaRecorder === "undefined") return "";
    const cands = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"];
    for (const m of cands) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (_) { /* ignore */ } }
    return "";
  };

  // Stop the RMS loop, close the AudioContext, and release the mic tracks.
  const teardownAudio = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const ctx = audioCtxRef.current; audioCtxRef.current = null;
    if (ctx) { try { ctx.close(); } catch (_) { /* ignore */ } }
    const st = streamRef.current; streamRef.current = null;
    if (st) { try { st.getTracks().forEach(t => t.stop()); } catch (_) { /* ignore */ } }
  };

  // Tear everything down on unmount so no recorder / mic / audio graph is left running.
  useEffect(() => () => {
    finalizeRef.current = null;
    const r = recorderRef.current; recorderRef.current = null;
    if (r && r.state !== "inactive") { try { r.onstop = null; r.ondataavailable = null; r.stop(); } catch (_) { /* ignore */ } }
    teardownAudio();
  }, []);

  const MIC_NO_START = "🎤 Microphone didn't start — check mic permission, or enter manually.";
  const MIC_NO_SPEECH = "🎤 Didn't catch any speech — try again or enter manually.";
  const MIC_SERVICE = "🎤 Voice service unavailable — enter manually.";
  const MIC_NO_AMOUNT = "🎤 Couldn't read the amount — enter manually.";
  const MIC_GENERIC = "🎤 Couldn't catch that — enter manually.";

  // Send the captured phrase to the parser, then save (high conf) or hand to the form.
  const submitTranscript = async (transcript) => {
    setVoiceState("parsing");
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 15000);
    try {
      const resp = await fetch("/api/parse-expense", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript, currency: trip.currency }), signal: ctrl.signal });
      const data = await resp.json();
      if (!resp.ok || data.error || data.amount == null) {
        // Speech WAS captured — the parser just couldn't pull a valid amount. Keep the
        // spoken text pre-filled so the user only has to fix the number.
        setVoiceState("idle");
        setVoiceNote(MIC_NO_AMOUNT);
        setVoicePrefill({ amount: null, category: data?.category, title: data?.title || transcript, location: data?.location || null, confidence: "low" });
        setPriorDate(null);
        setScreen("add");
        return;
      }
      setVoiceState("idle");
      const amt = Number(data.amount);
      const highConf = data.confidence === "high" && Number.isFinite(amt) && amt > 0;
      if (!highConf) {
        // Amount present but LOW confidence → pre-fill the review form so the user can confirm.
        setVoiceNote(null);
        setVoicePrefill({ amount: data.amount, category: data.category, title: data.title, payment: data.payment || null, location: data.location || null, confidence: data.confidence });
        setPriorDate(null);
        setScreen("add");
        return;
      }
      // HIGH confidence + valid amount → build with MTM's schema, SAVE, and land on History.
      const todayStr = priorDate || localToday();
      const payment = (data.payment && PAYMENT_METHODS.includes(data.payment)) ? data.payment : "💳 Credit Card";
      const voiceKey = uid();
      const expense = {
        id: uid(), _voiceKey: voiceKey,
        title: data.title || catById(data.category).label,
        amount: amt, category: data.category,
        phase: autoPhase(todayStr, trip.departureDate, trip.returnDate),
        date: todayStr, payment, status: "paid", planned: false,
        notes: "", refundable: false, shared: false, sharedCount: 1, estimated: 0,
        isDailySummary: false, originalAmount: amt, originalCurrency: trip.currency,
        exchangeRate: 1, legId: autoLeg(todayStr, trip.legs), location: data.location || null,
      };
      setVoiceNote(null);
      setVoicePrefill(null);
      addExpense(expense);
      setScreen("history");
      setToast({ title: expense.title, amount: amt, currency: trip.currency, voiceKey });
    } catch (err) {
      console.error("parse-expense request failed:", err);
      setVoiceState("idle");
      setVoiceNote(MIC_NO_AMOUNT);
      setVoicePrefill({ amount: null, title: transcript, confidence: "low" });
      setPriorDate(null);
      setScreen("add");
    } finally {
      clearTimeout(to);
    }
  };

  // Stop an in-flight recording (tap-Stop or auto-silence). The real post-processing
  // happens in recorder.onstop (onRecordingStop).
  const stopRecording = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    finalizeRef.current = null;
    const r = recorderRef.current;
    if (!r || r.state === "inactive") return;
    try { r.stop(); } catch (_) { /* onstop may already be firing */ }
  };

  // Silence detection with WadWall's timing: NEVER finalize before the 5s minimum listen
  // window or before the user has actually spoken (cold-start grace); after speech, stop on
  // ~3s of continuous quiet; hard 15s cap. This is the fix for the "mic too fast" cutoff.
  const startSilenceLoop = (analyser) => {
    const data = new Uint8Array(analyser.fftSize);
    const THRESH = 0.02;          // RMS above this = speech
    const SILENCE_MS = 3000;      // stop this long after the last words
    const MIN_LISTEN_MS = 5000;   // guarantee ≥5s of active listening on every (cold) start
    const MAX_LISTEN_MS = 15000;  // hard cap — never record longer than this
    let spoke = false;
    const startedAt = performance.now();
    let lastLoud = startedAt;
    const tick = () => {
      const r = recorderRef.current;
      if (!r || r.state !== "recording") return;   // stopped elsewhere
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
      const rms = Math.sqrt(sum / data.length);
      const now = performance.now();
      if (rms > THRESH) { spoke = true; lastLoud = now; }
      const elapsed = now - startedAt;
      if (elapsed >= MAX_LISTEN_MS) { stopRecording(); return; }
      if (spoke && now - lastLoud >= SILENCE_MS && elapsed >= MIN_LISTEN_MS) { stopRecording(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // Upload the recorded audio to /api/transcribe (Groq Whisper) and return its text.
  const transcribeBlob = async (blob, mime) => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 30000);
    try {
      const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
      const fd = new FormData();
      fd.append("file", blob, `audio.${ext}`);
      const resp = await fetch("/api/transcribe", { method: "POST", body: fd, signal: ctrl.signal });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data.error) throw new Error(data.error || `transcribe ${resp.status}`);
      return (data.transcript || "").toString().trim();
    } finally {
      clearTimeout(to);
    }
  };

  // After the recorder stops: end-cue, "Processing…", build the blob, transcribe, parse.
  const onRecordingStop = async () => {
    endCue();
    teardownAudio();
    const chunks = chunksRef.current; chunksRef.current = [];
    const mime = mimeRef.current || "audio/webm";
    const total = chunks.reduce((acc, c) => acc + (c.size || 0), 0);
    if (!chunks.length || total === 0) { setVoiceState("idle"); openManualAdd(MIC_NO_SPEECH); return; }
    setVoiceState("parsing");
    const blob = new Blob(chunks, { type: mime });
    try {
      const transcript = await transcribeBlob(blob, mime);
      if (!transcript) { setVoiceState("idle"); openManualAdd(MIC_NO_SPEECH); return; }
      await submitTranscript(transcript);
    } catch (err) {
      console.error("transcribe failed:", err);
      setVoiceState("idle");
      openManualAdd(MIC_SERVICE);
    }
  };

  // Start MediaRecorder on an already-acquired mic stream + wire silence detection.
  const beginRecording = (stream) => {
    streamRef.current = stream;
    chunksRef.current = [];
    const mime = pickMime();
    mimeRef.current = mime || "audio/webm";
    let recorder;
    try { recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); }
    catch (_) { try { recorder = new MediaRecorder(stream); } catch (_2) { teardownAudio(); setVoiceState("idle"); openManualAdd(MIC_GENERIC); return; } }
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    recorder.onstop = onRecordingStop;
    recorder.onerror = () => { teardownAudio(); recorderRef.current = null; setVoiceState("idle"); openManualAdd(MIC_NO_START); };

    // Silence-detection graph. AnalyserNode is read-only (never connected to output → no feedback).
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        audioCtxRef.current = ctx;
        try { ctx.resume(); } catch (_) { /* iOS: resume so RMS reads real audio */ }
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        src.connect(analyser);
        startSilenceLoop(analyser);
      }
    } catch (_) { /* no auto-silence; the Stop tap still ends it */ }

    finalizeRef.current = () => stopRecording();
    try { recorder.start(); } catch (_) { teardownAudio(); recorderRef.current = null; setVoiceState("idle"); openManualAdd(MIC_NO_START); return; }
    setVoiceState("listening");
  };

  // Play the start cue, acquire the mic, and begin recording. A blocked user gets the in-app
  // permission card; an unsupported browser → manual form.
  const startVoice = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === "undefined") {
      openManualAdd(MIC_GENERIC); return;
    }
    setVoiceNote(null);
    setVoiceState("pending");
    startCue();

    let cancelled = false;
    finalizeRef.current = () => { cancelled = true; };

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      finalizeRef.current = null;
      setVoiceState("idle");
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") { setMicHint(""); setMicBusy(false); setMicTries(0); setMicCard("ask"); }
      else openManualAdd(MIC_NO_START);
      return;
    }
    if (cancelled) { try { stream.getTracks().forEach(t => t.stop()); } catch (_) { /* ignore */ } setVoiceState("idle"); return; }
    beginRecording(stream);
  };

  // Permission-card primary action: re-request the mic. Granted → record; still blocked →
  // reveal the inline "how to re-enable" steps in the same card.
  const retryMicPermission = async () => {
    if (micBusy) return;
    setMicHint("");
    setMicBusy(true);
    if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === "undefined") { setMicBusy(false); setMicCard(null); openManualAdd(null); return; }
    try {
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ audio: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("gum-timeout")), 8000)),
      ]);
      setMicBusy(false);
      setMicCard(null);
      setVoiceNote(null);
      setVoiceState("pending");
      startCue();
      beginRecording(stream);
    } catch (err) {
      setMicBusy(false);
      setMicCard("steps");
      setMicTries(n => n + 1);
      setMicHint(
        (err?.name === "NotAllowedError" || err?.name === "SecurityError" || err?.message === "gum-timeout")
          ? "Still blocked — follow the steps above, then tap Enable again."
          : "Couldn't start the mic — follow the steps above, then tap Enable again."
      );
    }
  };

  // Tap-again / external stop for an in-flight recording session.
  const stopVoice = () => { if (finalizeRef.current) finalizeRef.current(); };
  // Pre-trip estimator handoff: estimator stores `pendingTrip` in localStorage,
  // we hydrate the new-trip form once when the user lands authenticated.
  const [pendingPrefill, setPendingPrefill] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    // Grab + clear the handoff before any async work so a refresh mid-flight
    // doesn't re-fire it. Held in component state for the form to consume.
    let prefill = null;
    try {
      const raw = localStorage.getItem("pendingTrip");
      if (raw) {
        prefill = JSON.parse(raw);
        localStorage.removeItem("pendingTrip");
      }
    } catch (_) { /* ignore parse / storage errors */ }
    if (prefill) setPendingPrefill(prefill);

    (async () => {
      try {
        const trips = await fetchTrips(user.id);
        if (cancelled) return;
        if (trips.length > 0) {
          const latest = trips[0];
          setTrip(latest);
          setTripDbId(latest.dbId);
          const exps = await fetchExpenses(latest.dbId);
          if (cancelled) return;
          setExpenses(exps);
          // If estimator handed off a prefill, jump straight to the new-trip
          // form even when the user already has trips on file.
          if (prefill) {
            setScreenRaw("create-trip");
            screenHistory.current = ["create-trip"];
          } else {
            setScreenRaw("dashboard");
            screenHistory.current = ["dashboard"];
          }
        } else {
          // First-time user: skip the welcome splash if estimator handed off
          if (prefill) {
            setScreenRaw("create-trip");
            screenHistory.current = ["create-trip"];
          } else {
            setScreenRaw("welcome");
            screenHistory.current = ["welcome"];
          }
        }
      } catch (err) {
        console.error("Load failed:", err);
        alert("Couldn't load your trips. Check your connection and refresh.");
      } finally {
        if (!cancelled) setLoaded(true);
        window.history.replaceState({}, "");
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // CLOUD SYNC: Save trip changes (debounced)
  useEffect(() => {
    if (!loaded || !user?.id) return;
    if (!trip || !trip.name) return;
    const timer = setTimeout(async () => {
      try {
        setSyncing(true);
        if (!tripDbId) {
          const created = await createTrip(user.id, trip);
          setTripDbId(created.dbId);
        } else {
          await updateTrip(tripDbId, trip);
        }
      } catch (err) {
        console.error("Sync failed:", err);
      } finally {
        setSyncing(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [trip, loaded, user?.id, tripDbId]);

  // Mirror expenses into a ref so the Undo toast can find the auto-saved row by its stable
  // _voiceKey even after addExpense has remapped its id to the Supabase id post-persist.
  const expensesRef = useRef(expenses);
  useEffect(() => { expensesRef.current = expenses; }, [expenses]);
  // Auto-dismiss the confirmation toast after ~5s.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  const undoVoiceExpense = (voiceKey) => {
    setToast(null);
    const target = expensesRef.current.find(x => x._voiceKey === voiceKey);
    setExpenses(p => p.filter(x => x._voiceKey !== voiceKey));
    if (target?.dbId && user?.id) {
      dbDeleteExpense(target.dbId).catch(err => console.error("undoVoiceExpense delete failed:", err));
    }
  };

  const addExpense = async (e) => {
    // Stamp created_at locally so a just-added row (even if backdated) sorts to the top
    // immediately; reconciled with the DB value after the insert returns.
    const local = { ...e, created_at: e.created_at || new Date().toISOString() };
    setExpenses(p => [...p, local]);
    if (!user?.id || !tripDbId) return;
    try {
      setSyncing(true);
      const saved = await dbCreateExpense(user.id, tripDbId, local);
      setExpenses(p => p.map(x => x.id === local.id ? { ...x, id: saved.id, dbId: saved.id, created_at: saved.created_at || x.created_at } : x));
    } catch (err) {
      console.error("addExpense failed:", err);
      alert("Couldn't save expense. Check your connection.");
    } finally {
      setSyncing(false);
    }
  };
  const updateExpense = async (e) => {
    setExpenses(p => p.map(x => x.id === e.id ? e : x));
    if (!user?.id || !e.id) return;
    try {
      setSyncing(true);
      await dbUpdateExpense(e.id, e);
    } catch (err) {
      console.error("updateExpense failed:", err);
    } finally {
      setSyncing(false);
    }
  };
  const deleteExpense = async (id) => {
    setExpenses(p => p.filter(x => x.id !== id));
    if (!user?.id || !id) return;
    try {
      setSyncing(true);
      await dbDeleteExpense(id);
    } catch (err) {
      console.error("deleteExpense failed:", err);
    } finally {
      setSyncing(false);
    }
  };
  const selectTrip = async (pickedTrip) => {
    try {
      setSyncing(true);
      const exps = await fetchExpenses(pickedTrip.dbId);
      setTrip(pickedTrip);
      setTripDbId(pickedTrip.dbId);
      setExpenses(exps);
      setScreen("dashboard");
      screenHistory.current = ["dashboard"];
    } catch (err) {
      console.error("selectTrip failed:", err);
      alert("Couldn't load that trip. Check your connection.");
    } finally {
      setSyncing(false);
    }
  };

  const duplicateExpense = (e) => { const d = { ...e, id: uid(), date: localToday(), status: "paid" }; addExpense(d); setSelectedExpense(d); };
  const handleEdit = (e) => { setSelectedExpense(e); setEditExpense(e); setScreen("edit"); };
  const handleEditSave = (e) => { updateExpense(e); setEditExpense(null); setScreen("history"); };
  const isNav = ["dashboard", "history", "budget", "reports"].includes(screen);

  // ─── DRAGGABLE FAB PAIR (mic + plus) ─────────────────────────────
  // Free-drag the pair anywhere in the band above the nav. A press that moves
  // less than FAB_TAP_THRESHOLD is a TAP (runs that button's action); anything
  // more is a DRAG (repositions, fires no action). Position is session-only.
  const [fabPos, setFabPos] = useState(() => (typeof window !== "undefined" ? startFabPos() : { x: 0, y: 0 }));
  const fabRef = useRef(null);        // container — nudged directly during drag (no re-render)
  const fabDrag = useRef(null);       // active drag: { sx, sy, bx, by, moved, fab, lastX, lastY }
  const fabMovedRef = useRef(false);  // true once dragged → stop auto-repositioning
  useEffect(() => {
    if (isNav && !fabMovedRef.current) setFabPos(startFabPos());
  }, [isNav]);
  useEffect(() => {
    const onResize = () => setFabPos(p => clampFab(p.x, p.y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const onFabDown = (e) => {
    const fab = e.target.closest?.("[data-fab]")?.dataset?.fab || null;
    fabDrag.current = { sx: e.clientX, sy: e.clientY, bx: fabPos.x, by: fabPos.y, moved: false, fab, lastX: fabPos.x, lastY: fabPos.y };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  };
  const onFabMove = (e) => {
    const d = fabDrag.current;
    if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) > FAB_TAP_THRESHOLD) d.moved = true;
    if (d.moved) {
      const p = clampFab(d.bx + dx, d.by + dy);
      d.lastX = p.x; d.lastY = p.y;
      if (fabRef.current) { fabRef.current.style.left = p.x + "px"; fabRef.current.style.top = p.y + "px"; }
    }
  };
  const onFabUp = (e) => {
    const d = fabDrag.current;
    fabDrag.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    if (!d) return;
    if (d.moved) { fabMovedRef.current = true; setFabPos({ x: d.lastX, y: d.lastY }); return; }
    // A tap → run the pressed button's action.
    if (d.fab === "mic") { if (voiceState === "idle") startVoice(); else if (voiceState === "listening" || voiceState === "pending") stopVoice(); } // parsing → no-op
    else if (d.fab === "add") { setShowQuickAdd(true); }                      // manual text quick-add
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif", background: T.bg, color: T.text, maxWidth: 390, margin: "0 auto", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      {screen !== "welcome" && screen !== "create-trip" && (
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: T.bg + "EE", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}><HeaderLogo size={24} /><span style={{ fontSize: 18, fontWeight: 900, whiteSpace: "nowrap" }}><span style={{ color: T.text }}>My</span><span style={{ color: T.accent }}>Trip</span><span style={{ color: T.text }}>Money</span></span></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: T.textMid, fontSize: 12, display: "inline-block", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(trip.country ? countryByCode(trip.country).flag : curByCode(trip.currency).flag)} {trip.isMultiLeg ? `${trip.legs.length} legs` : trip.destination}</span>
            <button onClick={() => setScreen("trips-list")} title="My Trips" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, color: T.textDim }}>🔄</button>
            <button onClick={() => setScreen("settings")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, color: T.textDim }}>⚙️</button>
            <button onClick={onSignOut} style={{ background: "transparent", border: `1px solid ${T.accent}55`, color: T.accent, borderRadius: 10, padding: "5px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", lineHeight: 1 }}>Log out</button>
          </div>
        </div>
      )}
      <div>
        {screen === "welcome" && <WelcomeScreen onStart={() => { setTrip(DEFAULT_TRIP); setExpenses(SEED_EXPENSES); setScreen("dashboard"); }} onCreateTrip={() => setScreen("create-trip")} onInstall={onInstall} isInstalled={isInstalled} canInstall={canInstall} isIOS={isIOS} isMobile={isMobile} isPro={isPro} onPaywall={onPaywall} user={user} />}
        {screen === "create-trip" && <CreateTripScreen onSave={t => { setTrip(t); setExpenses([]); setPendingPrefill(null); setScreen("dashboard"); }} onBack={() => { setPendingPrefill(null); setScreen(trip && trip.name ? "dashboard" : "welcome"); }} isPro={isPro} onPaywall={onPaywall} prefill={pendingPrefill} />}
        {screen === "dashboard" && <DashboardScreen expenses={expenses} trip={trip} setScreen={setScreen} setSelectedExpense={setSelectedExpense} />}
        {screen === "history" && <HistoryScreen expenses={expenses} trip={trip} setScreen={setScreen} setSelectedExpense={setSelectedExpense} onEdit={handleEdit} onAddPrior={() => { setVoicePrefill(null); setVoiceNote(null); setScreen("prior-date"); }} />}
        {screen === "prior-date" && <PriorDateScreen onPick={(d) => { setPriorDate(d); setScreen("prior-entry"); }} onCancel={() => setScreen("history")} />}
        {screen === "prior-entry" && priorDate && <PriorEntryScreen date={priorDate} voiceState={voiceState} onMic={() => { if (voiceState === "idle") startVoice(); else if (voiceState === "listening" || voiceState === "pending") stopVoice(); }} onManual={() => { setVoicePrefill(null); setVoiceNote(null); setAddFocusDate(true); setScreen("add"); }} onChangeDate={() => setScreen("prior-date")} onBack={() => setScreen("history")} />}
        {screen === "add" && <AddExpenseScreen onSave={addExpense} onBack={() => { setVoicePrefill(null); setVoiceNote(null); setPriorDate(null); setScreen("dashboard"); }} trip={trip} prefill={voicePrefill} note={voiceNote} defaultDate={priorDate} focusDate={addFocusDate} />}
        {screen === "edit" && <AddExpenseScreen onSave={handleEditSave} onBack={() => setScreen("expense-detail")} trip={trip} editExpense={editExpense} />}
        {screen === "budget" && <BudgetScreen expenses={expenses} trip={trip} />}
        {screen === "reports" && <ReportsScreen expenses={expenses} trip={trip} setScreen={setScreen} />}
        {screen === "expense-detail" && <ExpenseDetailScreen expense={selectedExpense} trip={trip} setScreen={setScreen} onDelete={deleteExpense} onDuplicate={duplicateExpense} onEdit={handleEdit} />}
        {screen === "trips-list" && <TripsListScreen user={user} currentTripDbId={tripDbId} onSelectTrip={selectTrip} onNewTrip={() => setScreen("create-trip")} onBack={() => setScreen(trip ? "dashboard" : "welcome")} isPro={isPro} onPaywall={onPaywall} />}
        {screen === "settings" && <SettingsScreen trip={trip} onUpdateTrip={setTrip} onClearData={() => { setExpenses([]); setScreen("dashboard"); }} onDeleteTrip={async () => { try { if (tripDbId) await dbDeleteTrip(tripDbId); } catch (err) { console.error("deleteTrip failed:", err); alert("Could not delete trip. Try again."); return; } setExpenses([]); setTrip(null); setTripDbId(null); setScreen("welcome"); screenHistory.current = ["welcome"]; }} onNewTrip={() => setScreen("create-trip")} onBack={() => setScreen("dashboard")} user={user} profile={profile} isPro={isPro} onSignOut={onSignOut} onInstall={onInstall} isInstalled={isInstalled} onPaywall={onPaywall} />}
        {screen === "email-report" && <EmailReportScreen trip={trip} expenses={expenses} onBack={() => setScreen("reports")} />}
      </div>
      {showQuickAdd && <QuickAddSheet onSave={addExpense} onFullForm={() => { setVoicePrefill(null); setVoiceNote(null); setPriorDate(null); setShowQuickAdd(false); setScreen("add"); }} onClose={() => setShowQuickAdd(false)} trip={trip} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 358, zIndex: 300, background: T.surface, border: `1px solid ${T.green}66`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
          <div style={{ flex: 1, color: T.text, fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Added {toast.title} {curByCode(toast.currency).symbol}{toast.amount} ✓</div>
          <button onClick={() => undoVoiceExpense(toast.voiceKey)} style={{ background: "none", border: `1px solid ${T.accent}`, color: T.accent, borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>Undo</button>
          <button onClick={() => setToast(null)} aria-label="Dismiss" style={{ background: "none", border: "none", color: T.textDim, fontSize: 20, cursor: "pointer", flexShrink: 0, lineHeight: 1, padding: 0 }}>×</button>
        </div>
      )}
      {micCard && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,15,30,0.55)", backdropFilter: "blur(4px)" }} onClick={() => { setMicCard(null); setMicBusy(false); setMicHint(""); }} />
          <div style={{ position: "relative", width: "calc(100% - 24px)", maxWidth: 380, margin: "0 auto 16px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 20, padding: "22px 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <style>{`@keyframes micspin { to { transform: rotate(360deg); } } @keyframes micstepflash { 0% { box-shadow: 0 0 0 0 ${T.accent}00; } 30% { box-shadow: 0 0 0 3px ${T.accent}88; } 100% { box-shadow: 0 0 0 0 ${T.accent}00; } }`}</style>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🎤</div>
            <div style={{ color: T.text, fontSize: 19, fontWeight: 900, letterSpacing: -0.3, marginBottom: 6 }}>Enable microphone to log by voice</div>
            <div style={{ color: T.textMid, fontSize: 14, lineHeight: 1.45, marginBottom: 18 }}>
              {micCard === "ask"
                ? "Tap “Enable Microphone” and choose Allow — then just say your expense out loud."
                : "The mic is still blocked. Turn it back on in a couple of taps — no need to leave MyTripMoney:"}
            </div>
            {micCard === "steps" && (
              <div key={micTries} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18, borderRadius: 14, animation: micTries ? "micstepflash 0.9s ease-out" : "none" }}>
                {[["🔒", "Tap the lock icon at the top, next to the web address"], ["⚙️", "Open Permissions (or “Site settings”)"], ["🎤", "Switch Microphone to Allow"], ["↩️", "Come back and tap “Enable Microphone” below"]].map(([icon, text], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 12px" }}>
                    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: T.accent + "22", color: T.accent, fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                    <span style={{ fontSize: 17, flexShrink: 0 }}>{icon}</span>
                    <span style={{ color: T.text, fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{text}</span>
                  </div>
                ))}
              </div>
            )}
            {micHint && <div style={{ color: T.accent, fontSize: 13, fontWeight: 700, marginBottom: 10, lineHeight: 1.35 }}>{micHint}</div>}
            <button onClick={retryMicPermission} disabled={micBusy} style={{ width: "100%", background: T.accent, color: "#FFFFFF", border: "none", borderRadius: 14, padding: 15, fontSize: 16, fontWeight: 800, cursor: micBusy ? "default" : "pointer", opacity: micBusy ? 0.75 : 1, marginBottom: 10, boxShadow: `0 8px 22px ${T.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {micBusy && <span style={{ width: 15, height: 15, border: "2px solid #FFFFFF", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "micspin 0.7s linear infinite" }} />}
              {micBusy ? "Requesting…" : "Enable Microphone"}
            </button>
            <button onClick={() => { setMicCard(null); setMicBusy(false); setMicHint(""); openManualAdd(null); }} disabled={micBusy} style={{ width: "100%", background: "none", color: T.textMid, border: "none", borderRadius: 14, padding: 10, fontSize: 14, fontWeight: 700, cursor: micBusy ? "default" : "pointer", opacity: micBusy ? 0.6 : 1 }}>Maybe later — enter manually</button>
          </div>
        </div>
      )}
      {isNav && !showQuickAdd && (
        <div
          ref={fabRef}
          onPointerDown={onFabDown}
          onPointerMove={onFabMove}
          onPointerUp={onFabUp}
          onPointerCancel={onFabUp}
          style={{ position: "fixed", left: fabPos.x, top: fabPos.y, display: "flex", flexDirection: "column", gap: FAB_GAP, zIndex: 100, alignItems: "center", touchAction: "none" }}
        >
          <style>{`@keyframes vpulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.7; } }`}</style>
          <button data-fab="mic" title={voiceState === "listening" || voiceState === "pending" ? "Tap to stop" : "Add by voice (drag to move)"} style={{ width: FAB_SIZE, height: FAB_SIZE, borderRadius: "50%", background: voiceState === "listening" ? T.red : T.surface, border: `2px solid ${voiceState === "listening" ? T.red : T.accent}`, cursor: "pointer", touchAction: "none", padding: 0, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", color: voiceState === "listening" ? "#fff" : T.text, boxShadow: voiceState === "listening" ? `0 8px 30px ${T.red}66` : `0 4px 20px ${T.accent}33`, animation: (voiceState === "listening" || voiceState === "pending") ? "vpulse 1s ease-in-out infinite" : "none" }}>{voiceState === "parsing" ? "⏳" : <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>}</button>
          <button data-fab="add" title="Add expense (drag to move)" style={{ width: FAB_SIZE, height: FAB_SIZE, borderRadius: "50%", background: T.accent, border: "none", cursor: "pointer", touchAction: "none", padding: 0, fontSize: 28, fontWeight: 900, color: T.bg, boxShadow: `0 8px 30px ${T.accent}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
      )}
      {isNav && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: T.surface + "F0", backdropFilter: "blur(16px)", borderTop: `1px solid ${T.border}`, display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {NAV.map(({ id, icon, label }) => <button key={id} onClick={() => { if (id === "reports" && !isPro) { onPaywall("Reports"); return; } setScreen(id); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", gap: 3 }}><span style={{ fontSize: 20 }}>{icon}</span><span style={{ fontSize: 10, fontWeight: 700, color: screen === id ? T.accent : T.textDim }}>{label}</span>{screen === id && <div style={{ width: 20, height: 2, background: T.accent, borderRadius: 99 }} />}</button>)}
        </div>
      )}
    </div>
  );
}
