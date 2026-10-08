import { statusMeta } from '../../lib/calc.js';

/** Small labelled chip. tone: neutral|info|success|warning|danger|gold|brand|muted */
export function Badge({ children, tone = 'neutral', dot = false, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`}>
      {dot ? <span className="badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/** Invoice / record status chip driven by the shared status map. */
export function StatusBadge({ status }) {
  const meta = statusMeta(status);
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

export function Avatar({ name = '', size = 36, tone = 'brand' }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return (
    <span
      className={`avatar avatar--${tone}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials || '؟'}
    </span>
  );
}
