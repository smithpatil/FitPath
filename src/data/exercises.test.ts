import { describe, expect, it } from "vitest";
import { EXERCISES } from "./exercises";
import { MUSCLE_GROUPS } from "../lib/math/graphColouring";

describe("exercise database", () => {
  it("has 100 exercises with unique ids: 74 strength and cardio (40 home + 25 gym + 9 cardio) plus 26 yoga poses", () => {
    expect(EXERCISES).toHaveLength(100);
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(100);
    expect(EXERCISES.filter((e) => e.style !== "yoga")).toHaveLength(74);
    expect(EXERCISES.filter((e) => e.style === "yoga")).toHaveLength(26);
  });
  it("yoga poses are gentle, need no equipment, and are held or flowed (never counted as reps)", () => {
    for (const e of EXERCISES.filter((x) => x.style === "yoga")) {
      expect(e.equipment).toEqual(["bodyweight"]);
      expect(e.impact).toBe("low");
      expect(["seconds", "minutes"]).toContain(e.unit);
      expect(e.difficulty).toBeLessThan(3);
    }
  });
  it("yoga progressions only build on other yoga poses", () => {
    const byId = new Map(EXERCISES.map((e) => [e.id, e]));
    for (const e of EXERCISES.filter((x) => x.style === "yoga"))
      for (const easier of e.easierIds) expect(byId.get(easier)!.style).toBe("yoga");
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
