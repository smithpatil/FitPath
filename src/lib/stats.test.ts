import { describe, expect, it } from "vitest";
import {
  badgesFor,
  computeStats,
  formatMinutes,
  levelFor,
  longestWeekStreak,
  monthGrid,
  monthParam,
  nextMilestone,
  parseMonth,
  shiftMonth,
  type LogRow,
} from "./stats";

const row = (over: Partial<LogRow> = {}): LogRow => ({ exerciseId: "push-up", date: "2026-10-05", amount: null, weightKg: null, sets: null, target: null, ...over });
const wed = new Date(2026, 9, 7); // Wed 7 Oct 2026

describe("longestWeekStreak", () => {
  it("is 0 with nothing, 1 for one week", () => {
    expect(longestWeekStreak([])).toBe(0);
    expect(longestWeekStreak(["2026-10-05", "2026-10-06"])).toBe(1);
  });
  it("counts weeks in a row and finds the best run, not the latest", () => {
    // weeks starting 2026-09-07, 09-14, 09-21 (3 in a row), then a gap, then 10-05
    expect(longestWeekStreak(["2026-09-08", "2026-09-15", "2026-09-22", "2026-10-06"])).toBe(3);
  });
});

describe("computeStats", () => {
  const logs = [
    row({ date: "2026-10-05" }),
    row({ date: "2026-10-05", exerciseId: "plank" }),
    row({ date: "2026-10-06", exerciseId: "goblet-squat", weightKg: 10, amount: 10, sets: 3 }),
  ];
  const s = computeStats(logs, wed);

  it("counts distinct workout days and exercises", () => {
    expect(s.workoutDays).toBe(2);
    expect(s.exercisesDone).toBe(3);
    expect(s.countByDate).toEqual({ "2026-10-05": 2, "2026-10-06": 1 });
  });
  it("adds up the planned minutes of finished exercises", () => {
    expect(s.minutes).toBe(5 + 3 + 6); // push-up 5, plank 3, goblet squat 6
  });
  it("total weight lifted = weight × reps × sets", () => {
    expect(s.volumeKg).toBe(10 * 10 * 3);
  });
  it("uses the plan's target when no reps were written down, and 2 sets when unknown", () => {
    const t = computeStats([row({ exerciseId: "goblet-squat", weightKg: 8, target: 10 })], wed);
    expect(t.volumeKg).toBe(8 * 10 * 2);
  });
  it("bodyweight exercises add no weight", () => {
    expect(computeStats([row({ weightKg: null })], wed).volumeKg).toBe(0);
  });
  it("streaks: current counts this week, longest keeps the best ever", () => {
    expect(s.currentStreak).toBe(1);
    const old = computeStats([row({ date: "2026-08-04" }), row({ date: "2026-08-11" }), row({ date: "2026-08-18" }), row({ date: "2026-10-06" })], wed);
    expect(old.currentStreak).toBe(1);
    expect(old.longestStreak).toBe(3);
  });
  it("yoga: longest hold in seconds (written amount first, plan target otherwise)", () => {
    const y = computeStats(
      [row({ exerciseId: "tree-pose", amount: 40 }), row({ exerciseId: "downward-dog", target: 30 }), row({ exerciseId: "gentle-flow", amount: 5 })],
      wed,
    );
    expect(y.longestHoldSeconds).toBe(40);
  });
  it("ignores unknown exercise ids without crashing", () => {
    expect(computeStats([row({ exerciseId: "nope" })], wed).minutes).toBe(0);
  });
});

describe("formatMinutes", () => {
  it("reads naturally", () => {
    expect(formatMinutes(0)).toBe("0 min");
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(80)).toBe("1 h 20 min");
    expect(formatMinutes(180)).toBe("3 h");
  });
});

