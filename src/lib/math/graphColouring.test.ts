import { describe, expect, it } from "vitest";
import {
  greedyColouring,
  isProperColouring,
  muscleGraph,
  optimalColouring,
  scheduleGroups,
  type Graph,
} from "./graphColouring";

const triangle: Graph = { vertices: ["a", "b", "c"], edges: [["a", "b"], ["b", "c"], ["a", "c"]] };
const path: Graph = { vertices: ["a", "b", "c"], edges: [["a", "b"], ["b", "c"]] };

describe("graph colouring", () => {
  it("a triangle needs 3 colours", () => {
    expect(optimalColouring(triangle).chromaticNumber).toBe(3);
  });
  it("a path needs only 2 colours", () => {
    expect(optimalColouring(path).chromaticNumber).toBe(2);
  });
  it("greedy colouring is always proper", () => {
    expect(isProperColouring(triangle, greedyColouring(triangle))).toBe(true);
    expect(isProperColouring(muscleGraph, greedyColouring(muscleGraph))).toBe(true);
  });
  it("detects an improper colouring", () => {
    expect(isProperColouring(path, { a: 0, b: 0, c: 1 })).toBe(false);
  });
  it("muscle-group graph has chromatic number 3 (chest, shoulders, arms form a triangle)", () => {
    const { chromaticNumber, colouring } = optimalColouring(muscleGraph);
    expect(chromaticNumber).toBe(3);
    expect(isProperColouring(muscleGraph, colouring)).toBe(true);
  });
});

describe("scheduling muscle groups onto days", () => {
  it("covers every group exactly once", () => {
    for (const days of [2, 3, 4, 5, 6]) {
      const s = scheduleGroups(muscleGraph, days);
      expect(s.groups.flat().sort()).toEqual([...muscleGraph.vertices].sort());
    }
  });
  it("with days ≥ χ = 3, conflicting groups never share a day", () => {
    for (const days of [3, 4, 5, 6]) {
      expect(scheduleGroups(muscleGraph, days).sameDayClashes).toBe(0);
    }
  });
  it("with 2 days (< χ) a same-day clash is unavoidable (pigeonhole)", () => {
    expect(scheduleGroups(muscleGraph, 2).sameDayClashes).toBeGreaterThan(0);
  });
  it("with 6 days no training day is empty", () => {
    expect(scheduleGroups(muscleGraph, 6).groups.every((g) => g.length > 0)).toBe(true);
  });
  it("the reported clash counts are correct", () => {
    const s = scheduleGroups(muscleGraph, 4);
    const same = muscleGraph.edges.filter(([a, b]) => s.dayOf[a] === s.dayOf[b]).length;
    const consec = muscleGraph.edges.filter(([a, b]) => Math.abs(s.dayOf[a] - s.dayOf[b]) === 1).length;
    expect(s.sameDayClashes).toBe(same);
    expect(s.consecutiveClashes).toBe(consec);
  });
  it("is deterministic", () => {
    expect(scheduleGroups(muscleGraph, 4)).toEqual(scheduleGroups(muscleGraph, 4));
  });
});
