/* Jalali (Shamsi) + Gregorian date helpers for the Persian UI */

import {
  toJalaali,
  toGregorian,
  jalaaliMonthLength as jalaliMonthDays,
} from 'jalaali-js';
import { toFaDigits, toEnDigits } from './format.js';

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export const WEEKDAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

/** Today as an ISO date string (yyyy-mm-dd), timezone-local. */
export function todayISO() {
  return toISO(new Date());
}

export function toISO(date) {
  const d = date instanceof Date ? date : new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** ISO date shifted by n days (negative = past). */
export function shiftDays(iso, n) {
  const d = iso ? new Date(iso) : new Date();
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function toJalali(iso) {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function jalaliToGregorian(jy, jm, jd) {
  const g = toGregorian(jy, jm, jd);
  return toISO(new Date(g.gy, g.gm - 1, g.gd));
}

export function jalaliMonthLength(jy, jm) {
  return jalaliMonthDays(jy, jm);
}

/** 1405/07/16 — compact Persian date */
export function formatJalali(iso, { faDigits = true } = {}) {
  const j = toJalali(iso);
  if (!j) return '—';
  const s = `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
  return faDigits ? toFaDigits(s) : s;
}

/** ۱۶ مهر ۱۴۰۵ — long Persian date */
export function formatJalaliLong(iso, { faDigits = true } = {}) {
  const j = toJalali(iso);
  if (!j) return '—';
  const s = `${j.jd} ${JALALI_MONTHS[j.jm - 1]} ${j.jy}`;
  return faDigits ? toFaDigits(s) : s;
}

/** ISO string -> Jalali parts for pickers */
export function jalaliParts(iso) {
  return toJalali(iso) || { jy: 1400, jm: 1, jd: 1 };
}

/** Parse a Jalali date typed as ۱۴۰۵/۰۷/۱۶ (Latin or Persian digits). */
export function parseJalali(str) {
  const parts = toEnDigits(String(str || '')).split(/[\/\-.]/).map((p) => Number(p.trim()));
  const [jy, jm, jd] = parts;
  if (!jy || !jm || !jd) return null;
  if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
  return jalaliToGregorian(jy, jm, jd);
}

export function currentJalaliYear() {
  return toJalali(new Date()).jy;
}

/** Relative label used in activity timelines: امروز / دیروز / ۵ روز پیش */
export function relativeDay(iso) {
  const a = new Date(iso);
  const b = new Date();
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diff = Math.round((b - a) / 86400000);
  if (diff === 0) return 'امروز';
  if (diff === 1) return 'دیروز';
  if (diff > 1 && diff < 30) return `${toFaDigits(diff)} روز پیش`;
  if (diff < 0) return formatJalali(iso);
  return formatJalaliLong(iso);
}

/** Month buckets for the trailing n Gregorian months, with Jalali labels. */
export function lastMonths(n = 6) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: JALALI_MONTHS[toJalali(d).jm - 1],
      start: toISO(d),
      end: toISO(end),
    });
  }
  return out;
}

export function monthKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
