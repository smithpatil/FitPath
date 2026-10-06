import { describe, expect, it } from "vitest";
import { EXERCISES } from "../data/exercises";
import { isWeighted, parseAmount, parseWeight, personalBests, suggestNextWeight, WEIGHT_STEP } from "./strength";

const byId = (id: string) => EXERCISES.find((e) => e.id === id)!;

describe("which exercises take a weight", () => {
  it("dumbbell and gym rep exercises do", () => {
    expect(isWeighted(byId("goblet-squat"))).toBe(true);
    expect(isWeighted(byId("lat-pulldown"))).toBe(true);
  });
  it("bodyweight, bands, timed holds and cardio do not", () => {
    for (const id of ["push-up", "band-row", "plank", "brisk-walk", "treadmill-walk"]) expect(isWeighted(byId(id))).toBe(false);
  });
});

describe("double progression W(n+1) = W(n) + Δ·[all reps done]", () => {
  it("adds one step when every target rep was done", () => {
    expect(suggestNextWeight(10, 10, 10, WEIGHT_STEP.kg)).toBe(12);
    expect(suggestNextWeight(10, 12, 10, WEIGHT_STEP.kg)).toBe(12);
    expect(suggestNextWeight(20, 8, 8, WEIGHT_STEP.lb)).toBe(25);
  });
  it("keeps the weight when reps were missed or not logged", () => {
    expect(suggestNextWeight(10, 9, 10, 2)).toBe(10);
    expect(suggestNextWeight(10, null, 10, 2)).toBe(10);
    expect(suggestNextWeight(10, 10, null, 2)).toBe(10);
  });
  it("never goes down", () => {
    for (let reps = 0; reps <= 15; reps++) expect(suggestNextWeight(7.5, reps, 10, 2)).toBeGreaterThanOrEqual(7.5);
  });
});

describe("personal bests", () => {
  it("keeps the heaviest weight per exercise, earliest date on a tie, ignores unweighted logs", () => {
    const bests = personalBests([
      { exerciseId: "a", weightKg: 10, amount: 10, target: 10, date: "2026-10-01" },
      { exerciseId: "a", weightKg: 12, amount: 8, target: 10, date: "2026-10-05" },
      { exerciseId: "a", weightKg: 12, amount: 10, target: 10, date: "2026-10-08" },
      { exerciseId: "b", weightKg: null, amount: 12, target: 12, date: "2026-10-09" },
      { exerciseId: "c", weightKg: 30, amount: 10, target: 10, date: "2026-10-02" },
    ]);
    expect(bests).toEqual([
      { exerciseId: "a", weightKg: 12, date: "2026-10-05" },
      { exerciseId: "c", weightKg: 30, date: "2026-10-02" },
    ]);
  });
});

describe("parsing what people type", () => {
  it("amounts: whole numbers 1 to 1000, or empty", () => {
    expect(parseAmount("12")).toBe(12);
    expect(parseAmount("  ")).toBeNull();
    expect(parseAmount("0")).toBe("invalid");
    expect(parseAmount("2.5")).toBe("invalid");
    expect(parseAmount("abc")).toBe("invalid");
  });
  it("weights: above 0, at most 500, comma decimals allowed", () => {
    expect(parseWeight("7,5")).toBe(7.5);
    expect(parseWeight("")).toBeNull();
    expect(parseWeight("-3")).toBe("invalid");
    expect(parseWeight("900")).toBe("invalid");
  });
});
