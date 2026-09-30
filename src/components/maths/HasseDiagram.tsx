import type { Edge } from "@/lib/math/types";

interface Node {
  id: string;
  label: string;
  rank: number; // 0 = easiest
}

// Hasse diagram: easier exercises at the bottom, harder at the top.
// A line means "directly easier than" (chains like a < b < c only show a–b and b–c).
export default function HasseDiagram({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const NODE_W = 128;
  const NODE_H = 44;
  const GAP_Y = 84;
  const maxRank = Math.max(...nodes.map((n) => n.rank));
  const levels = Array.from({ length: maxRank + 1 }, (_, r) => nodes.filter((n) => n.rank === r));
  const widest = Math.max(...levels.map((l) => l.length));
  const W = Math.max(520, widest * (NODE_W + 20) + 20);
  const H = (maxRank + 1) * GAP_Y + 10;

  const pos = new Map<string, { x: number; y: number }>();
  levels.forEach((level, r) => {
    level.forEach((n, i) => {
      const x = ((i + 1) * W) / (level.length + 1);
      const y = H - 10 - NODE_H / 2 - r * GAP_Y;
      pos.set(n.id, { x, y });
    });
  });

  // Split a name over two lines at the space closest to the middle.
  const lines = (label: string): string[] => {
    if (label.length <= 15 || !label.includes(" ")) return [label];
    const mid = label.length / 2;
    const spaces = [...label].flatMap((c, i) => (c === " " ? [i] : []));
    const cut = spaces.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))[0];
    return [label.slice(0, cut), label.slice(cut + 1)];
  };

  const name = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ minWidth: Math.min(W, 520) }}
        className="w-full"
        role="img"
        aria-label={`Hasse diagram. ${edges.map(([a, b]) => `${name(a)} is directly easier than ${name(b)}`).join(". ")}.`}
      >
        {edges.map(([a, b]) => {
          const p = pos.get(a)!;
          const q = pos.get(b)!;
          return <line key={a + b} x1={p.x} y1={p.y - NODE_H / 2} x2={q.x} y2={q.y + NODE_H / 2} stroke="#0f766e" strokeWidth="2.5" />;
        })}
        {nodes.map((n) => {
          const p = pos.get(n.id)!;
          const ls = lines(n.label);
          return (
            <g key={n.id}>
              <rect x={p.x - NODE_W / 2} y={p.y - NODE_H / 2} width={NODE_W} height={NODE_H} rx="12" fill="#ffffff" stroke="#0f766e" strokeWidth="2" />
              {ls.map((l, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={p.y + (ls.length === 1 ? 5 : i === 0 ? -3 : 13)}
                  textAnchor="middle"
                  fontSize="12.5"
                  fill="#1f2937"
                >
                  {l}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      <p className="text-sm text-muted">Bottom = easiest. Going up = harder. Two exercises on the same level with no line between them cannot be compared.</p>
    </div>
  );
}
