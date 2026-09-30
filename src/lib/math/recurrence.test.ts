import { describe, expect, it } from "vitest";
import { inductionProof, overloadClosedForm, overloadPlan, overloadRecurrence } from "./recurrence";

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
