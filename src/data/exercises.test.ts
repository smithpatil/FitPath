import { describe, expect, it } from "vitest";
import { EXERCISES } from "./exercises";
import { MUSCLE_GROUPS } from "../lib/math/graphColouring";

describe("exercise database", () => {
  it("has 74 exercises (40 home + 25 gym + 9 cardio) with unique ids", () => {
    expect(EXERCISES).toHaveLength(74);
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(74);
  });
  it("every progression link points to a real exercise", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    for (const e of EXERCISES) for (const easier of e.easierIds) expect(ids.has(easier)).toBe(true);
  });
  it("a harder exercise is never easier than what it builds on", () => {
    const byId = new Map(EXERCISES.map((e) => [e.id, e]));
    for (const e of EXERCISES)
      for (const easier of e.easierIds) expect(byId.get(easier)!.difficulty).toBeLessThanOrEqual(e.difficulty);
  });
  it("all numbers are sensible integers", () => {
    for (const e of EXERCISES) {
      expect(Number.isInteger(e.durationMin) && e.durationMin > 0).toBe(true);
      expect(e.benefit).toBeGreaterThanOrEqual(1);
      expect(e.benefit).toBeLessThanOrEqual(10);
      expect(e.howTo.length).toBeGreaterThan(20);
    }
  });
  it("every muscle group has at least one bodyweight exercise (everyone gets a full plan)", () => {
    for (const g of MUSCLE_GROUPS)
      expect(EXERCISES.some((e) => e.muscleGroup === g && e.equipment.every((q) => q === "bodyweight"))).toBe(true);
  });
});
