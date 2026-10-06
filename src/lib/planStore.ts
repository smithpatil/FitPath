// Database side of plans: create this week's plan if needed, and load it.
import type { SupabaseClient } from "@supabase/supabase-js";
import { EXERCISES } from "../data/exercises";
import { mondayOf, toISODate, weeksBetween } from "./dates";
import { multipliersFromFeedback, stepSum, type Feeling } from "./math/recurrence";
import { generatePlan, weekdayForSlot } from "./planGenerator";
import type { LoggedResult } from "./strength";
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
  /** What was logged for THIS item (only once it is done). */
  log?: { amount: number | null; weightKg: number | null };
  /** The most recent earlier result for the same exercise, if any. */
  last?: LoggedResult;
}

export interface WeekDay {
  slot: number;
  /** Which day of the week this workout is on (0 = Monday). Moves when a missed workout is rescheduled. */
  weekday: number;
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

  // `weekday` only exists after the Phase 13 database update; fall back quietly if it is missing.
  const columns = "id, day, position, exercise_id, sets, reps, done";
  const withWeekday = await supabase.from("plan_items").select(`${columns}, weekday`).eq("plan_id", plan!.id).order("day").order("position");
  const rows: { id: string; day: number; exercise_id: string; sets: number; reps: number; done: boolean; weekday?: number | null }[] | null = withWeekday.error
    ? (await supabase.from("plan_items").select(columns).eq("plan_id", plan!.id).order("day").order("position")).data
    : withWeekday.data;

  const { data: feedback } = await supabase.from("workout_feedback").select("day, feeling").eq("week_start", weekStart);
  const feelingOf = new Map((feedback ?? []).map((f) => [f.day as number, f.feeling as Feeling]));

  // Logged results: this week's items get their own log; every item gets the latest earlier result.
  const results = await getLoggedResults(supabase);
  const ownLog = new Map(results.filter((l) => l.planItemId).map((l) => [l.planItemId!, l]));

  const byDay = new Map<number, WeekItem[]>();
  for (const r of rows ?? []) {
    const exercise = EXERCISES.find((e) => e.id === r.exercise_id);
    if (!exercise) continue;
    const own = ownLog.get(r.id);
    const last = results.find((l) => l.exerciseId === r.exercise_id && l.planItemId !== r.id && (l.amount !== null || l.weightKg !== null));
    const item: WeekItem = {
      id: r.id,
      day: r.day,
      exercise,
      sets: r.sets,
      reps: r.reps,
      done: r.done,
      log: own ? { amount: own.amount, weightKg: own.weightKg } : undefined,
      last,
    };
    byDay.set(r.day, [...(byDay.get(r.day) ?? []), item]);
  }
  const weekdayOfSlot = new Map<number, number>();
  for (const r of rows ?? []) if (r.weekday != null) weekdayOfSlot.set(r.day, r.weekday);
  const daysUsed = byDay.size;
  const days = [...byDay.entries()]
    .map(([slot, items]) => ({
      slot,
      weekday: weekdayOfSlot.get(slot) ?? weekdayForSlot(daysUsed, slot),
      items,
      feeling: feelingOf.get(slot),
    }))
    .sort((a, b) => a.weekday - b.weekday || a.slot - b.slot);
  const overload = await getOverload(supabase, weekStart);
  return { planId: plan!.id, weekStart, ...overload, days };
}

/** Dates (YYYY-MM-DD) of recent completed exercises, newest first. */
export async function getLogDates(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase.from("workout_logs").select("completed_on").order("completed_on", { ascending: false }).limit(500);
  return (data ?? []).map((r) => r.completed_on);
}

/**
 * Recent logged results, newest first, with the target of the day they were logged on.
 * If the Phase 12 database update has not been run yet, this quietly returns [].
 */
export async function getLoggedResults(supabase: SupabaseClient): Promise<(LoggedResult & { planItemId: string | null })[]> {
  const { data, error } = await supabase
    .from("workout_logs")
    .select("plan_item_id, exercise_id, amount_done, weight_kg, completed_on, plan_items(reps)")
    .order("completed_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);
  if (error || !data) return [];
  return data.map((r) => {
    const planItem = r.plan_items as { reps: number } | { reps: number }[] | null;
    const target = Array.isArray(planItem) ? (planItem[0]?.reps ?? null) : (planItem?.reps ?? null);
    return {
      planItemId: r.plan_item_id,
      exerciseId: r.exercise_id,
      amount: r.amount_done,
      weightKg: r.weight_kg === null ? null : Number(r.weight_kg),
      target,
      date: r.completed_on,
    };
  });
}
