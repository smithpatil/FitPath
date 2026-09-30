import { describe, expect, it } from "vitest";
import { EXERCISES } from "../../data/exercises";
import { difference, doableExercises, intersection, isSubset, union, usableExercises } from "./sets";

const s = (...x: number[]) => new Set(x);

describe("set operations", () => {
  it("intersection keeps only shared elements", () => {
    expect(intersection(s(1, 2, 3), s(2, 3, 4))).toEqual(s(2, 3));
  });
  it("union combines without duplicates", () => {
    expect(union(s(1, 2), s(2, 3))).toEqual(s(1, 2, 3));
  });
  it("difference removes elements of the second set", () => {
    expect(difference(s(1, 2, 3), s(2))).toEqual(s(1, 3));
  });
  it("subset check", () => {
    expect(isSubset(s(1, 2), s(1, 2, 3))).toBe(true);
    expect(isSubset(s(1, 4), s(1, 2, 3))).toBe(false);
    expect(isSubset(s(), s(1))).toBe(true); // empty set is a subset of everything
  });
});

describe("usable exercises = (equipment ∩ requirements) − excluded", () => {
  it("with no equipment, only bodyweight exercises are doable", () => {
    const doable = doableExercises(EXERCISES, []);
    expect(doable.length).toBeGreaterThan(0);
    expect(doable.every((e) => e.equipment.every((q) => q === "bodyweight"))).toBe(true);
  });
  it("owning dumbbells adds dumbbell exercises but keeps bodyweight ones", () => {
    const none = doableExercises(EXERCISES, []).length;
    const withDb = doableExercises(EXERCISES, ["dumbbells"]);
    expect(withDb.length).toBeGreaterThan(none);
    expect(withDb.some((e) => e.id === "goblet-squat")).toBe(true);
  });
  it("a gym contains every other kind of equipment, so all exercises are doable", () => {
    expect(doableExercises(EXERCISES, ["gym"])).toHaveLength(EXERCISES.length);
  });
  it("without a gym, gym exercises are never doable", () => {
    const doable = doableExercises(EXERCISES, ["dumbbells", "resistance_band", "pull_up_bar"]);
    expect(doable.some((e) => e.equipment.includes("gym"))).toBe(false);
  });
  it("an exercise needing several items is not doable with only some of them", () => {
    const fake = { ...EXERCISES[0], id: "x", equipment: ["dumbbells", "pull_up_bar"] as never };
    expect(doableExercises([fake], ["dumbbells"])).toHaveLength(0);
    expect(doableExercises([fake], ["dumbbells", "pull_up_bar"])).toHaveLength(1);
  });
  it("excluded ids are subtracted", () => {
    const usable = usableExercises(EXERCISES, [], new Set(["push-up"]));
    expect(usable.find((e) => e.id === "push-up")).toBeUndefined();
    expect(usable.find((e) => e.id === "knee-push-up")).toBeDefined();
  });
  it("usable is always a subset of doable", () => {
    const doable = new Set(doableExercises(EXERCISES, ["resistance_band"]).map((e) => e.id));
    const usable = new Set(usableExercises(EXERCISES, ["resistance_band"], new Set(["band-row"])).map((e) => e.id));
    expect(isSubset(usable, doable)).toBe(true);
  });
});
