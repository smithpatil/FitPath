import type { SupabaseClient } from "@supabase/supabase-js";
import { deriveFormat, type Format } from "./formats";
import type { Answers } from "./onboarding";

/** The user's saved profile, or null if they have not finished onboarding. */
export interface Profile extends Answers {
  format: Format;
  units: "kg" | "lb";
}

export async function getProfile(supabase: SupabaseClient): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").maybeSingle();
  if (!data || !data.onboarded_at) return null;
  return {
    // `format` only exists after the style database update; older rows work it out from the equipment.
    format: (data.format as Format | null) ?? deriveFormat(data.equipment),
    goal: data.goal,
    level: data.level,
    days: data.days_per_week,
    minutes: data.minutes_per_session,
    equipment: data.equipment,
    limitations: data.limitations,
    units: data.units,
  };
}
