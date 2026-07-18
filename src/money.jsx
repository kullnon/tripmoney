// ─── MONEY FORMATTING + INPUT ─────────────────────────────────────
// MyTripMoney amount helpers and the caret-preserving <MoneyInput/>.
//
// Design contract (read before wiring in):
//   • Canonical value = a plain string using "." as the decimal separator and
//     NO grouping (e.g. "1234.56", "" for empty). This is what parents STORE and
//     what MoneyInput emits via onChange — so existing `parseFloat(form.amount)`
//     and Supabase writes keep receiving a clean numeric string. Never store the
//     formatted display string.
//   • Display = locale + currency aware. Grouping/decimal separators come from the
//     runtime locale; the number of decimals comes from the CURRENCY (JPY/KRW→0,
//     USD→2, KWD/BHD→3, …). Nothing here is hardcoded to en-US.
//   • fmtNum/fmtCur are DISPLAY-only. parseNum is the inverse (formatted → Number).
//
// Locale note: the read-only fmtNum() uses Intl end-to-end, so it renders every
// locale's grouping exactly (incl. Indian 1,23,456). MoneyInput groups its live
// integer part through Intl as well (BigInt-backed, so long amounts don't lose
// precision), so typing is grouped the same way the displays are.

import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";

// App locale for separators. Currency still drives decimal COUNT below.
const APP_LOCALE =
  (typeof navigator !== "undefined" && navigator.language) || "en-US";

// Resolve the grouping char, decimal char, and min/max fraction digits for a
// given currency under a locale. Cached per (currency, locale) by the caller.
export function numberConventions(currency = "USD", locale) {
  const loc = locale || APP_LOCALE;
  let minFrac = 2;
  let maxFrac = 2;
  try {
    const o = new Intl.NumberFormat(loc, { style: "currency", currency }).resolvedOptions();
    minFrac = o.minimumFractionDigits;
    maxFrac = o.maximumFractionDigits;
  } catch {
    // Unknown / non-ISO code: fall back to the common cases.
    maxFrac = minFrac = currency === "JPY" || currency === "KRW" ? 0 : 2;
  }
  let group = ",";
  let decimal = ".";
  try {
    // Probe a number that exercises both a group and a decimal so we can read the
    // locale's actual separators. Force one decimal so a decimal part exists.
    const parts = new Intl.NumberFormat(loc, {
      minimumFractionDigits: maxFrac ? 1 : 0,
      maximumFractionDigits: maxFrac ? 1 : 0,
    }).formatToParts(11111.1);
    for (const p of parts) {
      if (p.type === "group") group = p.value;
      else if (p.type === "decimal") decimal = p.value;
    }
  } catch {
    /* keep the "," / "." defaults */
  }
  return { locale: loc, group, decimal, minFrac, maxFrac };
}

// Formatted/typed string → canonical ("." decimal, no grouping, clamped decimals).
// Accepts the locale decimal AND a literal "." (people type periods everywhere),
// drops grouping/spaces/letters, keeps only the first decimal, clamps fraction
// digits to the currency's maximum. Leading zeros are left as-typed.
function toCanonical(input, conv) {
  const dec = conv.decimal;
  let intp = "";
  let frac = "";
  let seenDec = false;
  for (const ch of String(input)) {
    if (ch >= "0" && ch <= "9") {
      if (seenDec) frac += ch;
      else intp += ch;
      continue;
    }
    const isDec =
      conv.maxFrac > 0 && !seenDec && (ch === dec || (dec !== "." && ch === "."));
    if (isDec) seenDec = true;
    // anything else (group separator, space, stray char, extra decimal) is dropped
  }
  if (!seenDec) return intp;
  return intp + "." + frac.slice(0, conv.maxFrac);
}

