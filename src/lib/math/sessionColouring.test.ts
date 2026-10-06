import { describe, expect, it } from "vitest";
import { rescheduleSessions, sessionsConflict, type Session } from "./sessionColouring";

const s = (id: string, groups: string[], extra: Partial<Session> = {}): Session => ({ id, groups, ...extra });

describe("session conflicts", () => {
  it("same group, or groups that share muscles, conflict", () => {
    expect(sessionsConflict(s("a", ["chest"]), s("b", ["shoulders"]))).toBe(true);
    expect(sessionsConflict(s("a", ["legs"]), s("b", ["legs"]))).toBe(true);
    expect(sessionsConflict(s("a", ["legs", "core"]), s("b", ["chest"]))).toBe(false);
    expect(sessionsConflict(s("a", ["cardio"]), s("b", ["legs"]))).toBe(true);
  });
});

describe("rescheduleSessions", () => {
  it("unrelated sessions go on their preferred days", () => {
    const r = rescheduleSessions(
      [s("a", ["chest"], { preferredDay: 1 }), s("b", ["back"], { preferredDay: 3 }), s("c", ["legs"], { preferredDay: 5 })],
      [1, 2, 3, 4, 5, 6],
    );
    expect(r.dayOf).toEqual({ a: 1, b: 3, c: 5 });
    expect(r.unplaced).toEqual([]);
    expect(r.consecutiveClashes).toBe(0);
  });

  it("started sessions keep their day (pre-coloured) and nobody else uses it", () => {
    const r = rescheduleSessions(
      [s("done", ["legs"], { fixedDay: 0 }), s("missed", ["chest"], { preferredDay: 0 }), s("later", ["back"], { preferredDay: 4 })],
      [1, 2, 3, 4, 5, 6], // today is Tuesday, so Monday (0) is in the past
    );
    expect(r.dayOf.done).toBe(0);
    expect(r.dayOf.missed).not.toBe(0);
    expect(new Set(Object.values(r.dayOf)).size).toBe(3); // all different days
  });

  it("keeps conflicting sessions at least 2 days apart when there is room", () => {
    // chest and shoulders conflict; both want day 2, free days 2..4
    const r = rescheduleSessions([s("chest", ["chest"], { preferredDay: 2 }), s("shoulders", ["shoulders"], { preferredDay: 2 })], [2, 3, 4]);
    expect(r.consecutiveClashes).toBe(0);
    expect(Math.abs(r.dayOf.chest! - r.dayOf.shoulders!)).toBeGreaterThanOrEqual(2);
  });

  it("accepts a back-to-back clash only when there is no better way", () => {
    const r = rescheduleSessions([s("chest", ["chest"], { preferredDay: 2 }), s("shoulders", ["shoulders"], { preferredDay: 2 })], [2, 3]);
    expect(r.consecutiveClashes).toBe(1);
    expect(r.unplaced).toEqual([]);
  });

  it("pigeonhole: more sessions than free days means some cannot fit, and as few as possible are left out", () => {
    const r = rescheduleSessions(
      [s("a", ["chest"], { preferredDay: 4 }), s("b", ["back"], { preferredDay: 5 }), s("c", ["legs"], { preferredDay: 6 }), s("d", ["core"], { preferredDay: 6 })],
      [4, 5, 6],
    );
    expect(r.unplaced).toHaveLength(1);
    expect(Object.values(r.dayOf).filter((d) => d !== null)).toHaveLength(3);
  });

  it("with nothing movable, returns the fixed days untouched", () => {
    const r = rescheduleSessions([s("a", ["chest"], { fixedDay: 3 })], [4, 5]);
    expect(r.dayOf).toEqual({ a: 3 });
  });

  it("is deterministic", () => {
    const input = [s("a", ["chest"], { preferredDay: 2 }), s("b", ["arms"], { preferredDay: 2 }), s("c", ["legs"], { preferredDay: 3 })];
    expect(rescheduleSessions(input, [2, 3, 4, 5, 6])).toEqual(rescheduleSessions(input, [2, 3, 4, 5, 6]));
  });

  it("matches a brute-force search on many random small cases (fewest unplaced, then fewest clashes)", () => {
    const groupsList = ["chest", "shoulders", "arms", "back", "legs", "core", "glutes", "cardio"];
    let seed = 7;
    const rand = (m: number) => ((seed = (seed * 1103515245 + 12345) % 2147483648), seed % m);
    for (let trial = 0; trial < 150; trial++) {
      const k = 1 + rand(5);
      const sessions = Array.from({ length: k }, (_, i) => s(`s${i}`, [groupsList[rand(groupsList.length)]], { preferredDay: rand(7) }));
      const avail = [0, 1, 2, 3, 4, 5, 6].filter(() => rand(3) > 0);
      const got = rescheduleSessions(sessions, avail);

      // brute force over every assignment (a day from `avail`, or left out), all days different
      let bestUnplaced = Infinity;
      let bestClashes = Infinity;
      const days: (number | null)[] = Array(k).fill(null);
      const go = (i: number) => {
        if (i === k) {
          const placed = days.filter((d) => d !== null) as number[];
          if (new Set(placed).size !== placed.length) return;
          const unplaced = k - placed.length;
          let clashes = 0;
          for (let a = 0; a < k; a++)
            for (let b = a + 1; b < k; b++)
              if (days[a] !== null && days[b] !== null && sessionsConflict(sessions[a], sessions[b]) && Math.abs(days[a]! - days[b]!) === 1) clashes++;
          if (unplaced < bestUnplaced || (unplaced === bestUnplaced && clashes < bestClashes)) {
            bestUnplaced = unplaced;
            bestClashes = clashes;
          }
          return;
        }
        days[i] = null;
        go(i + 1);
        for (const d of avail) {
          days[i] = d;
          go(i + 1);
        }
        days[i] = null;
      };
      go(0);
      expect(got.unplaced.length).toBe(bestUnplaced);
      expect(got.consecutiveClashes).toBe(bestClashes);
    }
  });
});
