import { describe, expect, it } from "vitest";
import { EXERCISES } from "../../data/exercises";
import {
  buildOrder,
  checkEquivalence,
  checkPartialOrder,
  comparable,
  equivalenceClasses,
  equivalent,
  hasseEdges,
  progressionEdges,
  swapOptions,
} from "./relations";
import type { Edge } from "./types";

describe("partial order on a small example", () => {
  const els = ["a", "b", "c", "d"];
  // a < b < c is a chain; a < c is a redundant edge; d stands alone.
  const edges: Edge[] = [["a", "b"], ["b", "c"], ["a", "c"]];
  const leq = buildOrder(els, edges);

  it("is reflexive, antisymmetric and transitive", () => {
    expect(checkPartialOrder(els, leq).isPartialOrder).toBe(true);
  });
  it("closes transitively", () => {
    expect(leq("a", "c")).toBe(true);
    expect(leq("c", "a")).toBe(false);
  });
  it("is only PARTIAL: d is not comparable with a", () => {
    expect(comparable(leq, "a", "d")).toBe(false);
  });
  it("Hasse diagram drops the redundant a→c edge", () => {
    expect(hasseEdges(els, leq)).toEqual([["a", "b"], ["b", "c"]]);
  });
  it("a cycle breaks antisymmetry", () => {
    const bad = buildOrder(["x", "y"], [["x", "y"], ["y", "x"]]);
    expect(checkPartialOrder(["x", "y"], bad).antisymmetric).toBe(false);
  });
});

describe("exercise progression order", () => {
  const ids = EXERCISES.map((e) => e.id);
  const leq = buildOrder(ids, progressionEdges(EXERCISES));
  it("is a genuine partial order", () => {
    expect(checkPartialOrder(ids, leq).isPartialOrder).toBe(true);
  });
  it("chain: wall push-up ≤ knee push-up ≤ push-up", () => {
    expect(leq("wall-push-up", "push-up")).toBe(true);
    expect(leq("push-up", "wall-push-up")).toBe(false);
  });
  it("diamond: dumbbell lunge is harder than both reverse lunge and goblet squat", () => {
    expect(leq("reverse-lunge", "dumbbell-lunge")).toBe(true);
    expect(leq("goblet-squat", "dumbbell-lunge")).toBe(true);
    expect(comparable(leq, "reverse-lunge", "goblet-squat")).toBe(false);
  });
  it("Hasse edges of the data are already the covering pairs", () => {
    const hasse = hasseEdges(ids, leq).map((e) => e.join(">")).sort();
    const direct = progressionEdges(EXERCISES).map((e) => e.join(">")).sort();
    expect(hasse).toEqual(direct);
  });
});

describe("equivalence relation for swapping", () => {
  it("same muscle group + same equipment is an equivalence relation", () => {
    expect(checkEquivalence(EXERCISES, equivalent).isEquivalence).toBe(true);
  });
  it("classes partition the exercises: disjoint and covering everything", () => {
    const classes = equivalenceClasses(EXERCISES);
    const all = classes.flat().map((e) => e.id);
    expect(all).toHaveLength(EXERCISES.length);
    expect(new Set(all).size).toBe(EXERCISES.length);
  });
  it("swap options share muscle group and equipment, and exclude the exercise itself", () => {
    const squat = EXERCISES.find((e) => e.id === "bodyweight-squat")!;
    const options = swapOptions(squat, EXERCISES);
    expect(options.length).toBeGreaterThan(0);
    expect(options.every((o) => o.muscleGroup === "legs" && o.equipment[0] === "bodyweight")).toBe(true);
    expect(options.find((o) => o.id === squat.id)).toBeUndefined();
  });
  it("swap options respect the usable list", () => {
    const squat = EXERCISES.find((e) => e.id === "bodyweight-squat")!;
    const usable = EXERCISES.filter((e) => e.id !== "chair-squat");
    expect(swapOptions(squat, usable).find((o) => o.id === "chair-squat")).toBeUndefined();
  });
});
