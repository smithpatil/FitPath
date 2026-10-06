import Link from "next/link";
import ExerciseCard from "@/components/ExerciseCard";
import FeedbackCard from "@/components/FeedbackCard";
import ButtonLink from "@/components/Button";
import { WEEKDAYS, weekdayIndex } from "@/lib/dates";
import { groupTitle } from "@/lib/labels";
import { weekdayForSlot } from "@/lib/planGenerator";
import { getCurrentWeek, getLogDates } from "@/lib/planStore";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { weekStreak, workoutDaysInWeek } from "@/lib/streak";
import { getToday } from "@/lib/today.server";
import { scheduleGroupsForDay } from "../groups";

export const metadata = { title: "Today — FitPath" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = (await getProfile(supabase))!; // the layout already made sure it exists
  const week = await getCurrentWeek(supabase, user!.id, profile);
  const logDates = await getLogDates(supabase);

  const now = await getToday();
  const streak = weekStreak(logDates, now);
  const daysThisWeek = workoutDaysInWeek(logDates, now);

  const daysUsed = week.days.length;
  const todayWeekday = weekdayIndex(now);
  const withWeekday = week.days.map((d) => ({ ...d, weekday: weekdayForSlot(daysUsed, d.slot) }));
  const today = withWeekday.find((d) => d.weekday === todayWeekday);
  const next = withWeekday.find((d) => d.weekday > todayWeekday);

  return (
    <div className="space-y-12">
      <section aria-labelledby="streak" className="grid gap-4 sm:grid-cols-2">
        <h1 id="streak" className="sr-only">Today</h1>
        <div className="rounded-2xl bg-accent-soft p-6">
          <p className="text-base font-medium text-accent-dark">Your streak</p>
          <p className="mt-1 text-4xl font-bold text-accent-dark">
            {streak} {streak === 1 ? "week" : "weeks"}
          </p>
          <p className="mt-1 text-base text-muted">Weeks in a row with at least one workout.</p>
        </div>
        <div className="rounded-2xl bg-accent-soft p-6">
          <p className="text-base font-medium text-accent-dark">This week</p>
          <p className="mt-1 text-4xl font-bold text-accent-dark">
            {daysThisWeek} of {daysUsed}
          </p>
          <p className="mt-1 text-base text-muted">workout days done so far.</p>
        </div>
      </section>

      <section aria-labelledby="today">
        <h2 id="today" className="text-2xl font-bold">
          Today&apos;s workout
        </h2>
        {daysUsed === 0 ? (
          <p className="mt-4 text-muted">We could not build a plan from your answers. Try changing your equipment or limits in Settings.</p>
        ) : today ? (
          <>
            <p className="mt-2 text-muted">
              {WEEKDAYS[todayWeekday]}: <strong className="text-ink">{groupTitle(scheduleGroupsForDay(today.items))}</strong>
            </p>
            {today.items.some((i) => !i.done) && (
              <div className="mt-6">
                <ButtonLink href={`/workout?day=${today.slot}`}>Start workout mode</ButtonLink>
                <p className="mt-2 text-base text-muted">One exercise at a time, with a rest timer. Or tick them off below.</p>
              </div>
            )}
            <ul className="mt-6 space-y-4">
              {today.items.map((item) => (
                <ExerciseCard key={item.id} item={item} units={profile.units} />
              ))}
            </ul>
            {today.items.length > 0 && today.items.every((i) => i.done) && (
              <FeedbackCard planId={week.planId} day={today.slot} feeling={today.feeling} />
            )}
          </>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-gray-200 p-6">
            <p className="text-xl font-semibold">Today is a rest day.</p>
            <p className="mt-2 text-muted">
              Rest is when your body gets stronger.{" "}
              {next ? `Your next workout is on ${WEEKDAYS[next.weekday]}.` : "Your next workout is next week."}
            </p>
          </div>
        )}
      </section>

      {daysUsed > 0 && (
        <section aria-labelledby="week">
          <h2 id="week" className="text-2xl font-bold">
            This week&apos;s plan
          </h2>
          <ul className="mt-6 divide-y divide-gray-200 rounded-2xl border-2 border-gray-200">
            {withWeekday.map((d) => {
              const done = d.items.filter((i) => i.done).length;
              return (
                <li key={d.slot} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                  <div>
                    <p className="font-semibold">
                      {WEEKDAYS[d.weekday]}
                      {d.weekday === todayWeekday && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-sm text-white">Today</span>}
                    </p>
                    <p className="text-base text-muted">{groupTitle(scheduleGroupsForDay(d.items))}</p>
                  </div>
                  <p className={`text-base font-medium ${done === d.items.length ? "text-accent" : "text-muted"}`}>
                    {done === d.items.length && "✓ "}
                    {done} of {d.items.length} done
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="mt-6">
            <ButtonLink href="/plan" variant="outline">
              See the full plan
            </ButtonLink>
          </div>
        </section>
      )}
      <p className="text-base text-muted">
        Curious how this plan was made? <Link href="/maths" className="font-semibold text-accent underline">Read The Maths Behind It</Link>.
      </p>
    </div>
  );
}
