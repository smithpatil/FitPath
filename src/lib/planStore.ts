// Database side of plans: create this week's plan if needed, and load it.
import type { SupabaseClient } from "@supabase/supabase-js";
import { EXERCISES } from "../data/exercises";
import { mondayOf, toISODate, weeksBetween } from "./dates";
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
}

export interface Week {
  planId: string;
  weekStart: string;
  weekIndex: number;
  days: WeekDay[];
}

/** How many weeks since the user's very first plan (this is "n" in W(n) = W(0) + n·d). */
export async function getWeekIndex(supabase: SupabaseClient, weekStart: string): Promise<number> {
  const { data } = await supabase.from("plans").select("week_start").order("week_start").limit(1).maybeSingle();
  return data ? weeksBetween(data.week_start, weekStart) : 0;
}

/** Load this week's plan, generating and saving it first if it does not exist yet. */
export async function getCurrentWeek(supabase: SupabaseClient, userId: string, profile: Profile): Promise<Week> {
  const weekStart = toISODate(mondayOf(await getToday()));
  let { data: plan } = await supabase.from("plans").select("id").eq("week_start", weekStart).maybeSingle();

  if (!plan) {
    const weekIndex = await getWeekIndex(supabase, weekStart);
    const generated = generatePlan(profile, weekIndex);
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

  const byDay = new Map<number, WeekItem[]>();
  for (const r of rows ?? []) {
    const exercise = EXERCISES.find((e) => e.id === r.exercise_id);
    if (!exercise) continue;
    const item: WeekItem = { id: r.id, day: r.day, exercise, sets: r.sets, reps: r.reps, done: r.done };
    byDay.set(r.day, [...(byDay.get(r.day) ?? []), item]);
  }
  const days = [...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([slot, items]) => ({ slot, items }));
  return { planId: plan!.id, weekStart, weekIndex: await getWeekIndex(supabase, weekStart), days };
}

/** Dates (YYYY-MM-DD) of recent completed exercises, newest first. */
export async function getLogDates(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase.from("workout_logs").select("completed_on").order("completed_on", { ascending: false }).limit(500);
  return (data ?? []).map((r) => r.completed_on);
}
