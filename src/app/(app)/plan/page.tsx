import Link from "next/link";
import ExerciseCard from "@/components/ExerciseCard";
import FeedbackCard from "@/components/FeedbackCard";
import { WEEKDAYS } from "@/lib/dates";
import { groupTitle } from "@/lib/labels";
import { ROUTINE_MINUTES, exerciseMinutes, usableFor, weekdayForSlot } from "@/lib/planGenerator";
import { cooldownFor, totalSeconds, warmupFor } from "@/lib/routine";
import type { RoutineMove } from "@/data/warmups";
import { getCurrentWeek } from "@/lib/planStore";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { EXERCISES } from "@/data/exercises";
import { scheduleGroupsForDay } from "../groups";

export const metadata = { title: "Your plan — FitPath" };

export default async function PlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = (await getProfile(supabase))!;
  const week = await getCurrentWeek(supabase, user!.id, profile);
  const daysUsed = week.days.length;
  const usableCount = usableFor(profile).length;
  const warmup = warmupFor(profile);
  const cooldown = cooldownFor(profile);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Your weekly plan</h1>
        <p className="mt-2 text-muted">
          Week {week.weekIndex + 1} of your plan. Each week the numbers go up a little, so you keep improving. After finishing a
          workout day, tell us how it felt: your answers decide how fast next week&apos;s numbers rise.
        </p>
      </header>

      <section aria-labelledby="words" className="rounded-2xl bg-accent-soft p-6">
        <h2 id="words" className="text-xl font-semibold text-accent-dark">Quick word guide</h2>
        <ul className="mt-2 space-y-1 text-base">
          <li><strong>Rep</strong> (repetition): doing the movement once.</li>
          <li><strong>Set</strong>: a group of reps. &quot;2 sets of 8&quot; means 8 reps, a short rest, then 8 more.</li>
          <li><strong>Seconds</strong>: for some moves you hold a position instead of counting reps.</li>
        </ul>
        <p className="mt-3 text-base">Move slowly, breathe normally, and stop if anything hurts.</p>
      </section>

      {daysUsed === 0 ? (
        <p className="text-muted">We could not build a plan from your answers. Try changing your equipment or limits in Settings.</p>
      ) : (
        week.days.map((d) => (
          <section key={d.slot} aria-labelledby={`day-${d.slot}`}>
            <h2 id={`day-${d.slot}`} className="text-2xl font-bold">
              {WEEKDAYS[weekdayForSlot(daysUsed, d.slot)]}
            </h2>
            <p className="mt-1 text-muted">
              {groupTitle(scheduleGroupsForDay(d.items))} · about {d.items.reduce((s, i) => s + i.exercise.durationMin, 0) + ROUTINE_MINUTES}{" "}
              minutes including warm-up and cool-down (your limit is {profile.minutes} minutes for each workout day)
            </p>
            {d.items.some((i) => !i.done) && (
              <p className="mt-2">
                <Link href={`/workout?day=${d.slot}`} className="font-semibold text-accent underline">
                  Start this workout in workout mode →
                </Link>
              </p>
            )}
            {d.items.reduce((s, i) => s + i.exercise.durationMin, 0) < exerciseMinutes(profile.minutes) * 0.7 && (
              <p className="mt-1 text-base text-muted">
                This workout is shorter than your limit because your equipment and safety answers leave fewer moves to choose from.
              </p>
            )}
            <RoutineBox title="Warm-up first" moves={warmup} />
            <ul className="mt-5 space-y-4">
              {d.items.map((item) => (
                <ExerciseCard key={item.id} item={item} />
              ))}
            </ul>
            <RoutineBox title="Then cool down" moves={cooldown} />
            {d.items.length > 0 && d.items.every((i) => i.done) && (
              <FeedbackCard planId={week.planId} day={d.slot} feeling={d.feeling} />
            )}
          </section>
        ))
      )}

      <section aria-labelledby="how" className="rounded-2xl border-2 border-gray-200 p-6">
        <h2 id="how" className="text-xl font-semibold">How was this plan made?</h2>
        <p className="mt-2 text-muted">
          Out of {EXERCISES.length} exercises, {usableCount} suit your equipment and safety answers. Muscles that work together are placed on
          different days so they can rest. Each day is filled with the most useful exercises that fit in your {profile.minutes} minutes.
        </p>
        <p className="mt-3">
          <Link href="/maths" className="font-semibold text-accent underline">See the maths behind it</Link>
        </p>
      </section>
    </div>
  );
}

/** Warm-up / cool-down summary for one day. */
function RoutineBox({ title, moves }: { title: string; moves: RoutineMove[] }) {
  return (
    <div className="mt-5 rounded-2xl bg-accent-soft px-5 py-4">
      <p className="font-semibold text-accent-dark">
        {title} · about {Math.round(totalSeconds(moves) / 60)} minutes
      </p>
      <p className="mt-1 text-base">{moves.map((m) => `${m.name} (${m.seconds} s)`).join(" · ")}</p>
    </div>
  );
}
