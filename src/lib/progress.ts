// Turns the workout log into numbers for the progress chart.
import { addDays, mondayOf, toISODate } from "./dates";

export interface WeekCount {
  /** Monday of the week, "YYYY-MM-DD". */
  weekStart: string;
  /** Short label such as "28 Sep". */
  label: string;
  /** Workout days completed that week (a day counts once, however many exercises were ticked). */
  count: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The last `weeks` weeks (oldest first, ending with the current week). */
export function weeklyCounts(logDates: string[], today: Date, weeks = 8): WeekCount[] {
  const thisMonday = mondayOf(today);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(thisMonday, -7 * (weeks - 1 - i));
    const from = toISODate(start);
    const to = toISODate(addDays(start, 6));
    const days = new Set(logDates.filter((d) => d >= from && d <= to));
    return { weekStart: from, label: `${start.getDate()} ${MONTHS[start.getMonth()]}`, count: days.size };
  });
}
