"use server";

import { revalidatePath } from "next/cache";
import { EXERCISES } from "@/data/exercises";
import { toISODate } from "@/lib/dates";
import { chooseSwap, targetFor, usableFor } from "@/lib/planGenerator";
import { getWeekIndex } from "@/lib/planStore";
import { getToday } from "@/lib/today.server";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  revalidatePath("/progress");
}

/** "Mark as done" / "Undo": flips the tick and keeps the workout log in step. */
export async function toggleDone(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !itemId) return;

  // Row-level security guarantees we can only find our own items.
  const { data: item } = await supabase.from("plan_items").select("id, exercise_id, done").eq("id", itemId).maybeSingle();
  if (!item) return;

  const nowDone = !item.done;
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
  const weekIndex = await getWeekIndex(supabase, plan!.week_start);
  const { sets, reps } = targetFor(replacement, profile, weekIndex);
  await supabase.from("plan_items").update({ exercise_id: replacement.id, sets, reps }).eq("id", itemId);
  refresh();
  return {};
}
