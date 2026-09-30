// 3. RELATIONS, PARTIAL ORDERS AND EQUIVALENCE RELATIONS
//
// A relation on a set is a rule saying which pairs (a, b) are "related".
//
// PARTIAL ORDER (progression): a ≤ b means "a is easier than (or the same as) b".
//   It must be   reflexive     (a ≤ a)
//                antisymmetric (a ≤ b and b ≤ a  ⟹  a = b)
//                transitive    (a ≤ b and b ≤ c  ⟹  a ≤ c)
//   "Partial" because some pairs are not comparable (e.g. a squat and a push-up).
//   A HASSE DIAGRAM draws only the "covering" pairs: a < b with nothing strictly between.
//
// EQUIVALENCE RELATION (swapping): a ~ b means "same muscle group AND same equipment".
//   It must be reflexive, symmetric and transitive, and it splits the exercises into
//   separate groups (equivalence classes). Any exercise in a class can replace another.

import type { Edge, Exercise } from "./types";

/* ---------- Partial order ---------- */

/** Direct "easier → harder" links written in the exercise data. */
export function progressionEdges(exercises: Exercise[]): Edge[] {
  return exercises.flatMap((e) => e.easierIds.map((easier): Edge => [easier, e.id]));
}

export type LeqFn = (a: string, b: string) => boolean;

/** Build ≤ as the reflexive + transitive closure of the edges (Warshall's algorithm). */
export function buildOrder(elements: string[], edges: Edge[]): LeqFn {
  const idx = new Map(elements.map((e, i) => [e, i]));
  const n = elements.length;
  const reach = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j));
  for (const [a, b] of edges) {
    const i = idx.get(a);
    const j = idx.get(b);
    if (i !== undefined && j !== undefined) reach[i][j] = true;
  }
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      if (reach[i][k]) for (let j = 0; j < n; j++) if (reach[k][j]) reach[i][j] = true;
  return (a, b) => {
    const i = idx.get(a);
    const j = idx.get(b);
    return i !== undefined && j !== undefined && reach[i][j];
  };
}

/** Check the three partial-order properties. */
export function checkPartialOrder(elements: string[], leq: LeqFn) {
  const reflexive = elements.every((a) => leq(a, a));
  const antisymmetric = elements.every((a) =>
    elements.every((b) => a === b || !(leq(a, b) && leq(b, a))),
  );
  const transitive = elements.every((a) =>
    elements.every((b) => !leq(a, b) || elements.every((c) => !leq(b, c) || leq(a, c))),
  );
  return { reflexive, antisymmetric, transitive, isPartialOrder: reflexive && antisymmetric && transitive };
}

/** Hasse diagram edges: pairs a < b with no c such that a < c < b. */
export function hasseEdges(elements: string[], leq: LeqFn): Edge[] {
  const edges: Edge[] = [];
  for (const a of elements)
    for (const b of elements) {
      if (a === b || !leq(a, b)) continue;
      const hasMiddle = elements.some((c) => c !== a && c !== b && leq(a, c) && leq(c, b));
      if (!hasMiddle) edges.push([a, b]);
    }
  return edges;
}

/** Two elements are comparable if one is ≤ the other. */
export const comparable = (leq: LeqFn, a: string, b: string): boolean => leq(a, b) || leq(b, a);

/* ---------- Equivalence relation ---------- */

/** a ~ b  ⟺  same muscle group and same set of required equipment. */
export function equivalent(a: Exercise, b: Exercise): boolean {
  return a.muscleGroup === b.muscleGroup && equipmentKey(a) === equipmentKey(b);
}

const equipmentKey = (e: Exercise) => [...e.equipment].sort().join("+");

/** Check reflexive, symmetric and transitive for any relation over exercises. */
export function checkEquivalence(items: Exercise[], rel: (a: Exercise, b: Exercise) => boolean) {
  const reflexive = items.every((a) => rel(a, a));
  const symmetric = items.every((a) => items.every((b) => !rel(a, b) || rel(b, a)));
  const transitive = items.every((a) =>
    items.every((b) => !rel(a, b) || items.every((c) => !rel(b, c) || rel(a, c))),
  );
  return { reflexive, symmetric, transitive, isEquivalence: reflexive && symmetric && transitive };
}

/** Partition the exercises into equivalence classes (each exercise is in exactly one). */
export function equivalenceClasses(items: Exercise[]): Exercise[][] {
  const classes: Exercise[][] = [];
  for (const item of items) {
    const home = classes.find((c) => equivalent(c[0], item));
    if (home) home.push(item);
    else classes.push([item]);
  }
  return classes;
}

/** Exercises that can replace `ex`: same class, different exercise, and allowed for this user. */
export function swapOptions(ex: Exercise, usable: Exercise[]): Exercise[] {
  return usable.filter((o) => o.id !== ex.id && equivalent(o, ex));
}
