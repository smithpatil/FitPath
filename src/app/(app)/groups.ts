import type { WeekItem } from "@/lib/planStore";

/** The distinct muscle groups in a day's exercises, in the order they appear. */
export function scheduleGroupsForDay(items: WeekItem[]): string[] {
  return [...new Set(items.map((i) => i.exercise.muscleGroup as string))];
}
