// The plan generator. It contains NO guessing and NO AI: it just wires the maths modules together.
//
//   1. Sets       usable = (equipment ∩ requirements) − excluded
//   2. Logic      excluded = exercises where a safety rule fires
//   3. Graph      colour/schedule the muscle groups onto training days
//   4. Knapsack   pick the exercises for each day that maximise benefit within the time limit
//   5. Recurrence sets/reps grow week by week: W(n) = W(0) + n·d
//   6. Relations  "swap" = another exercise in the same equivalence class

import { EXERCISES } from "../data/exercises";
import { overloadClosedForm } from "./math/recurrence";
import { excludedExerciseIds } from "./math/logic";
import { MUSCLE_CONFLICTS, MUSCLE_GROUPS, scheduleGroups, type Graph } from "./math/graphColouring";
import { knapsack } from "./math/knapsack";
import { swapOptions } from "./math/relations";
import { usableExercises } from "./math/sets";
import type { Exercise } from "./math/types";
import type { Answers } from "./onboarding";

export interface PlannedItem {
  exerciseId: string;
  sets: number;
  reps: number; // reps, or seconds for timed exercises
}

export interface PlannedDay {
  slot: number; // 0-based training day
  groups: string[];
  items: PlannedItem[];
  totalMin: number;
  benefit: number;
}

export interface GeneratedPlan {
  days: PlannedDay[];
  /** Days actually used (can be fewer than requested if too few muscle groups are usable). */
  daysUsed: number;
}

/** Step 1 + 2: the exercises this person may do. */
export function usableFor(profile: Answers, all: Exercise[] = EXERCISES): Exercise[] {
  const excluded = excludedExerciseIds(all, profile);
  return usableExercises(all, profile.equipment, excluded);
}

/** Which weekdays (0 = Mon) to train on, spread out to leave rest days. */
const WEEKDAY_PATTERN: Record<number, number[]> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
};
export const weekdayForSlot = (daysUsed: number, slot: number): number =>
  (WEEKDAY_PATTERN[daysUsed] ?? WEEKDAY_PATTERN[6])[slot];

/**
 * Step 5: sets and reps after `steps` overload steps: W = W(0) + steps·d (with a sensible cap).
 * steps = S(n) = m₁ + … + mₙ from the adaptive overload (equals n when every week felt "just right").
 */
export function targetFor(ex: Exercise, profile: Pick<Answers, "goal" | "level">, steps: number) {
  // Cardio is one continuous block of minutes; its length stays fixed so the day's time budget holds.
  if (ex.unit === "minutes") return { sets: 1, reps: ex.durationMin };
  const sets = profile.level === "beginner" ? 2 : 3;
  if (ex.unit === "seconds") {
    const w0 = profile.level === "beginner" ? 20 : 30;
    return { sets, reps: Math.min(overloadClosedForm(w0, 5, steps), 60) };
  }
  const w0 = profile.goal === "lose_weight" ? 12 : profile.goal === "build_strength" ? 8 : 10;
  return { sets, reps: Math.min(overloadClosedForm(w0, 1, steps), w0 + 6) };
}

/** Every workout day starts with a 3-minute warm-up and ends with a 2-minute cool-down. */
export const ROUTINE_MINUTES = 5;

/** Minutes left for the main exercises (this is the knapsack's capacity). */
export const exerciseMinutes = (minutes: number): number => Math.max(0, minutes - ROUTINE_MINUTES);

/** Best exercise of a group: highest benefit, then shorter, then by id (so results never wobble). */
const bestOf = (list: Exercise[]) =>
  [...list].sort((a, b) => b.benefit - a.benefit || a.durationMin - b.durationMin || a.id.localeCompare(b.id))[0];

