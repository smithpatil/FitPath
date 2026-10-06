"use server";

import { revalidatePath } from "next/cache";
import { EXERCISES } from "@/data/exercises";
import { toISODate } from "@/lib/dates";
import { chooseSwap, targetFor, usableFor } from "@/lib/planGenerator";
import { getOverload } from "@/lib/planStore";
import { getToday } from "@/lib/today.server";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  revalidatePath("/progress");
}

/**
 * Set one plan item to done / not done and keep the workout log in step.
 * `wanted` = true/false sets it; undefined flips it.
 */
async function setItemDone(itemId: string, wanted?: boolean) {
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
  } else {
    await supabase.from("workout_logs").delete().eq("plan_item_id", itemId);
  }
  refresh();
}

/** "Mark as done" / "Undo" buttons. */
export async function toggleDone(formData: FormData) {
  await setItemDone(String(formData.get("itemId") ?? ""));
}

/** Workout mode: the last set of an exercise is finished, so tick it (never un-ticks). */
export async function markDone(itemId: string) {
  await setItemDone(itemId, true);
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

  const replacement = chooseSwap(current, usableFor(profile), todayIds, todayMinutes, profile.minutes);
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
