import type { Format } from "@/lib/formats";

// Three simple illustrated scenes for the workout-style cards, drawn with plain shapes.
// White pictogram figures with amber accents; the card supplies the coloured background.
export default function FormatArt({ format, className = "" }: { format: Format; className?: string }) {
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true" className={className} preserveAspectRatio="xMidYMax meet">
      {/* shared soft rings and sparks */}
      <circle cx="200" cy="165" r="118" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="4 10" />
      <circle cx="200" cy="165" r="150" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="64" cy="70" r="6" fill="#f59e0b" />
      <circle cx="338" cy="96" r="4" fill="#fff" fillOpacity="0.7" />
      <circle cx="354" cy="210" r="5" fill="#f59e0b" />

      {format === "gym" && (
        <g>
          <ellipse cx="200" cy="268" rx="104" ry="10" fill="#000" opacity="0.2" />
          {/* legs in a squat */}
          <g stroke="#fff" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polyline points="190,168 156,208 160,254" />
            <polyline points="210,168 244,208 240,254" />
          </g>
          <g fill="#f59e0b">
            <rect x="132" y="250" width="50" height="14" rx="7" />
            <rect x="218" y="250" width="50" height="14" rx="7" />
          </g>
          {/* torso, head, arms to the bar */}
          <line x1="200" y1="104" x2="200" y2="170" stroke="#fff" strokeWidth="36" strokeLinecap="round" />
          <circle cx="200" cy="66" r="21" fill="#fff" />
          <g stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polyline points="184,112 150,98" />
            <polyline points="216,112 250,98" />
          </g>
          {/* barbell with plates */}
          <line x1="70" y1="96" x2="330" y2="96" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
          <rect x="52" y="58" width="18" height="76" rx="6" fill="#f59e0b" />
          <rect x="70" y="68" width="12" height="56" rx="4" fill="#fbbf24" />
          <rect x="318" y="68" width="12" height="56" rx="4" fill="#fbbf24" />
          <rect x="330" y="58" width="18" height="76" rx="6" fill="#f59e0b" />
        </g>
      )}

      {format === "strength" && (
        <g>
          <ellipse cx="200" cy="262" rx="150" ry="9" fill="#000" opacity="0.2" />
          {/* push-up: a straight line from head to heels */}
          <line x1="104" y1="188" x2="286" y2="226" stroke="#fff" strokeWidth="28" strokeLinecap="round" />
          <circle cx="82" cy="172" r="19" fill="#fff" />
          <line x1="122" y1="196" x2="122" y2="254" stroke="#fff" strokeWidth="16" strokeLinecap="round" />
          <line x1="286" y1="226" x2="322" y2="254" stroke="#fff" strokeWidth="18" strokeLinecap="round" />
          <rect x="306" y="248" width="34" height="12" rx="6" fill="#f59e0b" />
          {/* kettlebell */}
          <circle cx="356" cy="226" r="26" fill="#f59e0b" />
          <path d="M342 208 Q356 176 370 208" fill="none" stroke="#f59e0b" strokeWidth="9" strokeLinecap="round" />
          <circle cx="348" cy="220" r="5" fill="#fbbf24" />
          {/* small dumbbell on the left */}
          <g>
            <line x1="40" y1="236" x2="68" y2="236" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
            <rect x="30" y="224" width="10" height="24" rx="3" fill="#f59e0b" />
            <rect x="68" y="224" width="10" height="24" rx="3" fill="#f59e0b" />
          </g>
        </g>
      )}

      {format === "yoga" && (
        <g>
          <circle cx="200" cy="150" r="64" fill="#fff" fillOpacity="0.12" />
          {/* mat */}
          <rect x="120" y="262" width="160" height="10" rx="5" fill="#f59e0b" />
          {/* standing leg and bent leg (tree pose) */}
          <g stroke="#fff" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <line x1="200" y1="176" x2="200" y2="258" />
            <polyline points="204,172 246,200 206,214" />
          </g>
          {/* torso, head, hands together overhead */}
          <line x1="200" y1="100" x2="200" y2="176" stroke="#fff" strokeWidth="30" strokeLinecap="round" />
          <circle cx="200" cy="70" r="19" fill="#fff" />
          <g stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polyline points="188,112 174,66 200,24" />
            <polyline points="212,112 226,66 200,24" />
          </g>
          {/* lotus-like petals */}
          <g fill="#f59e0b" opacity="0.9">
            <ellipse cx="318" cy="238" rx="8" ry="16" transform="rotate(-30 318 238)" />
            <ellipse cx="334" cy="238" rx="8" ry="16" />
            <ellipse cx="350" cy="238" rx="8" ry="16" transform="rotate(30 350 238)" />
          </g>
        </g>
      )}
    </svg>
  );
}
