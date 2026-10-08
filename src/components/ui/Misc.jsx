import { Loader2 } from 'lucide-react';

/** Friendly empty state used in tables, lists and dashboards. */
export function EmptyState({ icon: Icon, title, message, action, compact = false }) {
  return (
    <div className={`empty ${compact ? 'empty--compact' : ''}`}>
      {Icon ? (
        <span className="empty__icon" aria-hidden="true">
          <Icon size={compact ? 22 : 30} />
        </span>
      ) : null}
      <h3 className="empty__title">{title}</h3>
      {message ? <p className="empty__message">{message}</p> : null}
      {action ? <div className="empty__action">{action}</div> : null}
    </div>
  );
}

/** Loading placeholder with brand-tinted shimmer. */
export function Skeleton({ width = '100%', height = 14, radius = 8, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function Spinner({ size = 18, label = 'در حال بارگذاری' }) {
  return (
    <span className="spinner" role="status" aria-label={label}>
      <Loader2 size={size} />
    </span>
  );
}

/** Thin progress / completion bar. */
export function ProgressBar({ value = 0, tone = 'brand', label, max = 100 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span className={`progress__fill progress__fill--${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Segmented control — used for month/year toggles and view switches. */
export function Segmented({ options = [], value, onChange, size = 'md', ariaLabel }) {
  return (
    <div className={`segmented segmented--${size}`} role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = val === value;
        return (
          <button
            key={val}
            type="button"
            role="tab"
            aria-selected={active}
            className={`segmented__item ${active ? 'is-active' : ''}`}
            onClick={() => onChange?.(val)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Underlined tab bar for in-page sections. */
export function Tabs({ tabs = [], value, onChange, ariaLabel }) {
  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={t.value === value}
          className={`tabs__item ${t.value === value ? 'is-active' : ''}`}
          onClick={() => onChange?.(t.value)}
        >
          {t.label}
          {t.count !== undefined ? <span className="tabs__count num">{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** Contextual inline note (info / warning / success / danger). */
export function InfoNote({ tone = 'info', title, children, icon: Icon }) {
  return (
    <div className={`note note--${tone}`}>
      {Icon ? <Icon size={18} className="note__icon" aria-hidden="true" /> : null}
      <div>
        {title ? <div className="note__title">{title}</div> : null}
        <div className="note__body">{children}</div>
      </div>
    </div>
  );
}

/** Compact definition pair used in detail panels. */
export function DetailRow({ label, children, strong = false }) {
  return (
    <div className="detail-row">
      <dt className="detail-row__label">{label}</dt>
      <dd className={`detail-row__value ${strong ? 'is-strong' : ''}`}>{children}</dd>
    </div>
  );
}
