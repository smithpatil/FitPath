// Small date helpers. Weeks start on Monday. Dates are handled as "YYYY-MM-DD" text
// (the server's local calendar day), which is simple and matches Postgres `date` columns.

export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Monday of the week containing d. */
export function mondayOf(d: Date): Date {
  return addDays(d, -weekdayIndex(d));
}

/** 0 = Monday ... 6 = Sunday. */
export const weekdayIndex = (d: Date): number => (d.getDay() + 6) % 7;

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Whole weeks from one Monday ("YYYY-MM-DD") to a later one. */
export function weeksBetween(firstWeekStart: string, weekStart: string): number {
  const ms = parseISODate(weekStart).getTime() - parseISODate(firstWeekStart).getTime();
  return Math.max(0, Math.round(ms / (7 * 24 * 60 * 60 * 1000)));
}
