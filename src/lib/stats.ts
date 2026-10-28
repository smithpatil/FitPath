// Numbers for the Progress page: totals, streaks, badges and the month calendar.
// Pure functions (no database, no screens) so they can be unit-tested.
import { EXERCISES } from "../data/exercises";
import { addDays, mondayOf, parseISODate, toISODate, weekdayIndex } from "./dates";
import type { IconName } from "@/components/Icon";
import { weekStreak } from "./streak";

/** One finished exercise, as saved in the workout log. */
export interface LogRow {
  exerciseId: string;
  /** YYYY-MM-DD */
  date: string;
  /** What the person actually did (reps per set, seconds or minutes), if they wrote it down. */
  amount: number | null;
  weightKg: number | null;
  /** Sets in the plan for that exercise, if known. */
  sets: number | null;
  /** The plan's target for it, if known. */
  target: number | null;
}

export interface Stats {
  workoutDays: number;
  exercisesDone: number;
  /** Rough time trained: the planned minutes of every finished exercise. */
  minutes: number;
  /** Total weight lifted: weight × reps per set × sets, added up (kilograms). */
  volumeKg: number;
  /** Longest single pose hold (seconds) in yoga. */
  longestHoldSeconds: number;
  currentStreak: number;
  longestStreak: number;
  /** YYYY-MM-DD → how many exercises were finished that day. */
  countByDate: Record<string, number>;
}

const byId = new Map(EXERCISES.map((e) => [e.id, e]));

/** The longest run of weeks in a row with at least one workout. */
export function longestWeekStreak(dates: string[]): number {
  const weeks = [...new Set(dates.map((d) => toISODate(mondayOf(parseISODate(d)))))].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const w of weeks) {
    run = prev !== null && toISODate(addDays(parseISODate(prev), 7)) === w ? run + 1 : 1;
    best = Math.max(best, run);
    prev = w;
  }
  return best;
}

export function computeStats(logs: LogRow[], today: Date): Stats {
  const countByDate: Record<string, number> = {};
  let minutes = 0;
  let volumeKg = 0;
  let longestHoldSeconds = 0;

  for (const l of logs) {
    countByDate[l.date] = (countByDate[l.date] ?? 0) + 1;
    const ex = byId.get(l.exerciseId);
    if (!ex) continue;
    minutes += ex.durationMin;
    const amount = l.amount ?? l.target ?? 0;
    if (ex.unit === "reps" && l.weightKg && l.weightKg > 0) volumeKg += l.weightKg * amount * (l.sets ?? 2);
    if (ex.style === "yoga" && ex.unit === "seconds") longestHoldSeconds = Math.max(longestHoldSeconds, amount);
  }

  const dates = Object.keys(countByDate);
  const currentStreak = weekStreak(dates, today);
  return {
    workoutDays: dates.length,
    exercisesDone: logs.length,
    minutes,
    volumeKg: Math.round(volumeKg),
    longestHoldSeconds,
    currentStreak,
    longestStreak: Math.max(currentStreak, longestWeekStreak(dates)),
    countByDate,
  };
}

/** "45 min", "1 h 20 min", "3 h". */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/* ---------------- badges and the next milestone ---------------- */

export interface Badge {
  id: string;
  title: string;
  /** How to earn it. */
  hint: string;
  icon: IconName;
  earned: boolean;
}

export function badgesFor(s: Stats): Badge[] {
  return [
    { id: "first", title: "First workout", hint: "Finish one exercise", icon: "check", earned: s.workoutDays >= 1 },
    { id: "w5", title: "5 workouts", hint: "Train on 5 different days", icon: "dumbbell", earned: s.workoutDays >= 5 },
    { id: "w10", title: "10 workouts", hint: "Train on 10 different days", icon: "bolt", earned: s.workoutDays >= 10 },
    { id: "w25", title: "25 workouts", hint: "Train on 25 different days", icon: "star", earned: s.workoutDays >= 25 },
    { id: "s2", title: "2-week streak", hint: "Train 2 weeks in a row", icon: "flame", earned: s.longestStreak >= 2 },
    { id: "s4", title: "4-week streak", hint: "Train 4 weeks in a row", icon: "flame", earned: s.longestStreak >= 4 },
    { id: "s8", title: "8-week streak", hint: "Train 8 weeks in a row", icon: "flame", earned: s.longestStreak >= 8 },
    { id: "h1", title: "1 hour trained", hint: "60 minutes in total", icon: "clock", earned: s.minutes >= 60 },
    { id: "h5", title: "5 hours trained", hint: "300 minutes in total", icon: "timer", earned: s.minutes >= 300 },
  ];
}

const MILESTONES = [1, 5, 10, 25, 50, 100];

/** The next workout-count goal, how far away it is, and how full the progress bar is (0 to 1). */
export function nextMilestone(workoutDays: number): { target: number; remaining: number; fraction: number } | null {
  const target = MILESTONES.find((m) => m > workoutDays);
  if (target === undefined) return null;
  const previous = [...MILESTONES].reverse().find((m) => m <= workoutDays) ?? 0;
  return { target, remaining: target - workoutDays, fraction: (workoutDays - previous) / (target - previous) };
}

/* ---------------- month calendar (heat map) ---------------- */

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export type Level = 0 | 1 | 2 | 3;

/** How strongly to colour a day: none, a little, a good day, a big day. */
export const levelFor = (count: number): Level => (count <= 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3);

export interface DayCell {
  iso: string;
  day: number;
  count: number;
  level: Level;
}

export interface MonthGrid {
  label: string;
  /** Weeks starting on Monday; `null` = a blank cell before the 1st or after the last day. */
  weeks: (DayCell | null)[][];
  /** Days in this month with at least one finished exercise. */
  activeDays: number;
}

export function monthGrid(year: number, month0: number, counts: Record<string, number>): MonthGrid {
  const first = new Date(year, month0, 1);
  const lead = weekdayIndex(first);
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (DayCell | null)[] = Array(lead).fill(null);
  let activeDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISODate(new Date(year, month0, day));
    const count = counts[iso] ?? 0;
    if (count > 0) activeDays++;
    cells.push({ iso, day, count, level: levelFor(count) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (DayCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return { label: `${MONTH_NAMES[month0]} ${year}`, weeks, activeDays };
}

export interface YearMonth {
  year: number;
  month0: number;
}

/** Read "?month=2026-10". Anything odd, or a month in the future, means the current month. */
export function parseMonth(param: string | undefined, today: Date): YearMonth {
  const current = { year: today.getFullYear(), month0: today.getMonth() };
  const m = param?.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!m) return current;
  const picked = { year: Number(m[1]), month0: Number(m[2]) - 1 };
  const isFuture = picked.year * 12 + picked.month0 > current.year * 12 + current.month0;
  return picked.year < 2020 || isFuture ? current : picked;
}

export function shiftMonth(ym: YearMonth, delta: number): YearMonth {
  const total = ym.year * 12 + ym.month0 + delta;
  return { year: Math.floor(total / 12), month0: total % 12 };
}

export const monthParam = (ym: YearMonth): string => `${ym.year}-${String(ym.month0 + 1).padStart(2, "0")}`;