// Locale-correct grouping of a pure-digit integer string. BigInt-backed so very
// long amounts keep every digit (Number would round past ~15 digits), and Intl
// handles non-3 grouping styles (e.g. Indian) for free.
function groupIntPart(digits, conv) {
  if (!digits) return "";
  try {
    return new Intl.NumberFormat(conv.locale, {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(BigInt(digits));
  } catch {
    // Fallback: simple 3-grouping with the resolved group char.
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, conv.group);
  }
}

// Canonical → display (grouped integer + locale decimal + raw fraction, unpadded
// so the field doesn't force "12.00" while you're still typing "12").
function canonicalToDisplay(canonical, conv) {
  if (!canonical) return "";
  const dot = canonical.indexOf(".");
  const intp = dot === -1 ? canonical : canonical.slice(0, dot);
  const frac = dot === -1 ? "" : canonical.slice(dot + 1);
  const grouped = groupIntPart(intp, conv);
  return dot === -1 ? grouped : grouped + conv.decimal + frac;
}

// "Significant" = a digit or the decimal char; grouping separators are ignored.
// Used to translate a caret position across a reformat without it jumping.
const isSig = (ch, conv) => (ch >= "0" && ch <= "9") || ch === conv.decimal;
function countSig(str, conv) {
  let n = 0;
  for (const ch of str) if (isSig(ch, conv)) n++;
  return n;
}
function caretForSig(display, sig, conv) {
  if (sig <= 0) {
    for (let i = 0; i < display.length; i++) if (isSig(display[i], conv)) return i;
    return display.length;
  }
  let seen = 0;
  for (let i = 0; i < display.length; i++) {
    if (isSig(display[i], conv)) {
      seen++;
      if (seen === sig) return i + 1;
    }
  }
  return display.length;
}

// Normalize whatever the parent passes as `value` (number 340, "340", "340.5",
// or even an accidentally-formatted "1,234") into canonical form for display.
function incomingToCanonical(value) {
  if (value == null || value === "") return "";
  return String(value)
    .replace(/[^0-9.]/g, "")   // parents store canonical; strip just in case
    .replace(/(\.[0-9]*)\./g, "$1"); // collapse any accidental 2nd dot
}

// DISPLAY-only: format a numeric value with locale grouping + currency decimals
// (no symbol). Pads to the currency's minimum fraction digits.
export function fmtNum(value, currency = "USD", locale) {
  const conv = numberConventions(currency, locale);
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat(conv.locale, {
    minimumFractionDigits: conv.minFrac,
    maximumFractionDigits: conv.maxFrac,
  }).format(n);
}

// Inverse of the input: any formatted/typed string → a JS Number (NaN if empty
// or not a number). Strips grouping and normalizes the decimal before parsing.
// Store the RESULT (a number), never the formatted string.
export function parseNum(input, currency = "USD", locale) {
  if (input == null || input === "") return NaN;
  const conv = numberConventions(currency, locale);
  const canonical = toCanonical(String(input), conv);
  if (canonical === "" || canonical === ".") return NaN;
  return Number(canonical);
}

// ─── <MoneyInput/> ────────────────────────────────────────────────
// Controlled amount field.
//   value      – canonical string ("1234.56") or number; "" when empty
//   onChange   – called with the canonical string on every keystroke
//   currency   – ISO code driving decimals (and, with locale, separators)
//   locale     – optional override; defaults to the runtime locale
//   inputRef   – optional ref to the underlying <input>
// Any other props (style, placeholder, autoFocus, onBlur, aria-*, …) pass through.
export function MoneyInput({
  value,
  onChange,
  currency = "USD",
  locale,
  inputRef,
  placeholder = "0.00",
  style,
  ...rest
}) {
  const conv = useMemo(() => numberConventions(currency, locale), [currency, locale]);
  const innerRef = useRef(null);
  const ref = inputRef || innerRef;
  const caretRef = useRef(null);     // caret index to restore after a reformat
  const lastCanonical = useRef(incomingToCanonical(value));

  const incoming = incomingToCanonical(value);
  const [display, setDisplay] = useState(() => canonicalToDisplay(incoming, conv));

  // Resync display when the parent changes the value out-of-band (quick-amount
  // buttons, foreign-currency sync, edit prefill) OR when currency/locale changes.
  // During typing this is a no-op: our onChange already set display + lastCanonical
  // to the same canonical the parent echoes back, so setDisplay gets an equal
  // string and React skips the re-render (caret stays put).
  useEffect(() => {
    lastCanonical.current = incoming;
    setDisplay(canonicalToDisplay(incoming, conv));
  }, [incoming, conv]);

  // Restore the caret right after the reformatted value paints.
  useLayoutEffect(() => {
    if (caretRef.current != null && ref.current) {
      try {
        ref.current.setSelectionRange(caretRef.current, caretRef.current);
      } catch {
        /* element not focusable right now — ignore */
      }
      caretRef.current = null;
    }
  }, [display, ref]);

  const handleChange = (e) => {
    const el = e.target;
    const raw = el.value;
    const caret = el.selectionStart == null ? raw.length : el.selectionStart;
    const sig = countSig(raw.slice(0, caret), conv);
    const canonical = toCanonical(raw, conv);
    const next = canonicalToDisplay(canonical, conv);
    caretRef.current = caretForSig(next, sig, conv);
    lastCanonical.current = canonical;
    setDisplay(next);
    onChange && onChange(canonical);
  };

  return (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      pattern="[0-9.,\s]*"
      autoComplete="off"
      value={display}
      placeholder={placeholder}
      onChange={handleChange}
      style={style}
      {...rest}
    />
  );
}
