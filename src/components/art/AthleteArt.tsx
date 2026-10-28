// Hero illustration: a pictogram athlete pressing dumbbells overhead, drawn with plain shapes.
// "dark" is for deep-teal panels (white figure); "light" is for white backgrounds (deep-teal figure).
export default function AthleteArt({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const body = tone === "dark" ? "#ffffff" : "#042f2e";
  const glow = tone === "dark" ? "#14b8a6" : "#99f6e4";
  return (
    <svg viewBox="0 0 480 440" role="img" aria-label="Illustration of an athlete lifting dumbbells overhead" className={className}>
      <defs>
        <radialGradient id="athlete-glow" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft glow, rings and sparks behind the figure */}
      <circle cx="240" cy="215" r="200" fill="url(#athlete-glow)" />
      <circle cx="240" cy="215" r="150" fill="none" stroke={glow} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="4 10" />
      <circle cx="240" cy="215" r="188" fill="none" stroke={glow} strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="82" cy="120" r="7" fill="#f59e0b" />
      <circle cx="402" cy="300" r="5" fill="#f59e0b" />
      <circle cx="420" cy="110" r="4" fill={glow} />
      <circle cx="60" cy="300" r="4" fill={glow} />

      {/* floor shadow */}
      <ellipse cx="240" cy="396" rx="108" ry="12" fill="#000" opacity="0.18" />

      {/* legs */}
      <g stroke={body} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="222,262 200,330 196,382" />
        <polyline points="258,262 280,330 284,382" />
      </g>
      {/* shoes */}
      <g fill="#f59e0b">
        <rect x="170" y="376" width="50" height="16" rx="8" />
        <rect x="260" y="376" width="50" height="16" rx="8" />
      </g>

      {/* torso */}
      <line x1="240" y1="172" x2="240" y2="260" stroke={body} strokeWidth="46" strokeLinecap="round" />

      {/* arms pressing up */}
      <g stroke={body} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="214,180 178,150 168,88" />
        <polyline points="266,180 302,150 312,88" />
      </g>

      {/* head */}
      <circle cx="240" cy="132" r="25" fill={body} />

      {/* dumbbells (amber plates) */}
      <g>
        <line x1="128" y1="82" x2="214" y2="82" stroke={body} strokeWidth="8" strokeLinecap="round" />
        <rect x="114" y="58" width="16" height="48" rx="5" fill="#f59e0b" />
        <rect x="128" y="64" width="12" height="36" rx="4" fill="#fbbf24" />
        <rect x="198" y="64" width="12" height="36" rx="4" fill="#fbbf24" />
        <rect x="208" y="58" width="16" height="48" rx="5" fill="#f59e0b" />

        <line x1="266" y1="82" x2="352" y2="82" stroke={body} strokeWidth="8" strokeLinecap="round" />
        <rect x="256" y="58" width="16" height="48" rx="5" fill="#f59e0b" />
        <rect x="270" y="64" width="12" height="36" rx="4" fill="#fbbf24" />
        <rect x="340" y="64" width="12" height="36" rx="4" fill="#fbbf24" />
        <rect x="350" y="58" width="16" height="48" rx="5" fill="#f59e0b" />
      </g>
    </svg>
  );
}
