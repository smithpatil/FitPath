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
