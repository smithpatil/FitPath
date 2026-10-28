import { describe, expect, it } from "vitest";
import { validateAnswers } from "./onboarding";

const good = {
  goal: "stay_active",
  level: "beginner",
  days: 3,
  minutes: 30,
  equipment: ["dumbbells"],
  limitations: ["knee"],
};

describe("validateAnswers", () => {
  it("accepts good answers", () => {
    const r = validateAnswers(good);
    expect(r.ok).toBe(true);
  });
  it("accepts empty equipment and limitations", () => {
    expect(validateAnswers({ ...good, equipment: [], limitations: [] }).ok).toBe(true);
  });
  it("removes duplicates", () => {
    const r = validateAnswers({ ...good, equipment: ["dumbbells", "dumbbells"] });
    expect(r.ok && r.data.equipment).toEqual(["dumbbells"]);
  });
  it("choosing the gym replaces all other equipment", () => {
    const r = validateAnswers({ ...good, equipment: ["dumbbells", "gym", "resistance_band"] });
    expect(r.ok && r.data.equipment).toEqual(["gym"]);
  });
  it("keeps the chosen style and cleans the equipment to suit it", () => {
    const yoga = validateAnswers({ ...good, format: "yoga", equipment: ["dumbbells"] });
    expect(yoga.ok && yoga.data.format).toBe("yoga");
    expect(yoga.ok && yoga.data.equipment).toEqual([]);

    const home = validateAnswers({ ...good, format: "gym", equipment: ["dumbbells", "pull_up_bar"] });
    expect(home.ok && home.data.format).toBe("gym");
    expect(home.ok && home.data.equipment).toEqual(["dumbbells", "pull_up_bar"]);

    const strength = validateAnswers({ ...good, format: "strength", equipment: ["gym", "dumbbells"] });
    expect(strength.ok && strength.data.equipment).toEqual(["dumbbells"]);
  });
  it("works out the style from the equipment when none is sent", () => {
    const r = validateAnswers({ ...good, equipment: ["gym"] });
    expect(r.ok && r.data.format).toBe("gym");
    const s = validateAnswers({ ...good, equipment: [] });
    expect(s.ok && s.data.format).toBe("strength");
  });
  it("rejects an unknown style", () => {
    expect(validateAnswers({ ...good, format: "crossfit" }).ok).toBe(false);
  });
  it.each([
    ["goal", { goal: "become_a_wizard" }],
    ["level", { level: "expert" }],
    ["days", { days: 7 }],
    ["days", { days: "3" }],
    ["minutes", { minutes: 5 }],
    ["equipment", { equipment: ["jetpack"] }],
    ["equipment", { equipment: "dumbbells" }],
    ["limitations", { limitations: ["hair"] }],
  ])("rejects a bad %s", (_name, patch) => {
    expect(validateAnswers({ ...good, ...patch }).ok).toBe(false);
  });
  it("rejects null and non-objects", () => {
    expect(validateAnswers(null).ok).toBe(false);
    expect(validateAnswers("hi").ok).toBe(false);
  });
});
