import { describe, expect, it } from "vitest";
import { EXERCISES } from "../data/exercises";
import { FORMAT_INFO, FORMAT_ORDER, deriveFormat, fitsFormat, formatOf, normaliseEquipment } from "./formats";

describe("workout styles", () => {
  it("there are exactly three, in the order Gym, Strength, Yoga, each with a card's worth of content", () => {
    expect(FORMAT_ORDER).toEqual(["gym", "strength", "yoga"]);
    for (const f of FORMAT_ORDER) {
      expect(FORMAT_INFO[f].benefits).toHaveLength(3);
      expect(FORMAT_INFO[f].title.length).toBeGreaterThan(0);
      expect(FORMAT_INFO[f].description.length).toBeGreaterThan(20);
    }
  });

  it("every exercise belongs to exactly one library: yoga poses OR strength/cardio", () => {
    for (const e of EXERCISES) expect(fitsFormat(e, "yoga")).toBe(e.style === "yoga");
    for (const e of EXERCISES) expect(fitsFormat(e, "gym")).toBe(!fitsFormat(e, "yoga"));
    expect(EXERCISES.every((e) => fitsFormat(e, "gym") !== fitsFormat(e, "yoga"))).toBe(true);
    expect(EXERCISES.every((e) => fitsFormat(e, "gym") === fitsFormat(e, "strength"))).toBe(true);
  });
});

describe("style from equipment (for profiles saved before styles existed)", () => {
  it("a gym user is gym, everyone else strength", () => {
    expect(deriveFormat(["gym"])).toBe("gym");
    expect(deriveFormat([])).toBe("strength");
    expect(deriveFormat(["dumbbells"])).toBe("strength");
  });
  it("a saved style wins over the guess", () => {
    expect(formatOf({ format: "yoga", equipment: ["gym"] })).toBe("yoga");
    expect(formatOf({ equipment: ["gym"] })).toBe("gym");
  });
});

describe("normaliseEquipment", () => {
  it("yoga needs no equipment", () => {
    expect(normaliseEquipment("yoga", ["dumbbells", "gym"])).toEqual([]);
  });
  it("a gym has everything, so it replaces the other items", () => {
    expect(normaliseEquipment("gym", ["gym", "dumbbells"])).toEqual(["gym"]);
  });
  it("a home gym keeps the chosen items (any of dumbbells, bands, pull-up bar)", () => {
    expect(normaliseEquipment("gym", ["dumbbells", "pull_up_bar"])).toEqual(["dumbbells", "pull_up_bar"]);
    expect(normaliseEquipment("gym", [])).toEqual([]);
  });
  it("strength never has a gym: it is removed, duplicates too", () => {
    expect(normaliseEquipment("strength", ["gym", "resistance_band", "resistance_band"])).toEqual(["resistance_band"]);
  });
});
