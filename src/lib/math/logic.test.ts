import { describe, expect, it } from "vitest";
import { EXERCISES } from "../../data/exercises";
import { SAFETY_RULES, excludedExerciseIds, firedRules, implies, isExcluded, truthTable, valuationFor } from "./logic";

const byId = (id: string) => EXERCISES.find((e) => e.id === id)!;

describe("implication", () => {
  it("matches the truth table of P → Q", () => {
    expect(implies(true, true)).toBe(true);
    expect(implies(true, false)).toBe(false); // the only false case
    expect(implies(false, true)).toBe(true);
    expect(implies(false, false)).toBe(true);
  });
});

describe("truth tables", () => {
  const r1 = SAFETY_RULES.find((r) => r.id === "R1")!; // (knee ∧ high_impact) → exclude
  const rows = truthTable(r1);
  it("has 2^(premises+1) rows", () => {
    expect(rows).toHaveLength(8);
  });
  it("is false in exactly one row: premises true and exclude false", () => {
    const falseRows = rows.filter((r) => !r.result);
    expect(falseRows).toHaveLength(1);
    expect(falseRows[0].values).toEqual({ knee: true, high_impact: true, exclude: false });
  });
});

describe("safety rules", () => {
  it("(knee ∧ high_impact) → exclude removes the jump squat", () => {
    const v = valuationFor({ level: "some_experience", limitations: ["knee"] }, byId("jump-squat"));
    expect(isExcluded(v)).toBe(true);
    expect(firedRules(v).map((r) => r.id)).toContain("R1");
  });
  it("does not exclude the same exercise for someone with no limitation", () => {
    const v = valuationFor({ level: "some_experience", limitations: [] }, byId("jump-squat"));
    expect(isExcluded(v)).toBe(false);
  });
  it("beginners do not get difficulty-3 exercises", () => {
    const ids = excludedExerciseIds(EXERCISES, { level: "beginner", limitations: [] });
    const hard = EXERCISES.filter((e) => e.difficulty === 3).map((e) => e.id);
    expect(hard.length).toBeGreaterThan(0);
    expect(hard.every((id) => ids.has(id))).toBe(true);
    expect(ids.size).toBe(hard.length);
  });
  it("a knee limitation keeps a gentle leg option (chair squat)", () => {
    const ids = excludedExerciseIds(EXERCISES, { level: "beginner", limitations: ["knee"] });
    expect(ids.has("chair-squat")).toBe(false);
    expect(ids.has("bodyweight-squat")).toBe(true);
  });
  it("wrist and shoulder limitations exclude the matching tags", () => {
    const ids = excludedExerciseIds(EXERCISES, { level: "some_experience", limitations: ["wrist", "shoulder"] });
    expect(ids.has("push-up")).toBe(true);
    expect(ids.has("dumbbell-shoulder-press")).toBe(true);
    expect(ids.has("glute-bridge")).toBe(false);
  });
});
