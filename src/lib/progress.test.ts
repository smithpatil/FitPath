import { describe, expect, it } from "vitest";
import { weeklyCounts } from "./progress";
import { formatWeight, fromKg, isPlausibleKg, toKg } from "./units";

const wed = new Date(2026, 8, 30); // Wed 30 Sep 2026 (week starts Mon 28 Sep)

describe("weeklyCounts", () => {
  it("returns the requested number of weeks, oldest first, ending this week", () => {
    const w = weeklyCounts([], wed, 8);
    expect(w).toHaveLength(8);
    expect(w[7].weekStart).toBe("2026-09-28");
    expect(w[0].weekStart).toBe("2026-08-10");
    expect(w.every((x) => x.count === 0)).toBe(true);
  });
  it("counts distinct workout days per week", () => {
    const w = weeklyCounts(["2026-09-28", "2026-09-28", "2026-09-30", "2026-09-22"], wed, 3);
    expect(w.map((x) => x.count)).toEqual([0, 1, 2]);
  });
  it("Sunday belongs to the week that started the Monday before", () => {
    const w = weeklyCounts(["2026-10-04"], wed, 1);
    expect(w[0].count).toBe(1);
  });
  it("labels look like '28 Sep'", () => {
    expect(weeklyCounts([], wed, 1)[0].label).toBe("28 Sep");
  });
  it("ignores dates outside the range", () => {
    expect(weeklyCounts(["2020-01-01"], wed, 4).every((x) => x.count === 0)).toBe(true);
  });
});

describe("units", () => {
  it("kg stays kg", () => {
    expect(toKg(70, "kg")).toBe(70);
    expect(fromKg(70.25, "kg")).toBe(70.3);
  });
  it("converts pounds to kilograms and back", () => {
    expect(toKg(154, "lb")).toBeCloseTo(69.85, 2);
    expect(fromKg(70, "lb")).toBe(154.3);
  });
  it("round trip is close", () => {
    expect(fromKg(toKg(180, "lb"), "lb")).toBeCloseTo(180, 0);
  });
  it("formats with the unit", () => {
    expect(formatWeight(70, "kg")).toBe("70 kg");
  });
  it("rejects silly weights", () => {
    expect(isPlausibleKg(70)).toBe(true);
    expect(isPlausibleKg(5)).toBe(false);
    expect(isPlausibleKg(700)).toBe(false);
    expect(isPlausibleKg(NaN)).toBe(false);
  });
});
