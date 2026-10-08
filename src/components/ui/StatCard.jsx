import { TrendingUp, TrendingDown } from 'lucide-react';
import { toFaDigits } from '../../lib/format.js';

/**
 * StatCard — dashboard KPI tile.
 * tone: brand | success | warning | danger | gold | indigo
 */
export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'brand',
  trend,
  trendLabel,
  footer,
}) {
  const hasTrend = typeof trend === 'number' && Number.isFinite(trend);
  const up = hasTrend && trend >= 0;

  return (
    <article className={`stat stat--${tone}`}>
      <header className="stat__head">
        <span className="stat__label">{label}</span>
        {Icon ? (
          <span className="stat__icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        ) : null}
      </header>
      <div className="stat__value num">{value}</div>
      <footer className="stat__foot">
        {hasTrend ? (
          <span className={`stat__trend ${up ? 'is-up' : 'is-down'}`}>
            {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="num">{toFaDigits(Math.abs(trend).toFixed(1))}٪</span>
          </span>
        ) : null}
        {trendLabel ? <span className="stat__hint">{trendLabel}</span> : null}
        {hint ? <span className="stat__hint">{hint}</span> : null}
        {footer}
      </footer>
    </article>
  );
}