export function generatePlan(profile: Answers, steps: number, all: Exercise[] = EXERCISES): GeneratedPlan {
  const usable = usableFor(profile, all);

  // Only muscle groups that have at least one usable exercise take part in the schedule.
  const groups = MUSCLE_GROUPS.filter((g) => usable.some((e) => e.muscleGroup === g));
  const graph: Graph = {
    vertices: groups,
    edges: MUSCLE_CONFLICTS.filter(([a, b]) => groups.includes(a as never) && groups.includes(b as never)),
  };
  const daysUsed = Math.min(profile.days, groups.length);
  if (daysUsed === 0) return { days: [], daysUsed: 0 };

  // Step 3: muscle groups → days.
  const schedule = scheduleGroups(graph, daysUsed);

  const days: PlannedDay[] = schedule.groups.map((dayGroups, slot) => {
    const candidates = usable.filter((e) => dayGroups.includes(e.muscleGroup));

    // Make sure every muscle group of the day appears: reserve its best exercise first,
    // then let the knapsack fill the remaining minutes with the most valuable extras.
    const reserved = dayGroups.map((g) => bestOf(candidates.filter((e) => e.muscleGroup === g)));
    const reservedMin = reserved.reduce((s, e) => s + e.durationMin, 0);
    const toItem = (e: Exercise) => ({ id: e.id, weight: e.durationMin, value: e.benefit });

    const capacity = exerciseMinutes(profile.minutes); // warm-up and cool-down come out of the same minutes
    let chosenIds: string[];
    if (reservedMin <= capacity) {
      const rest = candidates.filter((e) => !reserved.includes(e));
      const extra = knapsack(rest.map(toItem), capacity - reservedMin);
      chosenIds = [...reserved.map((e) => e.id), ...extra.chosenIds];
    } else {
      // Not enough time for one of each: pick the best subset of the reserved ones.
      chosenIds = knapsack(reserved.map(toItem), capacity).chosenIds;
    }

    const chosen = chosenIds
      .map((id) => candidates.find((e) => e.id === id)!)
      .sort((a, b) => b.benefit - a.benefit || a.id.localeCompare(b.id));

    return {
      slot,
      groups: dayGroups,
      items: chosen.map((e) => ({ exerciseId: e.id, ...targetFor(e, profile, steps) })),
      totalMin: chosen.reduce((s, e) => s + e.durationMin, 0),
      benefit: chosen.reduce((s, e) => s + e.benefit, 0),
    };
  });

  fillSpareTime(days, usable, graph, profile, steps);
  return { days, daysUsed };
}

/**
 * The minutes you choose are for EACH workout day. If a day still has spare minutes after its
 * own muscle groups are done, add a second helping from another group, but only a group that
 *   - is not already trained on the day before, the same day, or the day after, and
 *   - has no conflict edge (graph colouring) with any group on those days.
 * The same knapsack then picks the most valuable extras that fit the spare minutes.
 * An exercise can appear on two different days of the week (never twice on one day): with a long
 * session and few exercises, repeats are unavoidable (pigeonhole principle).
 */
function fillSpareTime(
  days: PlannedDay[],
  usable: Exercise[],
  graph: Graph,
  profile: Answers,
  steps: number,
) {
  const conflicts = (a: string, b: string) =>
    graph.edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

  for (const day of days) {
    const spare = exerciseMinutes(profile.minutes) - day.totalMin;
    if (spare <= 0) continue;
    const nearGroups = days.filter((d) => Math.abs(d.slot - day.slot) <= 1).flatMap((d) => d.groups);
    const eligible = usable.filter(
      (e) => !nearGroups.includes(e.muscleGroup) && !nearGroups.some((g) => conflicts(g, e.muscleGroup)),
    );
    // The extra groups must not conflict with EACH OTHER either: take the most valuable
    // eligible groups first and skip any that clash with one already taken.
    const groupValue = (g: string) => eligible.filter((e) => e.muscleGroup === g).reduce((s, e) => s + e.benefit, 0);
    const eligibleGroups = [...new Set(eligible.map((e) => e.muscleGroup as string))].sort(
      (a, b) => groupValue(b) - groupValue(a) || a.localeCompare(b),
    );
    const takenGroups: string[] = [];
    for (const g of eligibleGroups) if (!takenGroups.some((t) => conflicts(t, g))) takenGroups.push(g);
    const extras = eligible.filter((e) => takenGroups.includes(e.muscleGroup));
    const pick = knapsack(
      extras.map((e) => ({ id: e.id, weight: e.durationMin, value: e.benefit })),
      spare,
    );
    if (pick.chosenIds.length === 0) continue;

    const added = extras.filter((e) => pick.chosenIds.includes(e.id));
    const all = [...day.items.map((i) => usable.find((e) => e.id === i.exerciseId)!), ...added].sort(
      (a, b) => b.benefit - a.benefit || a.id.localeCompare(b.id),
    );
    day.items = all.map((e) => ({ exerciseId: e.id, ...targetFor(e, profile, steps) }));
    day.groups = [...new Set([...day.groups, ...added.map((e) => e.muscleGroup as string)])];
    day.totalMin = all.reduce((s, e) => s + e.durationMin, 0);
    day.benefit = all.reduce((s, e) => s + e.benefit, 0);
  }
}

/**
 * Step 6: pick a replacement for `current` from its equivalence class.
 * It must be usable, not already in today's workout, and still fit in the time limit.
 * Returns null if there is no suitable replacement.
 */
export function chooseSwap(
  current: Exercise,
  usable: Exercise[],
  todayIds: string[],
  todayMinutes: number,
  capacity: number,
): Exercise | null {
  const options = swapOptions(current, usable).filter(
    (o) => !todayIds.includes(o.id) && todayMinutes - current.durationMin + o.durationMin <= capacity,
  );
  if (options.length === 0) return null;
  return [...options].sort((a, b) => b.benefit - a.benefit || a.id.localeCompare(b.id))[0];
}
