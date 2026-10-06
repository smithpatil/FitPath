"use server";

import { revalidatePath } from "next/cache";
import { EXERCISES } from "@/data/exercises";
import { toISODate } from "@/lib/dates";
import { chooseSwap, exerciseMinutes, targetFor, usableFor } from "@/lib/planGenerator";
import { getOverload } from "@/lib/planStore";
import { getToday } from "@/lib/today.server";
import { getProfile } from "@/lib/profile";
import { parseAmount, parseWeight } from "@/lib/strength";
import { toKg } from "@/lib/units";
import { createClient } from "@/lib/supabase/server";

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  revalidatePath("/progress");
}

/** What the user says they actually did. Weight is in THEIR unit (kg or lb). */
export interface ResultInput {
  amount?: number | null;
  weight?: number | null;
}

/**
 * Set one plan item to done / not done and keep the workout log in step.
 * `wanted` = true/false sets it; undefined flips it.
 */
async function setItemDone(itemId: string, wanted?: boolean, result?: ResultInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !itemId) return;

  // Row-level security guarantees we can only find our own items.
  const { data: item } = await supabase.from("plan_items").select("id, exercise_id, done").eq("id", itemId).maybeSingle();
  if (!item) return;

  const nowDone = wanted ?? !item.done;
  if (nowDone === item.done) return; // already in that state: nothing to do (no duplicate logs)
  await supabase.from("plan_items").update({ done: nowDone, done_at: nowDone ? new Date().toISOString() : null }).eq("id", itemId);
  if (nowDone) {
    await supabase.from("workout_logs").insert({
      user_id: user.id,
      plan_item_id: itemId,
      exercise_id: item.exercise_id,
      completed_on: toISODate(await getToday()),
    });
    // The result is saved separately, so ticking still works if the Phase 12 database update is missing.
    if (result) await saveResult(supabase, itemId, result);
  } else {
    await supabase.from("workout_logs").delete().eq("plan_item_id", itemId);
  }
  refresh();
}

/** Store reps/seconds/minutes and the weight (converted to kg) on an item's log row. */
async function saveResult(supabase: Awaited<ReturnType<typeof createClient>>, itemId: string, result: ResultInput) {
  const profile = await getProfile(supabase);
  const amount = result.amount ?? null;
  const weightKg = result.weight == null || !profile ? null : toKg(result.weight, profile.units);
  if (amount !== null && (!Number.isInteger(amount) || amount < 1 || amount > 1000)) return "Please enter a whole number from 1 to 1000.";
  if (weightKg !== null && (weightKg <= 0 || weightKg > 500)) return "Please enter a realistic weight.";
  const { error } = await supabase.from("workout_logs").update({ amount_done: amount, weight_kg: weightKg }).eq("plan_item_id", itemId);
  if (error) {
    console.error("[log result]", error.message);
    return "We could not save that. (Has the Phase 12 database update been run?)";
  }
  return null;
}

/** "Mark as done" / "Undo" buttons. */
export async function toggleDone(formData: FormData) {
  await setItemDone(String(formData.get("itemId") ?? ""));
}

/** Workout mode: the last set of an exercise is finished, so tick it (never un-ticks) and save the numbers. */
export async function markDone(itemId: string, result?: ResultInput) {
  await setItemDone(itemId, true, result);
}

export interface LogState {
  error?: string;
  saved?: boolean;
}

/** "What did you do?" form on a finished exercise card. */
export async function logResult(_prev: LogState, formData: FormData): Promise<LogState> {
  const itemId = String(formData.get("itemId") ?? "");
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const weight = parseWeight(String(formData.get("weight") ?? ""));
  if (amount === "invalid") return { error: "Please enter a whole number from 1 to 1000." };
  if (weight === "invalid") return { error: "Please enter a weight above 0 (at most 500)." };

  const supabase = await createClient();
  const { data: log } = await supabase.from("workout_logs").select("id").eq("plan_item_id", itemId).maybeSingle();
  if (!log) return { error: "Tick the exercise as done first." };
  const problem = await saveResult(supabase, itemId, { amount, weight });
  if (problem) return { error: problem };
  refresh();
  return { saved: true };
}

export interface SwapState {
  error?: string;
}

/** "Swap exercise": replace with another one from the same equivalence class. */
export async function swapExercise(_prev: SwapState, formData: FormData): Promise<SwapState> {
  const itemId = String(formData.get("itemId") ?? "");
  const supabase = await createClient();
  const profile = await getProfile(supabase);
  if (!profile || !itemId) return { error: "Please log in again." };

  const { data: item } = await supabase.from("plan_items").select("id, plan_id, day, exercise_id, done").eq("id", itemId).maybeSingle();
  if (!item) return { error: "We could not find that exercise." };
  if (item.done) return { error: "You have already done this one. Tap Undo first if you want to swap it." };

  const current = EXERCISES.find((e) => e.id === item.exercise_id)!;
  const { data: dayRows } = await supabase.from("plan_items").select("exercise_id").eq("plan_id", item.plan_id).eq("day", item.day);
  const todayIds = (dayRows ?? []).map((r) => r.exercise_id);
  const todayMinutes = todayIds.reduce((s, id) => s + (EXERCISES.find((e) => e.id === id)?.durationMin ?? 0), 0);

  const replacement = chooseSwap(current, usableFor(profile), todayIds, todayMinutes, exerciseMinutes(profile.minutes));
  if (!replacement) return { error: "No other similar exercise fits your equipment, safety needs and time. Keep this one for now." };

  const { data: plan } = await supabase.from("plans").select("week_start").eq("id", item.plan_id).single();
  const { steps } = await getOverload(supabase, plan!.week_start);
  const { sets, reps } = targetFor(replacement, profile, steps);
  await supabase.from("plan_items").update({ exercise_id: replacement.id, sets, reps }).eq("id", itemId);
  refresh();
  return {};
}

const FEELINGS = ["easy", "right", "hard"] as const;

/** "How did this workout feel?" Saved per training day; it shapes NEXT week's numbers. */
export async function saveFeeling(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  const day = Number(formData.get("day"));
  const feeling = String(formData.get("feeling") ?? "");
  if (!planId || !Number.isInteger(day) || day < 0 || !FEELINGS.includes(feeling as (typeof FEELINGS)[number])) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Row-level security means we only find the plan if it is the user's own.
  const { data: plan } = await supabase.from("plans").select("week_start").eq("id", planId).maybeSingle();
  if (!plan) return;

  await supabase
    .from("workout_feedback")
    .upsert({ user_id: user.id, week_start: plan.week_start, day, feeling }, { onConflict: "user_id,week_start,day" });
  refresh();
  revalidatePath("/maths");
}
