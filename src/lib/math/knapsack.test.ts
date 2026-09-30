import { describe, expect, it } from "vitest";
import { knapsack, type KnapsackItem } from "./knapsack";

/** Slow but obviously-correct check: try every subset. */
function bruteForce(items: KnapsackItem[], capacity: number): number {
  let best = 0;
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let w = 0;
    let v = 0;
    items.forEach((it, i) => {
      if (mask & (1 << i)) {
        w += it.weight;
        v += it.value;
      }
    });
    if (w <= capacity) best = Math.max(best, v);
  }
  return best;
}

describe("0/1 knapsack", () => {
  const items: KnapsackItem[] = [
    { id: "a", weight: 1, value: 1 },
    { id: "b", weight: 3, value: 4 },
    { id: "c", weight: 4, value: 5 },
    { id: "d", weight: 5, value: 7 },
  ];
  it("classic example: capacity 7 → best value 9 (b + c)", () => {
    const r = knapsack(items, 7);
    expect(r.bestValue).toBe(9);
    expect(r.chosenIds.sort()).toEqual(["b", "c"]);
    expect(r.totalWeight).toBe(7);
  });
  it("never exceeds capacity and value matches chosen items", () => {
    const r = knapsack(items, 8);
    const chosen = items.filter((i) => r.chosenIds.includes(i.id));
    expect(r.totalWeight).toBeLessThanOrEqual(8);
    expect(chosen.reduce((s, i) => s + i.value, 0)).toBe(r.bestValue);
  });
  it("greedy-by-ratio would be wrong here, DP is right", () => {
    // Ratios: a=1.0 b=1.0 ... item "big" has the best absolute value only if chosen alone.
    const tricky: KnapsackItem[] = [
      { id: "x", weight: 1, value: 2 },
      { id: "y", weight: 1, value: 2 },
      { id: "z", weight: 3, value: 5 },
    ];
    // Ratio order is x, y (2.0) then z (1.67): greedy takes x+y = 4. Best for capacity 3 is z = 5.
    expect(knapsack(tricky, 3).bestValue).toBe(5);
  });
  it("capacity 0, no items, and too-heavy items", () => {
    expect(knapsack(items, 0).bestValue).toBe(0);
    expect(knapsack([], 10).bestValue).toBe(0);
    expect(knapsack([{ id: "h", weight: 20, value: 9 }], 10).chosenIds).toEqual([]);
  });
  it("table has the right shape and last cell is the answer", () => {
    const r = knapsack(items, 7);
    expect(r.table).toHaveLength(items.length + 1);
    expect(r.table[0]).toHaveLength(8);
    expect(r.table[items.length][7]).toBe(r.bestValue);
  });
  it("matches brute force on many random cases", () => {
    let seed = 12345; // small deterministic random generator
    const rand = (n: number) => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed % n;
    };
    for (let trial = 0; trial < 200; trial++) {
      const its: KnapsackItem[] = Array.from({ length: 1 + rand(9) }, (_, i) => ({
        id: `i${i}`,
        weight: 1 + rand(9),
        value: 1 + rand(10),
      }));
      const cap = rand(30);
      expect(knapsack(its, cap).bestValue).toBe(bruteForce(its, cap));
    }
  });
  it("rejects bad input", () => {
    expect(() => knapsack(items, -1)).toThrow();
    expect(() => knapsack([{ id: "f", weight: 1.5, value: 1 }], 5)).toThrow();
  });
});
