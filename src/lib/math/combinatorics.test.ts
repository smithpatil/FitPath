import { describe, expect, it } from "vitest";
import { choose, countWeeklyPlans, factorial, pigeonhole } from "./combinatorics";

describe("factorial and choose", () => {
  it("factorial", () => {
    expect(factorial(0)).toBe(1n);
    expect(factorial(5)).toBe(120n);
    expect(factorial(20)).toBe(2432902008176640000n);
  });
  it("C(7,3) = 35 ways to pick 3 training days", () => {
    expect(choose(7, 3)).toBe(35n);
  });
  it("edge cases", () => {
    expect(choose(5, 0)).toBe(1n);
    expect(choose(5, 5)).toBe(1n);
    expect(choose(3, 5)).toBe(0n);
  });
  it("is symmetric: C(n,k) = C(n,n−k)", () => {
    expect(choose(10, 3)).toBe(choose(10, 7));
  });
  it("Pascal's rule: C(n,k) = C(n−1,k−1) + C(n−1,k)", () => {
    for (let n = 1; n <= 15; n++)
      for (let k = 1; k < n; k++) expect(choose(n, k)).toBe(choose(n - 1, k - 1) + choose(n - 1, k));
  });
  it("large values stay exact", () => {
    expect(choose(50, 25)).toBe(126410606437752n);
  });
  it("rejects bad input", () => {
    expect(() => choose(-1, 0)).toThrow();
    expect(() => choose(2.5, 1)).toThrow();
  });
});

describe("countWeeklyPlans (product rule)", () => {
  it("multiplies the choices for each day", () => {
    expect(countWeeklyPlans([{ available: 5, picks: 2 }, { available: 4, picks: 1 }])).toBe(40n); // 10 × 4
  });
  it("no days → exactly one (empty) plan", () => {
    expect(countWeeklyPlans([])).toBe(1n);
  });
  it("a day with too few options makes the count 0", () => {
    expect(countWeeklyPlans([{ available: 1, picks: 2 }])).toBe(0n);
  });
});

describe("pigeonhole principle", () => {
  it("7 muscle groups in 6 days forces a repeat", () => {
    const r = pigeonhole(7, 6);
    expect(r.repeatForced).toBe(true);
    expect(r.atLeastInSomeBox).toBe(2);
  });
  it("no repeat is forced when items ≤ boxes", () => {
    expect(pigeonhole(4, 4).repeatForced).toBe(false);
  });
  it("ceiling: 10 items in 3 boxes → some box has at least 4", () => {
    expect(pigeonhole(10, 3).atLeastInSomeBox).toBe(4);
  });
  it("rejects zero boxes", () => {
    expect(() => pigeonhole(3, 0)).toThrow();
  });
});
