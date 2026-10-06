import Link from "next/link";
import { WEEKDAYS, weekdayIndex } from "@/lib/dates";
import { describeTarget, groupTitle } from "@/lib/labels";
import { getCurrentWeek } from "@/lib/planStore";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getToday } from "@/lib/today.server";
import { cooldownFor, warmupFor } from "@/lib/routine";
import { describeResult, isWeighted, suggestionFor } from "@/lib/strength";
import { restSeconds } from "@/lib/workoutMode";
import { scheduleGroupsForDay } from "../groups";
import WorkoutMode, { type WorkoutItem } from "./WorkoutMode";

export const metadata = { title: "Workout mode — FitPath" };

export default async function WorkoutPage({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = (await getProfile(supabase))!;
  const week = await getCurrentWeek(supabase, user!.id, profile);
  const { day } = await searchParams;
  const todayWeekday = weekdayIndex(await getToday());

  // The day asked for in the link, else today's workout, else the first unfinished one.
  const chosen =
    week.days.find((d) => String(d.slot) === day) ??
    week.days.find((d) => d.weekday === todayWeekday) ??
    week.days.find((d) => d.items.some((i) => !i.done));

  if (!chosen) {
    return (
      <section>
        <h1 className="text-3xl font-bold">Workout mode</h1>
        <p className="mt-4 text-muted">There is no workout to do right now. Every workout this week is done. Great job!</p>
        <p className="mt-6">
          <Link href="/dashboard" className="font-semibold text-accent underline">
            Back to Today
          </Link>
        </p>
      </section>
    );
  }

  const items: WorkoutItem[] = chosen.items.map((i) => ({
    id: i.id,
    name: i.exercise.name,
    howTo: i.exercise.howTo,
    sets: i.sets,
    reps: i.reps,
    unit: i.exercise.unit,
    target: describeTarget(i.sets, i.reps, i.exercise.unit),
    done: i.done,
    weighted: isWeighted(i.exercise),
    lastText: i.last ? describeResult(i.last, i.exercise.unit, profile.units) : "",
    suggestion: isWeighted(i.exercise) ? suggestionFor(i.last, profile.units) : null,
  }));

  return (
    <WorkoutMode
      items={items}
      restSecs={restSeconds(profile.level)}
      daySlot={chosen.slot}
      title={`${WEEKDAYS[chosen.weekday]}: ${groupTitle(scheduleGroupsForDay(chosen.items))}`}
      warmup={warmupFor(profile)}
      cooldown={cooldownFor(profile)}
      units={profile.units}
    />
  );
}
