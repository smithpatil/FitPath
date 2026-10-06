import { describe, expect, it } from "vitest";
import {
  adaptiveClosedForm,
  adaptiveInductionProof,
  adaptiveSequence,
  inductionProof,
  multipliersFromFeedback,
  overloadClosedForm,
  overloadPlan,
  overloadRecurrence,
  stepMultiplier,
  stepSum,
} from "./recurrence";

describe("adaptive overload (feedback)", () => {
  it("one week's multiplier follows the majority feeling", () => {
    expect(stepMultiplier(["easy", "easy", "right"])).toBe(2);
    expect(stepMultiplier(["hard", "right"])).toBe(0);
    expect(stepMultiplier(["easy", "hard"])).toBe(1); // a tie means a normal step
    expect(stepMultiplier([])).toBe(1); // no answers: carry on as normal
  });
  it("answers from week i decide the multiplier of week i + 1", () => {
    // week 0 felt easy, week 1 had no answers, week 2 felt hard
    expect(multipliersFromFeedback([["easy"], [], ["hard"]], 3)).toEqual([2, 1, 0]);
    expect(multipliersFromFeedback([], 0)).toEqual([]);
  });
  it("closed form W(n) = W(0) + d·S(n) matches the recurrence for every prefix", () => {
    const ms = [2, 1, 0, 1, 2, 0, 0, 1];
    const seq = adaptiveSequence(10, 1, ms);
    expect(seq).toEqual([10, 12, 13, 13, 14, 16, 16, 16, 17]);
    for (let n = 0; n <= ms.length; n++) expect(adaptiveClosedForm(10, 1, ms.slice(0, n))).toBe(seq[n]);
  });
  it("all multipliers = 1 gives back the fixed plan W(0) + n·d", () => {
    const ones = Array(6).fill(1);
    expect(adaptiveClosedForm(8, 2, ones)).toBe(overloadClosedForm(8, 2, 6));
    expect(stepSum(ones)).toBe(6);
  });
  it("bounds: never goes down, never faster than double: W(0) ≤ W(n) ≤ W(0) + 2nd", () => {
    for (let trial = 0; trial < 50; trial++) {
      const ms = Array.from({ length: 10 }, (_, i) => ((trial * 7 + i * 3) % 3) as 0 | 1 | 2);
      const seq = adaptiveSequence(10, 1, ms);
      seq.forEach((w, n) => {
        expect(w).toBeGreaterThanOrEqual(10);
        expect(w).toBeLessThanOrEqual(10 + 2 * n * 1);
        if (n > 0) expect(w).toBeGreaterThanOrEqual(seq[n - 1]);
      });
    }
  });
  it("adaptive induction proof is checked and written with the user's numbers", () => {
    const p = adaptiveInductionProof(10, 1, [2, 1, 0]);
    expect(p.allAgree).toBe(true);
    expect(p.base.holds).toBe(true);
    expect(p.claim).toContain("10 + 1·S(n)");
  });
});

describe("progressive overload", () => {
  it("recurrence: 8 reps, +1 each week", () => {
    expect(overloadRecurrence(8, 1, 0)).toBe(8);
    expect(overloadRecurrence(8, 1, 4)).toBe(12);
  });
  it("closed form gives the same answer as the recurrence for many (W0, d, n)", () => {
    for (const w0 of [0, 5, 8, 12])
      for (const d of [0, 1, 2, 2.5])
        for (let n = 0; n <= 30; n++)
          expect(overloadClosedForm(w0, d, n)).toBeCloseTo(overloadRecurrence(w0, d, n), 10);
  });
  it("overloadPlan lists weeks 0..n−1", () => {
    expect(overloadPlan(8, 2, 4)).toEqual([8, 10, 12, 14]);
  });
  it("rejects negative or fractional weeks", () => {
    expect(() => overloadRecurrence(8, 1, -1)).toThrow();
    expect(() => overloadClosedForm(8, 1, 1.5)).toThrow();
  });
});

describe("induction proof", () => {
  const p = inductionProof(8, 2);
  it("base case holds", () => {
    expect(p.base.holds).toBe(true);
    expect(p.base.text).toContain("8");
  });
  it("is written with the user's numbers", () => {
    expect(p.claim).toBe("For every week n ≥ 0:  W(n) = 8 + n·2");
    expect(p.stepLines.join(" ")).toContain("(8 + k·2) + 2");
  });
  it("recurrence and closed form agree over the checked range", () => {
    expect(p.allAgree).toBe(true);
    expect(p.checkedUpTo).toBe(12);
  });
});
