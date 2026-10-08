/* Number + currency formatting (Persian-first) */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Convert every Latin digit in a string to Persian digits. */
export function toFaDigits(input) {
  return String(input ?? '').replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Convert Persian/Arabic-Indic digits back to Latin digits. */
export function toEnDigits(input) {
  return String(input ?? '')
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

/** Parse a possibly Persian-digit numeric string into a Number. */
export function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = toEnDigits(String(value)).replace(/[^\d.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** 12580000 -> "۱۲۵,۸۰۰,۰۰۰" */
export function formatNumber(value, { faDigits = true, decimals = 0 } = {}) {
  const n = Number(value) || 0;
  const s = n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return faDigits ? toFaDigits(s) : s;
}

export const CURRENCY_UNITS = ['تومان', 'ریال'];

/** 12580000 + "تومان" -> "۱۲۵,۸۰۰,۰۰۰ تومان" */
export function formatMoney(value, currency = 'تومان', { faDigits = true } = {}) {
  return `${formatNumber(value, { faDigits })} ${currency}`;
}

/** Compact money for chart axes/tooltips: ۱۲۵٫۸ م / ۳٫۲ میلیارد */
export function formatMoneyShort(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${toFaDigits((n / 1_000_000_000).toFixed(1))} میلیارد`;
  if (abs >= 1_000_000) return `${toFaDigits((n / 1_000_000).toFixed(1))} م`;
  if (abs >= 1_000) return `${toFaDigits((n / 1_000).toFixed(0))} هزار`;
  return toFaDigits(String(n));
}

/** Percentage, e.g. 9 -> "۹٪" */
export function formatPercent(value, decimals = 0) {
  return `${toFaDigits((Number(value) || 0).toFixed(decimals))}٪`;
}
