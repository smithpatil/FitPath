import { describe, expect, it } from "vitest";
import { COOLDOWN_SECONDS, WARMUP_SECONDS } from "../data/warmups";
import { cooldownFor, totalSeconds, warmupFor } from "./routine";

const plain = { level: "beginner" as const, limitations: [] };
const knees = { level: "beginner" as const, limitations: ["knee" as const] };

describe("warm-up and cool-down", () => {
  it("fill their time exactly without going over", () => {
    for (const user of [plain, knees, { level: "some_experience" as const, limitations: ["knee" as const, "wrist" as const, "shoulder" as const, "lower_back" as const] }]) {
      expect(totalSeconds(warmupFor(user))).toBeLessThanOrEqual(WARMUP_SECONDS);
      expect(totalSeconds(warmupFor(user))).toBeGreaterThanOrEqual(WARMUP_SECONDS - 30);
      expect(totalSeconds(cooldownFor(user))).toBeLessThanOrEqual(COOLDOWN_SECONDS);
      expect(totalSeconds(cooldownFor(user))).toBeGreaterThanOrEqual(COOLDOWN_SECONDS - 30);
    }
  });
  it("sore knees: no jumping, no squats, no knee-bending stretch (same logic rules as the plan)", () => {
    const wu = warmupFor(knees).map((m) => m.id);
    expect(wu).not.toContain("wu-jacks");
    expect(wu).not.toContain("wu-bodyweight-squats");
    expect(wu).toContain("wu-step-jacks"); // the no-jump alternative takes its place
    expect(cooldownFor(knees).map((m) => m.id)).not.toContain("cd-quad");
  });
  it("without limits the normal jumping jacks are allowed", () => {
    expect(warmupFor(plain).map((m) => m.id)).toContain("wu-jacks");
  });
  it("is deterministic", () => {
    expect(warmupFor(knees)).toEqual(warmupFor(knees));
  });
});
