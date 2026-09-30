import { GROUP_LABEL } from "@/lib/labels";
import type { Colouring, Graph } from "@/lib/math/graphColouring";

// Fill colours are only a helper: every vertex also shows its colour NUMBER.
const FILL = ["#99f6e4", "#fde68a", "#ddd6fe", "#fecdd3", "#bfdbfe", "#d9f99d"];

// Muscle-group graph on a circle. Lines are conflicts. Same colour = may share a day.
export default function ColourGraph({ graph, colouring }: { graph: Graph; colouring: Colouring }) {
  const W = 320;
  const H = 300;
  const cx = W / 2;
  const cy = H / 2;
  const R = 105;
  const pos = new Map(
    graph.vertices.map((v, i) => {
      const a = (2 * Math.PI * i) / graph.vertices.length - Math.PI / 2;
      return [v, { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }] as const;
    }),
  );
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto w-full max-w-sm"
      role="img"
      aria-label={`Graph of muscle groups. Conflicts: ${graph.edges.map(([a, b]) => `${a} and ${b}`).join(", ") || "none"}. Colours: ${graph.vertices.map((v) => `${v} is colour ${colouring[v] + 1}`).join(", ")}.`}
    >
      {graph.edges.map(([a, b]) => (
        <line key={a + b} x1={pos.get(a)!.x} y1={pos.get(a)!.y} x2={pos.get(b)!.x} y2={pos.get(b)!.y} stroke="#4b5563" strokeWidth="2" />
      ))}
      {graph.vertices.map((v) => {
        const p = pos.get(v)!;
        return (
          <g key={v}>
            <circle cx={p.x} cy={p.y} r="30" fill={FILL[colouring[v] % FILL.length]} stroke="#1f2937" strokeWidth="2" />
            <text x={p.x} y={p.y - 2} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#1f2937">
              {(GROUP_LABEL[v] ?? v).replace(" (glutes)", "").replace("Tummy and core", "Core")}
            </text>
            <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize="10" fill="#1f2937">
              colour {colouring[v] + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
