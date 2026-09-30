// Streak = how many weeks in a row you did at least one workout.
// Weeks (not days) are used because beginners have rest days on purpose.
// The current week counts if you have already trained; if not, it does not break the
// streak yet (you still have time), so we start counting from last week.
import { addDays, mondayOf, toISODate } from "./dates";

export function weekStreak(logDates: string[], today: Date): number {
  const weeks = new Set(logDates.map((s) => toISODate(mondayOf(new Date(s + "T00:00:00")))));
  let cursor = mondayOf(today);
  if (!weeks.has(toISODate(cursor))) cursor = addDays(cursor, -7);
  let streak = 0;
  while (weeks.has(toISODate(cursor))) {
    streak++;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

/** How many different days this week have at least one logged exercise. */
export function workoutDaysInWeek(logDates: string[], today: Date): number {
  const start = toISODate(mondayOf(today));
  const end = toISODate(addDays(mondayOf(today), 6));
  return new Set(logDates.filter((d) => d >= start && d <= end)).size;
}
