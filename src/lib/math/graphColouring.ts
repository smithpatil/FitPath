// 4. GRAPH COLOURING
//
// A graph is a set of vertices joined by edges.
//   vertices = muscle groups
//   edge     = "these two groups should not be trained on the same or consecutive days"
// A PROPER COLOURING gives every vertex a colour so that joined vertices never share one.
// Here a colour means a "day type": groups with the same colour can safely share a day.
// The CHROMATIC NUMBER χ(G) is the fewest colours needed, i.e. the fewest days that can
// keep every conflicting pair on different days.

import type { Edge, MuscleGroup } from "./types";

export interface Graph {
  vertices: string[];
  edges: Edge[];
}

export const MUSCLE_GROUPS: MuscleGroup[] = ["legs", "glutes", "chest", "back", "shoulders", "arms", "core"];

/** Groups that share muscles or joints, so they should get rest between sessions. */
export const MUSCLE_CONFLICTS: Edge[] = [
  ["legs", "glutes"], // both use the big leg and hip muscles
  ["chest", "shoulders"], // shoulders help every pressing move
  ["chest", "arms"], // triceps help with pressing
  ["shoulders", "arms"],
  ["back", "arms"], // biceps help with pulling
];

export const muscleGraph: Graph = { vertices: MUSCLE_GROUPS, edges: MUSCLE_CONFLICTS };

export const neighbours = (g: Graph, v: string): string[] =>
  g.edges.flatMap(([a, b]) => (a === v ? [b] : b === v ? [a] : []));

export const degree = (g: Graph, v: string): number => neighbours(g, v).length;

/** colouring[v] = colour number (0, 1, 2, ...). */
export type Colouring = Record<string, number>;

export function isProperColouring(g: Graph, c: Colouring): boolean {
  return g.vertices.every((v) => c[v] !== undefined) && g.edges.every(([a, b]) => c[a] !== c[b]);
}

/**
 * Welsh-Powell greedy colouring: take vertices from most to fewest neighbours and give each
 * the smallest colour not used by an already-coloured neighbour. Fast, and always proper,
 * but not always the minimum.
 */
export function greedyColouring(g: Graph): Colouring {
  const order = [...g.vertices].sort((a, b) => degree(g, b) - degree(g, a));
  const colour: Colouring = {};
  for (const v of order) {
    const used = new Set(neighbours(g, v).map((n) => colour[n]));
    let c = 0;
    while (used.has(c)) c++;
    colour[v] = c;
  }
  return colour;
}

/** Try to colour with at most k colours by backtracking (trying choices and undoing them). */
function colourWith(g: Graph, k: number): Colouring | null {
  const order = [...g.vertices].sort((a, b) => degree(g, b) - degree(g, a));
  const colour: Colouring = {};
  const place = (i: number): boolean => {
    if (i === order.length) return true;
    const v = order[i];
    for (let c = 0; c < k; c++) {
      if (neighbours(g, v).every((n) => colour[n] !== c)) {
        colour[v] = c;
        if (place(i + 1)) return true;
        delete colour[v];
      }
    }
    return false;
  };
  return place(0) ? colour : null;
}

/** Exact chromatic number and an optimal colouring. */
export function optimalColouring(g: Graph): { chromaticNumber: number; colouring: Colouring } {
  for (let k = 1; k <= g.vertices.length; k++) {
    const colouring = colourWith(g, k);
    if (colouring) return { chromaticNumber: k, colouring };
  }
  return { chromaticNumber: 0, colouring: {} }; // empty graph
}

export interface DaySchedule {
  /** dayOf[group] = 0-based training-day slot. */
  dayOf: Record<string, number>;
  /** groups[d] = the muscle groups trained in slot d. */
  groups: string[][];
  /** Conflicting pairs forced onto the SAME day (0 when days ≥ χ). */
  sameDayClashes: number;
  /** Conflicting pairs on back-to-back training days. */
  consecutiveClashes: number;
}

/**
 * Assign every muscle group to one of `days` training slots.
 * Best schedule = fewest same-day conflicts first, then fewest consecutive-day conflicts,
 * then the most even spread. Slots are treated as back-to-back days (the cautious choice).
 * Brute force over every assignment (days^groups ≤ 6^7 ≈ 280k) keeps the result provably optimal.
 * If days < χ(G), same-day clashes are unavoidable: the pigeonhole principle.
 */
export function scheduleGroups(g: Graph, days: number): DaySchedule {
  const n = g.vertices.length;
  const idx = new Map(g.vertices.map((v, i) => [v, i]));
  const edges = g.edges.map(([a, b]) => [idx.get(a)!, idx.get(b)!] as const);
  const mustFill = days <= n; // every training day needs at least one muscle group
  const assign = new Array<number>(n).fill(0);
  let best: { cost: number; assign: number[] } | null = null;

  const cost = (): number => {
    let same = 0;
    let consecutive = 0;
    for (const [a, b] of edges) {
      const gap = Math.abs(assign[a] - assign[b]);
      if (gap === 0) same++;
      else if (gap === 1) consecutive++;
    }
    const sizes = new Array<number>(days).fill(0);
    for (const d of assign) sizes[d]++;
    if (mustFill && sizes.some((s) => s === 0)) return Infinity;
    const spread = sizes.reduce((s, x) => s + x * x, 0); // lower = more even (max 49 < 100)
    return same * 10000 + consecutive * 100 + spread;
  };

  const search = (i: number) => {
    if (i === n) {
      const c = cost();
      if (best === null || c < best.cost) best = { cost: c, assign: [...assign] };
      return;
    }
    for (let d = 0; d < days; d++) {
      assign[i] = d;
      search(i + 1);
    }
  };
  search(0);

  const chosen = best!.assign;
  const dayOf: Record<string, number> = {};
  const groups: string[][] = Array.from({ length: days }, () => []);
  g.vertices.forEach((v, i) => {
    dayOf[v] = chosen[i];
    groups[chosen[i]].push(v);
  });
  let sameDayClashes = 0;
  let consecutiveClashes = 0;
  for (const [a, b] of g.edges) {
    const gap = Math.abs(dayOf[a] - dayOf[b]);
    if (gap === 0) sameDayClashes++;
    else if (gap === 1) consecutiveClashes++;
  }
  return { dayOf, groups, sameDayClashes, consecutiveClashes };
}
