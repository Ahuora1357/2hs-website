import { useEffect, useRef, useState } from 'react';
import { toFaDigits, formatMoneyShort } from '../../lib/format.js';

/* ------------------------------------------------------------------
   Lightweight, dependency-free SVG charts.
   Responsive (ResizeObserver), accessible (role="img" + description),
   and tuned for Persian labels + Latin tabular numerals.
   ------------------------------------------------------------------ */

function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}

function smoothPath(pts) {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x} ${pts[0].y}`;
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i += 1) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const cx = (p0.x + p1.x) / 2;
    d += ` C${cx} ${p0.y} ${cx} ${p1.y} ${p1.x} ${p1.y}`;
  }
  return d;
}

function Tooltip({ x, y, children }) {
  return (
    <div className="chart-tip" style={{ left: x, top: y }}>
      {children}
    </div>
  );
}

/* ------------------------------- Line / area ------------------------------- */
export function LineChart({
  data = [],
  height = 240,
  color = '#1C7ED6',
  fill = true,
  format = (v) => toFaDigits(Number(v).toLocaleString('en-US')),
  ariaLabel = 'نمودار خطی',
  showGrid = true,
}) {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);
  const pad = { top: 22, right: 14, bottom: 30, left: 14 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  const px = (i) => pad.left + i * stepX;
  const py = (v) => pad.top + innerH - (v / max) * innerH;
  const points = data.map((d, i) => ({ x: px(i), y: py(d.value), ...d }));
  const line = smoothPath(points);
  const area = points.length
    ? `${line} L${points[points.length - 1].x} ${pad.top + innerH} L${points[0].x} ${pad.top + innerH} Z`
    : '';
  const gradId = `line-grad-${String(color).replace(/[^a-z0-9]/gi, '')}`;

  const handleMove = (e) => {
    if (!data.length || innerW <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const idx = Math.min(data.length - 1, Math.max(0, Math.round((mx - pad.left) / (stepX || 1))));
    setActive(idx);
  };

  const gridLines = showGrid ? [0, 0.25, 0.5, 0.75, 1] : [1];

  return (
    <div className="chart" ref={ref}>
      <svg
        width="100%"
        height={height}
        role="img"
        aria-label={`${ariaLabel}: ${data.map((d) => `${d.label} ${format(d.value)}`).join('، ')}`}
        onMouseMove={handleMove}
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g) => (
          <line
            key={g}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + innerH * g}
            y2={pad.top + innerH * g}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={g === 1 ? '0' : '4 6'}
          />
        ))}

        {fill && area ? <path d={area} fill={`url(#${gradId})`} /> : null}
        {line ? (
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {points.map((p, i) => (
          <g key={`${p.label}-${i}`}>
            {active === i ? (
              <line x1={p.x} x2={p.x} y1={pad.top} y2={pad.top + innerH} stroke={color} strokeWidth="1" strokeDasharray="3 4" />
            ) : null}
            <circle
              cx={p.x}
              cy={p.y}
              r={active === i ? 5.5 : 3.5}
              fill="var(--white)"
              stroke={color}
              strokeWidth="2.5"
            />
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="chart__axis-label"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {active !== null && points[active] ? (
        <Tooltip x={points[active].x} y={points[active].y - 12}>
          <strong>{points[active].label}</strong>
          <span className="num">{format(points[active].value)}</span>
        </Tooltip>
      ) : null}
    </div>
  );
}

/* ---------------------------------- Bars ---------------------------------- */
export function BarChart({
  data = [],
  height = 240,
  color = '#1C7ED6',
  format = (v) => formatMoneyShort(v),
  ariaLabel = 'نمودار ستونی',
}) {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);
  const pad = { top: 20, right: 14, bottom: 30, left: 14 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const slot = data.length ? innerW / data.length : 0;
  const barW = Math.min(46, Math.max(12, slot * 0.52));

  return (
    <div className="chart" ref={ref}>
      <svg width="100%" height={height} role="img" aria-label={`${ariaLabel}: ${data.map((d) => `${d.label} ${format(d.value)}`).join('، ')}`}>
        {[0, 0.5, 1].map((g) => (
          <line
            key={g}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + innerH * g}
            y2={pad.top + innerH * g}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={g === 1 ? '0' : '4 6'}
          />
        ))}
        {data.map((d, i) => {
          const h = (d.value / max) * innerH;
          const x = pad.left + i * slot + (slot - barW) / 2;
          const y = pad.top + innerH - h;
          const fill = d.color || color;
          return (
            <g
              key={`${d.label}-${i}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <rect x={pad.left + i * slot} y={pad.top} width={slot} height={innerH} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(h, 2)}
                rx={Math.min(8, barW / 2)}
                fill={fill}
                opacity={active === null || active === i ? 1 : 0.45}
                style={{ transition: 'opacity 160ms ease' }}
              />
              <text x={pad.left + i * slot + slot / 2} y={height - 8} textAnchor="middle" className="chart__axis-label">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {active !== null && data[active] ? (
        <Tooltip
          x={pad.left + active * slot + slot / 2}
          y={pad.top + innerH - (data[active].value / max) * innerH - 10}
        >
          <strong>{data[active].label}</strong>
          <span className="num">{format(data[active].value)}</span>
        </Tooltip>
      ) : null}
    </div>
  );
}

/* --------------------------------- Donut --------------------------------- */
export function DonutChart({
  data = [],
  size = 190,
  thickness = 24,
  centerLabel,
  centerValue,
  ariaLabel = 'نمودار دایره‌ای',
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`${ariaLabel}: ${data.map((d) => `${d.label} ${Math.round((d.value / total) * 100)} درصد`).join('، ')}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--slate-100)" strokeWidth={thickness} />
          {data.map((d) => {
            const len = (d.value / total) * circ;
            const el = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        </g>
      </svg>
      <div className="donut__center">
        {centerValue ? <span className="donut__value num">{centerValue}</span> : null}
        {centerLabel ? <span className="donut__label">{centerLabel}</span> : null}
      </div>
    </div>
  );
}

/* -------------------------------- Sparkline ------------------------------- */
export function Sparkline({ data = [], width = 130, height = 40, color = '#1C7ED6' }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * (width - 4) + 2,
    y: height - 4 - ((v - min) / span) * (height - 8),
  }));
  return (
    <svg width={width} height={height} aria-hidden="true" className="sparkline">
      <path d={smoothPath(pts)} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Horizontal ranked bar list — used for “top customers / products”. */
export function RankBars({ items = [], format = (v) => formatMoneyShort(v), tone = 'brand' }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="rank">
      {items.map((item) => (
        <li key={item.label} className="rank__item">
          <div className="rank__top">
            <span className="rank__label">{item.label}</span>
            <span className="rank__value num">{format(item.value)}</span>
          </div>
          <span className="rank__track">
            <span
              className={`rank__fill rank__fill--${tone}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
