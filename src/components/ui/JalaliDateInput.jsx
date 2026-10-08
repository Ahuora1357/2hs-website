import { useId } from 'react';
import { JALALI_MONTHS, jalaliParts, jalaliToGregorian, jalaliMonthLength, currentJalaliYear } from '../../lib/date.js';
import { toFaDigits } from '../../lib/format.js';

/**
 * Jalali (Shamsi) date picker built from three selects.
 * `value` is an ISO (yyyy-mm-dd) string; onChange receives an ISO string.
 */
export default function JalaliDateInput({ value, onChange, label, id, disabled = false }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const parts = jalaliParts(value);
  const year = parts.jy;
  const baseYear = currentJalaliYear();
  const years = [];
  for (let y = baseYear - 5; y <= baseYear + 2; y += 1) years.push(y);
  const dayCount = jalaliMonthLength(year, parts.jm);
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  const commit = (jy, jm, jd) => {
    const maxDay = jalaliMonthLength(jy, jm);
    const safeDay = Math.min(jd, maxDay);
    onChange(jalaliToGregorian(jy, jm, safeDay));
  };

  return (
    <div className="field">
      {label ? <label className="field__label" htmlFor={fieldId}>{label}</label> : null}
      <div className="row gap-2" id={fieldId}>
        <select
          className="input select"
          value={year}
          disabled={disabled}
          onChange={(e) => commit(Number(e.target.value), parts.jm, parts.jd)}
          aria-label="سال"
        >
          {years.map((y) => <option key={y} value={y}>{toFaDigits(y)}</option>)}
        </select>
        <select
          className="input select"
          value={parts.jm}
          disabled={disabled}
          onChange={(e) => commit(year, Number(e.target.value), parts.jd)}
          aria-label="ماه"
        >
          {JALALI_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select
          className="input select"
          value={parts.jd}
          disabled={disabled}
          onChange={(e) => commit(year, parts.jm, Number(e.target.value))}
          aria-label="روز"
        >
          {days.map((d) => <option key={d} value={d}>{toFaDigits(d)}</option>)}
        </select>
      </div>
    </div>
  );
}
