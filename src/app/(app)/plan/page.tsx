import ExerciseCard from "@/components/ExerciseCard";
import FeedbackCard from "@/components/FeedbackCard";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import DayHeader from "@/components/plan/DayHeader";
import RescheduleCard from "@/components/RescheduleCard";
import { WEEKDAYS, weekdayIndex } from "@/lib/dates";
import { getToday } from "@/lib/today.server";
import { groupTitle } from "@/lib/labels";
import { ROUTINE_MINUTES, exerciseMinutes, usableFor } from "@/lib/planGenerator";
import { cooldownFor, totalSeconds, warmupFor } from "@/lib/routine";
import type { RoutineMove } from "@/data/warmups";
import { getCurrentWeek } from "@/lib/planStore";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { EXERCISES } from "@/data/exercises";
import { FORMAT_INFO, fitsFormat, formatOf } from "@/lib/formats";
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
  const todayWeekday = weekdayIndex(await getToday());
  const missed = week.days.filter((d) => d.weekday < todayWeekday && !d.items.some((i) => i.done));
  const usableCount = usableFor(profile).length;
  const warmup = warmupFor(profile);
  const cooldown = cooldownFor(profile);

  return (
    <div className="space-y-10">
      <PageHeader icon="list" eyebrow={`Week ${week.weekIndex + 1}`} title="Your weekly plan">
        Each week the numbers go up a little. After a workout, tell us how it felt and next week adapts.
      </PageHeader>

      <section aria-labelledby="words" className="rounded-card bg-accent-soft p-6 ring-1 ring-accent/15">
        <h2 id="words" className="flex items-center gap-2 text-xl font-extrabold text-accent-dark">
          <Icon name="smile" className="h-6 w-6" /> Quick word guide
        </h2>
        <ul className="mt-3 grid gap-3 text-base sm:grid-cols-3">
          <li className="rounded-2xl bg-white p-4 shadow-card"><strong>Rep</strong><br />Doing the movement once.</li>
          <li className="rounded-2xl bg-white p-4 shadow-card"><strong>Set</strong><br />A group of reps. &quot;2 sets of 8&quot; = 8 reps, rest, 8 more.</li>
          <li className="rounded-2xl bg-white p-4 shadow-card"><strong>Seconds</strong><br />Hold a position instead of counting reps.</li>
        </ul>
        <p className="mt-3 text-base">Move slowly, breathe normally, and stop if anything hurts.</p>
      </section>

      {missed.length > 0 && <RescheduleCard missedDays={missed.map((d) => WEEKDAYS[d.weekday])} />}

      {daysUsed === 0 ? (
        <p className="text-muted">We could not build a plan from your answers. Try changing your equipment or limits in Settings.</p>
      ) : (
        week.days.map((d) => (
          <section key={d.slot} aria-labelledby={`day-${d.slot}`} className="scroll-mt-24">
            <DayHeader
              id={`day-${d.slot}`}
              weekday={WEEKDAYS[d.weekday]}
              focus={groupTitle(scheduleGroupsForDay(d.items))}
              minutes={d.items.reduce((s, i) => s + i.exercise.durationMin, 0) + ROUTINE_MINUTES}
              limit={profile.minutes}
              exerciseCount={d.items.length}
              missed={missed.includes(d)}
              startHref={d.items.some((i) => !i.done) ? `/workout?day=${d.slot}` : null}
              note={
                d.items.reduce((s, i) => s + i.exercise.durationMin, 0) < exerciseMinutes(profile.minutes) * 0.7
                  ? "Shorter than your limit: your equipment and safety answers leave fewer moves to choose from."
                  : undefined
              }
            />
            <RoutineBox title="Warm-up first" moves={warmup} />
            <ul className="mt-5 space-y-4">
              {d.items.map((item) => (
                <ExerciseCard key={item.id} item={item} units={profile.units} />
              ))}
            </ul>
            <RoutineBox title="Then cool down" moves={cooldown} />
            {d.items.length > 0 && d.items.every((i) => i.done) && (
              <FeedbackCard planId={week.planId} day={d.slot} feeling={d.feeling} />
            )}
          </section>
        ))
      )}

      <section aria-labelledby="how" className="rounded-card bg-white p-6 shadow-card ring-1 ring-gray-100">
        <h2 id="how" className="text-xl font-extrabold">How was this plan made?</h2>
        <p className="mt-2 text-muted">
          Out of {EXERCISES.filter((e) => fitsFormat(e, formatOf(profile))).length} {FORMAT_INFO[formatOf(profile)].title.toLowerCase()} exercises, {usableCount} suit your equipment and safety answers. Muscles that work together are placed on
          different days so they can rest. Each day is filled with the most useful exercises that fit in your {profile.minutes} minutes.
        </p>
      </section>
    </div>
  );
}

/** Warm-up / cool-down summary for one day. */
function RoutineBox({ title, moves }: { title: string; moves: RoutineMove[] }) {
  return (
    <div className="mt-5 rounded-card bg-accent-soft px-5 py-4 ring-1 ring-accent/15">
      <p className="flex items-center gap-2 font-extrabold text-accent-dark">
        <Icon name="timer" className="h-5 w-5" />
        {title} · about {Math.round(totalSeconds(moves) / 60)} minutes
      </p>
      <p className="mt-1 text-base">{moves.map((m) => `${m.name} (${m.seconds} s)`).join(" · ")}</p>
    </div>
  );
}
