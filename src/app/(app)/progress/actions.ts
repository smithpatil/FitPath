"use server";

import { revalidatePath } from "next/cache";
import { toISODate } from "@/lib/dates";
import { getProfile } from "@/lib/profile";
import { getToday } from "@/lib/today.server";
import { createClient } from "@/lib/supabase/server";
import { isPlausibleKg, toKg } from "@/lib/units";

export interface WeightState {
  error?: string;
  saved?: boolean;
}

/** Save (or replace) the body weight for one date. Stored in kg. */
export async function addBodyWeight(_prev: WeightState, formData: FormData): Promise<WeightState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getProfile(supabase);
  if (!user || !profile) return { error: "Please log in again." };

  const value = Number(String(formData.get("weight") ?? "").replace(",", "."));
  const date = String(formData.get("date") ?? "");
  const kg = toKg(value, profile.units);

  if (!Number.isFinite(value) || !isPlausibleKg(kg)) {
    return { error: `Please enter a real body weight in ${profile.units}.` };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || date > toISODate(await getToday())) {
    return { error: "Please choose today or an earlier date." };
  }

  const { error } = await supabase
    .from("body_weights")
    .upsert({ user_id: user.id, measured_on: date, kg }, { onConflict: "user_id,measured_on" });
  if (error) {
    console.error("[body_weights]", error.message);
    return { error: "We could not save that. Please try again." };
  }
  revalidatePath("/progress");
  return { saved: true };
}

export async function deleteBodyWeight(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("body_weights").delete().eq("id", id); // row-level security: only your own
  revalidatePath("/progress");
}
