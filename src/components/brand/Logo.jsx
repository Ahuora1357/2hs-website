/**
 * 2HS brand mark — a hexagonal badge holding three interlocking "L" shapes
 * (a pinwheel cube) with the gold → indigo → blue brand gradient.
 */
export function LogoMark({ size = 40, className = '' }) {
  const gradientId = '2hs-mark-gradient';
  return (
    <svg
      className={`logo-mark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="2HS"
    >
      <defs>
        <linearGradient id={gradientId} x1="6%" y1="4%" x2="94%" y2="96%">
          <stop offset="0%" stopColor="#F8A200" />
          <stop offset="38%" stopColor="#FCCE33" />
          <stop offset="68%" stopColor="#5C7CFA" />
          <stop offset="100%" stopColor="#364FC7" />
        </linearGradient>
      </defs>
      <path
        d="M24 3.2 42.1 13.7v20.6L24 44.8 5.9 34.3V13.7Z"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {[0, 120, 240].map((deg) => (
        <path
          key={deg}
          d="M24 13.6V24h10.4"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
    </svg>
  );
}

/**
 * Full lockup: mark + "2HS" wordmark + "HACIN HASEB SEPAHAN" subtitle.
 * variant: 'dark' (on light surfaces) | 'light' (on brand surfaces)
 */
export default function Logo({ size = 42, variant = 'dark', compact = false, showSubtitle = true }) {
  return (
    <span className={`logo logo--${variant} ${compact ? 'logo--compact' : ''}`}>
      <LogoMark size={size} />
      <span className="logo__text">
        <span className="logo__name">2HS</span>
        {showSubtitle ? <span className="logo__sub">HACIN HASEB SEPAHAN</span> : null}
      </span>
    </span>
  );
}
