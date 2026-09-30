import { describe, expect, it } from "vitest";
import { buildMathsExamples } from "./mathsExamples";
import { generatePlan, usableFor } from "./planGenerator";
import type { Answers } from "./onboarding";

const profiles: Record<string, Answers> = {
  home: { goal: "stay_active", level: "beginner", days: 3, minutes: 30, equipment: ["dumbbells"], limitations: ["knee"] },
  none: { goal: "lose_weight", level: "beginner", days: 4, minutes: 20, equipment: [], limitations: [] },
  gym: { goal: "build_strength", level: "some_experience", days: 5, minutes: 60, equipment: ["gym"], limitations: ["wrist"] },
  hardest: { goal: "stay_active", level: "beginner", days: 6, minutes: 15, equipment: [], limitations: ["knee", "wrist", "lower_back", "shoulder"] },
};

function examplesFor(p: Answers) {
  const plan = generatePlan(p, 3);
  return { plan, ex: buildMathsExamples(p, plan.days.map((d) => ({ exerciseIds: d.items.map((i) => i.exerciseId) })), 3) };
}

describe.each(Object.entries(profiles))("maths examples for %s", (_name, profile) => {
  const { plan, ex } = examplesFor(profile);

  it("set counts add up: usable = doable − excluded", () => {
    expect(ex.sets.usableCount).toBe(ex.sets.doableCount - ex.sets.excludedInDoable.length);
    expect(ex.sets.usableCount).toBe(usableFor(profile).length);
  });
  it("logic table has 2^(premises+1) rows", () => {
    expect(ex.logic.table).toHaveLength(2 ** (ex.logic.rule.premises.length + 1));
  });
  it("the graph colouring is proper and uses χ colours", () => {
    expect(ex.graph.proper).toBe(true);
    expect(new Set(Object.values(ex.graph.colouring)).size).toBe(ex.graph.chromaticNumber);
  });
  it("counting: total plans is the product of the per-day counts and never 0", () => {
    const product = ex.counting.pools.reduce((s, p) => s * p.ways, 1n);
    expect(ex.counting.totalPlans).toBe(product);
    expect(ex.counting.totalPlans > 0n).toBe(true);
    expect(ex.counting.pools).toHaveLength(plan.days.length);
  });
  it("recurrence table: closed form always equals the recurrence", () => {
    for (const w of ex.recurrence.weeks) expect(w.closedForm).toBe(w.recurrence);
    expect(ex.recurrence.proof.allAgree).toBe(true);
  });
  it("knapsack example never exceeds its capacity", () => {
    expect(ex.knapsack).not.toBeNull();
    expect(ex.knapsack!.result.totalWeight).toBeLessThanOrEqual(ex.knapsack!.capacity);
    expect(ex.knapsack!.fullDay.totalMin).toBeLessThanOrEqual(profile.minutes);
  });
  it("partial-order diagram, when present, is a genuine partial order", () => {
    if (ex.relations.properties) expect(ex.relations.properties.isPartialOrder).toBe(true);
    if (ex.relations.equivalence) expect(ex.relations.equivalence.properties.isEquivalence).toBe(true);
  });
});

describe("specific facts", () => {
  it("a knee limit picks the knee rule", () => {
    expect(examplesFor(profiles.home).ex.logic.rule.premises).toContain("knee");
  });
  it("home users (dumbbells) get a Hasse diagram with at least one edge", () => {
    expect(examplesFor(profiles.home).ex.relations.edges.length).toBeGreaterThan(0);
  });
  it("gym: the whole exercise list is doable", () => {
    const { ex } = examplesFor(profiles.gym);
    expect(ex.sets.doableCount).toBe(ex.sets.total);
  });
  it("6 days over 6+ muscle groups forces nothing false: pigeonhole flag matches the numbers", () => {
    const { ex } = examplesFor(profiles.hardest);
    const g = ex.counting.groupsIntoDays;
    expect(g.repeatForced).toBe(g.items > g.boxes);
  });
});
