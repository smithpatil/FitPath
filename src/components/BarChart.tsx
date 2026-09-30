import type { WeekCount } from "@/lib/progress";

// Simple bar chart drawn with SVG: workout days per week.
export default function BarChart({ data }: { data: WeekCount[] }) {
  const W = 320;
  const H = 190;
  const left = 28;
  const bottom = 34;
  const top = 18;
  const max = Math.max(3, ...data.map((d) => d.count));
  const plotH = H - bottom - top;
  const step = (W - left) / data.length;
  const barW = Math.min(28, step * 0.6);
  const ticks = Array.from({ length: max + 1 }, (_, i) => i);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Bar chart of workout days per week. ${data.map((d) => `Week of ${d.label}: ${d.count}`).join(". ")}.`}
        className="w-full"
      >
        {ticks.map((t) => {
          const y = top + plotH - (t / max) * plotH;
          return (
            <g key={t}>
              <line x1={left} x2={W} y1={y} y2={y} stroke="#e5e7eb" />
              <text x={left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#4b5563">
                {t}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.count / max) * plotH;
          const x = left + i * step + (step - barW) / 2;
          return (
            <g key={d.weekStart}>
              <rect x={x} y={top + plotH - h} width={barW} height={h} rx="4" fill="#0f766e" />
              {d.count > 0 && (
                <text x={x + barW / 2} y={top + plotH - h - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#115e59">
                  {d.count}
                </text>
              )}
              <text x={x + barW / 2} y={H - 16} textAnchor="middle" fontSize="10" fill="#4b5563">
                {d.label.split(" ")[0]}
              </text>
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#4b5563">
                {d.label.split(" ")[1]}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="text-base text-muted">Workout days completed each week (week starting on the date shown).</figcaption>
    </figure>
  );
}
