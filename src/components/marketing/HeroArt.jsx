import { LogoMark } from '../brand/Logo.jsx';

/**
 * HeroArt — brand illustration recreated from the 2HS reference composition:
 * a long receipt roll in the foreground, an accountant figure in a navy suit
 * balancing on a blue board, and a fluid splash with gold droplets.
 * Pure SVG so it stays crisp, light and themeable.
 */
export default function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 580 480"
      role="img"
      aria-label="تصویرسازی: حسابدار حرفه‌ای در حال سازمان‌دهی فاکتورها روی یک رول رسید"
    >
      <defs>
        <linearGradient id="ha-paper" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="78%" stopColor="#f4f8fe" />
          <stop offset="100%" stopColor="#e3ecf9" />
        </linearGradient>
        <linearGradient id="ha-splash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#66d9e8" />
          <stop offset="45%" stopColor="#339af0" />
          <stop offset="100%" stopColor="#1565af" />
        </linearGradient>
        <linearGradient id="ha-suit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#39429f" />
          <stop offset="100%" stopColor="#232a70" />
        </linearGradient>
        <linearGradient id="ha-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="100%" stopColor="#f8a200" />
        </linearGradient>
        <linearGradient id="ha-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffdc55" />
          <stop offset="100%" stopColor="#f7c322" />
        </linearGradient>
        <radialGradient id="ha-flare" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="ha-shadow" x="-30%" y="-20%" width="170%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#0b2a4a" floodOpacity="0.28" />
        </filter>
        <filter id="ha-soft" x="-30%" y="-20%" width="170%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0b2a4a" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* light flares */}
      <circle cx="470" cy="70" r="150" fill="url(#ha-flare)" />
      <circle cx="120" cy="330" r="130" fill="url(#ha-flare)" opacity="0.6" />

      {/* ---------------- receipt roll ---------------- */}
      <g transform="rotate(7 430 210)" filter="url(#ha-shadow)">
        <rect x="352" y="8" width="168" height="372" rx="12" fill="url(#ha-paper)" />
        <rect x="352" y="8" width="168" height="372" rx="12" fill="none" stroke="#dbe6f5" strokeWidth="1.5" />
        {/* header */}
        <rect x="374" y="30" width="60" height="9" rx="4.5" fill="#4263eb" opacity="0.85" />
        <rect x="374" y="46" width="34" height="6" rx="3" fill="#b9c3d2" />
        <rect x="470" y="30" width="30" height="6" rx="3" fill="#b9c3d2" />
        <line x1="374" y1="66" x2="498" y2="66" stroke="#e1e8f2" strokeWidth="1.5" />
        {/* line items */}
        {[84, 112, 140, 168, 196].map((y) => (
          <g key={y}>
            <rect x="374" y={y} width="72" height="7" rx="3.5" fill="#c7d3e4" />
            <rect x="460" y={y} width="38" height="7" rx="3.5" fill="#93a3bc" />
            <rect x="374" y={y + 14} width="48" height="5" rx="2.5" fill="#e3e9f3" />
          </g>
        ))}
        <line x1="374" y1="236" x2="498" y2="236" stroke="#e1e8f2" strokeWidth="1.5" />
        {/* totals */}
        <rect x="374" y="252" width="52" height="7" rx="3.5" fill="#c7d3e4" />
        <rect x="464" y="252" width="34" height="7" rx="3.5" fill="#93a3bc" />
        <rect x="374" y="276" width="44" height="7" rx="3.5" fill="#c7d3e4" />
        <rect x="468" y="276" width="30" height="7" rx="3.5" fill="#93a3bc" />
        <rect x="374" y="300" width="128" height="26" rx="7" fill="#fff3bf" />
        <rect x="384" y="309" width="52" height="8" rx="4" fill="#e08c00" />
        <rect x="456" y="309" width="36" height="8" rx="4" fill="#b87300" />
        {/* barcode */}
        <g opacity="0.5">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <rect
              key={i}
              x={382 + i * 11}
              y={344}
              width={i % 3 === 0 ? 4 : 2}
              height={18}
              fill="#8794a8"
            />
          ))}
        </g>
      </g>

      {/* ---------------- splash ---------------- */}
      <path
        d="M28 400c58-26 108 4 168-8 62-12 96-44 158-30 52 12 84 44 138 34 30-6 46-18 62-30v96H28Z"
        fill="url(#ha-splash)"
        opacity="0.95"
      />
      <path
        d="M28 424c54-18 102 10 162 0 60-10 96-34 156-22 48 10 80 34 132 26 32-5 48-14 64-24v60H28Z"
        fill="#0f4c86"
        opacity="0.45"
      />
      <ellipse cx="300" cy="404" rx="238" ry="20" fill="#ffffff" opacity="0.16" />

      {/* gold droplets */}
      {[
        [132, 372, 9],
        [166, 396, 6],
        [452, 366, 10],
        [486, 392, 6.5],
        [498, 338, 5],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="url(#ha-gold)" opacity="0.95" />
      ))}

      {/* ---------------- accountant figure ---------------- */}
      <g filter="url(#ha-soft)">
        <ellipse cx="212" cy="392" rx="66" ry="12" fill="#0b2a4a" opacity="0.28" />

        {/* board */}
        <g transform="rotate(-6 212 378)">
          <rect x="150" y="370" width="126" height="15" rx="7.5" fill="#339af0" />
          <rect x="150" y="370" width="126" height="15" rx="7.5" fill="none" stroke="#1c7ed6" strokeWidth="1.5" />
        </g>

        {/* legs */}
        <rect x="188" y="320" width="15" height="52" rx="7" fill="url(#ha-suit)" />
        <rect x="210" y="320" width="15" height="52" rx="7" fill="url(#ha-suit)" />
        <rect x="182" y="364" width="26" height="12" rx="6" fill="#182034" />
        <rect x="206" y="364" width="26" height="12" rx="6" fill="#182034" />

        {/* torso */}
        <path
          d="M186 252c0-14 12-24 27-24s27 10 27 24v58c0 8-6 14-14 14h-26c-8 0-14-6-14-14z"
          fill="url(#ha-suit)"
        />
        {/* shirt V */}
        <path d="M204 230l9 12 9-12-9-6z" fill="#ffffff" />
        {/* tie */}
        <path d="M209 236h8l-2 6 3 26-5 8-5-8 3-26z" fill="url(#ha-gold)" />

        {/* arms */}
        <path
          d="M190 262c-14-6-26-22-32-38"
          stroke="url(#ha-suit)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M236 264c14-4 26-16 32-30"
          stroke="url(#ha-suit)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="156" cy="220" r="9" fill="url(#ha-skin)" />
        <circle cx="270" cy="230" r="9" fill="url(#ha-skin)" />

        {/* neck + head */}
        <rect x="204" y="216" width="18" height="16" rx="6" fill="url(#ha-skin)" />
        <circle cx="213" cy="196" r="27" fill="url(#ha-skin)" />
        <circle cx="213" cy="196" r="27" fill="none" stroke="#e0ad12" strokeWidth="1.2" opacity="0.5" />

        {/* glasses */}
        <g stroke="#182034" strokeWidth="3.4" fill="rgba(255,255,255,0.45)">
          <circle cx="202" cy="196" r="9.5" />
          <circle cx="226" cy="196" r="9.5" />
        </g>
        <line x1="211.5" y1="196" x2="216.5" y2="196" stroke="#182034" strokeWidth="3" />
        <line x1="192" y1="193" x2="186" y2="190" stroke="#182034" strokeWidth="3" strokeLinecap="round" />
        <line x1="236" y1="193" x2="242" y2="190" stroke="#182034" strokeWidth="3" strokeLinecap="round" />
        {/* smile */}
        <path d="M206 212q7 6 14 0" stroke="#b87300" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </g>

      {/* ---------------- floating balance chip ---------------- */}
      <g transform="rotate(-5 92 300)" filter="url(#ha-soft)">
        <rect x="24" y="266" width="150" height="62" rx="14" fill="#ffffff" />
        <rect x="38" y="282" width="42" height="8" rx="4" fill="#4263eb" opacity="0.7" />
        <rect x="38" y="300" width="86" height="14" rx="6" fill="#22314a" />
        <circle cx="152" cy="288" r="12" fill="#e6f8f1" />
        <path d="M146 288l5 5 8-9" stroke="#0ca678" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* ---------------- brand chip ---------------- */}
      <g filter="url(#ha-soft)">
        <rect x="380" y="286" width="58" height="58" rx="16" fill="#ffffff" />
        <g transform="translate(388 294)">
          <foreignObject width="42" height="42" />
        </g>
      </g>
      <g transform="translate(389 295) scale(0.86)">
        <LogoMark size={40} />
      </g>

      {/* sparkles */}
      {[
        [330, 96],
        [520, 208],
        [96, 176],
      ].map(([cx, cy]) => (
        <path
          key={`${cx}-${cy}`}
          d={`M${cx} ${cy - 9}l2.4 6.6L${cx + 9} ${cy}l-6.6 2.4L${cx} ${cy + 9}l-2.4-6.6L${cx - 9} ${cy}l6.6-2.4z`}
          fill="#ffffff"
          opacity="0.85"
        />
      ))}
    </svg>
  );
}
