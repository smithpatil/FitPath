"use server";

import { redirect } from "next/navigation";
import { mondayOf, toISODate } from "@/lib/dates";
import { validateAnswers } from "@/lib/onboarding";
import { getToday } from "@/lib/today.server";
import { createClient } from "@/lib/supabase/server";

// Saves the onboarding answers to the user's profile, then goes to the dashboard.
// Returns an error message if something is wrong (on success it redirects).
export async function saveOnboarding(input: unknown): Promise<{ error: string }> {
  const result = validateAnswers(input); // never trust data sent from the browser
  if (!result.ok) return { error: result.error };
  const a = result.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const row = {
    id: user.id,
    goal: a.goal,
    level: a.level,
    days_per_week: a.days,
    minutes_per_session: a.minutes,
    equipment: a.equipment,
    limitations: a.limitations,
    onboarded_at: new Date().toISOString(),
  };
  let { error } = await supabase.from("profiles").upsert({ ...row, format: a.format });
  if (error && a.format !== "yoga") {
    // The "format" column needs the style database update. Gym and Strength can still be saved
    // without it (the style is worked out from the equipment), but Yoga cannot.
    ({ error } = await supabase.from("profiles").upsert(row));
  }
  if (error) {
    console.error("[onboarding]", error.message);
    return {
      error:
        a.format === "yoga"
          ? "We could not save Yoga yet. The database needs the style update (supabase/migrations/005_workout_style.sql)."
          : "We could not save your choices. Please try again.",
    };
  }
  // New answers mean a new plan: drop this week's plan so it is rebuilt from the maths.
  // (Past workout logs are kept, so streaks and progress are not lost.)
  await supabase.from("plans").delete().gte("week_start", toISODate(mondayOf(await getToday())));
  redirect("/dashboard");
}