describe("badges and milestones", () => {
  const stats = (over: object) => ({ workoutDays: 0, exercisesDone: 0, minutes: 0, volumeKg: 0, longestHoldSeconds: 0, currentStreak: 0, longestStreak: 0, countByDate: {}, ...over });

  it("a new user has none; every badge has a title and a way to earn it", () => {
    const b = badgesFor(stats({}));
    expect(b.every((x) => !x.earned)).toBe(true);
    expect(b.every((x) => x.title && x.hint)).toBe(true);
    expect(new Set(b.map((x) => x.id)).size).toBe(b.length);
  });
  it("badges unlock at their thresholds", () => {
    const earned = (s: object) => badgesFor(stats(s)).filter((x) => x.earned).map((x) => x.id);
    expect(earned({ workoutDays: 1 })).toEqual(["first"]);
    expect(earned({ workoutDays: 10, longestStreak: 2, minutes: 60 })).toEqual(["first", "w5", "w10", "s2", "h1"]);
    expect(earned({ workoutDays: 25, longestStreak: 8, minutes: 300 }).length).toBe(9);
  });
  it("next milestone: distance, target and progress bar", () => {
    expect(nextMilestone(0)).toEqual({ target: 1, remaining: 1, fraction: 0 });
    expect(nextMilestone(3)).toEqual({ target: 5, remaining: 2, fraction: 0.5 }); // 1 → 5, you are 2 of 4 along
    expect(nextMilestone(5)).toEqual({ target: 10, remaining: 5, fraction: 0 });
    expect(nextMilestone(100)).toBeNull();
  });
});

describe("month calendar", () => {
  it("levels", () => {
    expect([0, 1, 2, 3, 5, 6, 20].map(levelFor)).toEqual([0, 1, 1, 2, 2, 3, 3]);
  });
  it("October 2026 starts on a Thursday and has 31 days in 5 whole weeks", () => {
    const g = monthGrid(2026, 9, { "2026-10-05": 4, "2026-10-06": 1 });
    expect(g.label).toBe("October 2026");
    expect(g.weeks.every((w) => w.length === 7)).toBe(true);
    expect(g.weeks).toHaveLength(5);
    expect(g.weeks[0].slice(0, 3)).toEqual([null, null, null]); // Mon, Tue, Wed blank
    expect(g.weeks[0][3]?.day).toBe(1); // Thursday
    expect(g.weeks.flat().filter((c) => c !== null)).toHaveLength(31);
    expect(g.activeDays).toBe(2);
  });
  it("puts counts and levels on the right days", () => {
    const cell = monthGrid(2026, 9, { "2026-10-05": 4 }).weeks.flat().find((c) => c?.day === 5)!;
    expect(cell.count).toBe(4);
    expect(cell.level).toBe(2);
  });
  it("leap February has 29 days", () => {
    expect(monthGrid(2028, 1, {}).weeks.flat().filter((c) => c !== null)).toHaveLength(29);
  });
  it("a month that starts on Monday has no blank cell before the 1st", () => {
    expect(monthGrid(2026, 5, {}).weeks[0][0]?.day).toBe(1); // 1 June 2026 is a Monday
  });
});

describe("month navigation", () => {
  it("reads ?month=YYYY-MM and falls back to the current month", () => {
    expect(parseMonth("2026-08", wed)).toEqual({ year: 2026, month0: 7 });
    expect(parseMonth(undefined, wed)).toEqual({ year: 2026, month0: 9 });
    expect(parseMonth("nonsense", wed)).toEqual({ year: 2026, month0: 9 });
    expect(parseMonth("2026-13", wed)).toEqual({ year: 2026, month0: 9 });
    expect(parseMonth("2030-01", wed)).toEqual({ year: 2026, month0: 9 }); // not in the future
    expect(parseMonth("1999-01", wed)).toEqual({ year: 2026, month0: 9 });
  });
  it("moves across year boundaries", () => {
    expect(shiftMonth({ year: 2026, month0: 0 }, -1)).toEqual({ year: 2025, month0: 11 });
    expect(shiftMonth({ year: 2025, month0: 11 }, 1)).toEqual({ year: 2026, month0: 0 });
    expect(monthParam({ year: 2026, month0: 2 })).toBe("2026-03");
  });
});
