// Database side of plans: create this week's plan if needed, and load it.
import type { SupabaseClient } from "@supabase/supabase-js";
import { EXERCISES } from "../data/exercises";
import { mondayOf, toISODate, weeksBetween } from "./dates";
import { multipliersFromFeedback, stepSum, type Feeling } from "./math/recurrence";
import { generatePlan } from "./planGenerator";
import { getToday } from "./today.server";
import type { Profile } from "./profile";
import type { Exercise } from "./math/types";

export interface WeekItem {
  id: string;
  day: number;
  exercise: Exercise;
  sets: number;
  reps: number;
  done: boolean;
}

export interface WeekDay {
  slot: number;
  items: WeekItem[];
  /** How the user said this workout felt (if they answered). */
  feeling?: Feeling;
}

export interface Week {
  planId: string;
  weekStart: string;
  /** Weeks since the user's very first plan. */
  weekIndex: number;
  /** m₁..mₙ from past feedback (adaptive overload). */
  multipliers: number[];
  /** S(n) = m₁ + … + mₙ: how many "normal steps" of overload to apply this week. */
  steps: number;
  days: WeekDay[];
}

export interface Overload {
  weekIndex: number;
  multipliers: number[];
  steps: number;
}

/**
 * Where the user is in their progression for the week starting `weekStart`:
 * n = weeks since their first plan, and the multipliers m₁..mₙ from earlier weeks' feedback.
 */
export async function getOverload(supabase: SupabaseClient, weekStart: string): Promise<Overload> {
  const { data: first } = await supabase.from("plans").select("week_start").order("week_start").limit(1).maybeSingle();
  const firstWeek = first?.week_start ?? weekStart;
  const weekIndex = weeksBetween(firstWeek, weekStart);

  const { data: rows } = await supabase.from("workout_feedback").select("week_start, feeling").lt("week_start", weekStart);
  const feelingsByWeek: Feeling[][] = [];
  for (const r of rows ?? []) {
    const i = weeksBetween(firstWeek, r.week_start);
    (feelingsByWeek[i] ??= []).push(r.feeling as Feeling);
  }
  const multipliers = multipliersFromFeedback(feelingsByWeek, weekIndex);
  return { weekIndex, multipliers, steps: stepSum(multipliers) };
}

/** Load this week's plan, generating and saving it first if it does not exist yet. */
export async function getCurrentWeek(supabase: SupabaseClient, userId: string, profile: Profile): Promise<Week> {
  const weekStart = toISODate(mondayOf(await getToday()));
  let { data: plan } = await supabase.from("plans").select("id").eq("week_start", weekStart).maybeSingle();

  if (!plan) {
    // Reps/seconds grow by the ADAPTIVE overload: W(n) = W(0) + d·S(n).
    const { steps } = await getOverload(supabase, weekStart);
    const generated = generatePlan(profile, steps);
    // If two requests race, the unique (user, week) rule keeps just one plan.
    await supabase.from("plans").upsert({ user_id: userId, week_start: weekStart }, { onConflict: "user_id,week_start", ignoreDuplicates: true });
    ({ data: plan } = await supabase.from("plans").select("id").eq("week_start", weekStart).single());

    const { count } = await supabase.from("plan_items").select("id", { count: "exact", head: true }).eq("plan_id", plan!.id);
    if (!count) {
      const rows = generated.days.flatMap((d) =>
        d.items.map((it, position) => ({
          plan_id: plan!.id,
          user_id: userId,
          day: d.slot,
          position,
          exercise_id: it.exerciseId,
          sets: it.sets,
          reps: it.reps,
        })),
      );
      if (rows.length) await supabase.from("plan_items").insert(rows);
    }
  }

  const { data: rows } = await supabase
    .from("plan_items")
    .select("id, day, position, exercise_id, sets, reps, done")
    .eq("plan_id", plan!.id)
    .order("day")
    .order("position");

  const { data: feedback } = await supabase.from("workout_feedback").select("day, feeling").eq("week_start", weekStart);
  const feelingOf = new Map((feedback ?? []).map((f) => [f.day as number, f.feeling as Feeling]));

  const byDay = new Map<number, WeekItem[]>();
  for (const r of rows ?? []) {
    const exercise = EXERCISES.find((e) => e.id === r.exercise_id);
    if (!exercise) continue;
    const item: WeekItem = { id: r.id, day: r.day, exercise, sets: r.sets, reps: r.reps, done: r.done };
    byDay.set(r.day, [...(byDay.get(r.day) ?? []), item]);
  }
  const days = [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([slot, items]) => ({ slot, items, feeling: feelingOf.get(slot) }));
  const overload = await getOverload(supabase, weekStart);
  return { planId: plan!.id, weekStart, ...overload, days };
}

/** Dates (YYYY-MM-DD) of recent completed exercises, newest first. */
export async function getLogDates(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase.from("workout_logs").select("completed_on").order("completed_on", { ascending: false }).limit(500);
  return (data ?? []).map((r) => r.completed_on);
}
