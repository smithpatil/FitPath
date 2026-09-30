import { describe, expect, it } from "vitest";
import { addDays, mondayOf, parseISODate, toISODate, weekdayIndex, weeksBetween } from "./dates";
import { weekStreak, workoutDaysInWeek } from "./streak";

const wed = new Date(2026, 8, 30); // Wednesday 30 Sep 2026

describe("dates", () => {
  it("weeks start on Monday", () => {
    expect(weekdayIndex(wed)).toBe(2);
    expect(toISODate(mondayOf(wed))).toBe("2026-09-28");
    expect(toISODate(mondayOf(new Date(2026, 9, 4)))).toBe("2026-09-28"); // Sunday
  });
  it("round-trips ISO text and adds days across months", () => {
    expect(toISODate(parseISODate("2026-01-05"))).toBe("2026-01-05");
    expect(toISODate(addDays(wed, 3))).toBe("2026-10-03");
  });
  it("counts whole weeks", () => {
    expect(weeksBetween("2026-09-14", "2026-09-28")).toBe(2);
    expect(weeksBetween("2026-09-28", "2026-09-28")).toBe(0);
  });
});

describe("week streak", () => {
  it("is 0 with no workouts", () => {
    expect(weekStreak([], wed)).toBe(0);
  });
  it("counts this week and previous consecutive weeks", () => {
    expect(weekStreak(["2026-09-29", "2026-09-22", "2026-09-15"], wed)).toBe(3);
  });
  it("this week with no workout yet does not break the streak", () => {
    expect(weekStreak(["2026-09-22", "2026-09-16"], wed)).toBe(2);
  });
  it("a missed week breaks it", () => {
    expect(weekStreak(["2026-09-29", "2026-09-15"], wed)).toBe(1);
  });
  it("many workouts in one week still count as one week", () => {
    expect(weekStreak(["2026-09-28", "2026-09-29", "2026-09-30"], wed)).toBe(1);
  });
  it("counts distinct workout days this week", () => {
    expect(workoutDaysInWeek(["2026-09-28", "2026-09-28", "2026-09-30", "2026-09-21"], wed)).toBe(2);
  });
});
