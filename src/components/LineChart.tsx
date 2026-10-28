// Simple line chart (SVG) of body weight over time. Values are already in the user's unit.
export interface Point {
  date: string; // YYYY-MM-DD
  value: number;
}

export default function LineChart({ points, unit }: { points: Point[]; unit: string }) {
  const W = 320;
  const H = 180;
  const padL = 40;
  const padR = 12;
  const padT = 14;
  const padB = 28;

  const values = points.map((p) => p.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (max - min < 1) {
    min -= 1;
    max += 1;
  }
  const x = (i: number) => padL + (points.length === 1 ? (W - padL - padR) / 2 : (i / (points.length - 1)) * (W - padL - padR));
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const fmt = (d: string) => d.slice(5).replace("-", "/"); // "09/30"

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Line chart of body weight in ${unit}. ${points.map((p) => `${p.date}: ${p.value}`).join(". ")}.`}
        className="w-full"
      >
        {[min, max].map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="#e5e7eb" />
            <text x={padL - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#4b5563">
              {Math.round(v * 10) / 10}
            </text>
          </g>
        ))}
        {points.length > 1 && <polyline points={line} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinejoin="round" />}
        {points.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.value)} r="4.5" fill="#0f766e" />
        ))}
        <text x={x(0)} y={H - 8} textAnchor="middle" fontSize="10" fill="#4b5563">
          {fmt(points[0].date)}
        </text>
        {points.length > 1 && (
          <text x={x(points.length - 1)} y={H - 8} textAnchor="middle" fontSize="10" fill="#4b5563">
            {fmt(points[points.length - 1].date)}
          </text>
        )}
      </svg>
      <figcaption className="text-base text-muted">Your body weight in {unit} (optional).</figcaption>
    </figure>
  );
}
