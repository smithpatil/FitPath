import ExerciseCard from "@/components/ExerciseCard";
import FeedbackCard from "@/components/FeedbackCard";
import RescheduleCard from "@/components/RescheduleCard";
import Hero, { type HeroProps } from "@/components/dashboard/Hero";
import QuickLinks from "@/components/dashboard/QuickLinks";
import Stats from "@/components/dashboard/Stats";
import TodaySteps, { type StepItem } from "@/components/dashboard/TodaySteps";
import WeekStrip, { type StripDay } from "@/components/dashboard/WeekStrip";
import { WEEKDAYS, weekdayIndex } from "@/lib/dates";
import { groupTitle } from "@/lib/labels";
import { ROUTINE_MINUTES } from "@/lib/planGenerator";
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
  const today = week.days.find((d) => d.weekday === todayWeekday);
  const next = week.days.find((d) => d.weekday > todayWeekday);
  // A workout is missed when none of it was done and its day has gone by.
  const missed = week.days.filter((d) => d.weekday < todayWeekday && !d.items.some((i) => i.done));

  // The big illustrated panel at the top.
  let hero: HeroProps;
  if (daysUsed === 0) hero = { kind: "empty" };
  else if (today) {
    const done = today.items.filter((i) => i.done).length;
    hero = {
      kind: "workout",
      weekday: WEEKDAYS[todayWeekday],
      focus: groupTitle(scheduleGroupsForDay(today.items)),
      exerciseCount: today.items.length,
      minutes: today.items.reduce((s, i) => s + i.exercise.durationMin, 0) + ROUTINE_MINUTES,
      doneCount: done,
      startHref: done < today.items.length ? `/workout?day=${today.slot}` : null,
    };
  } else {
    hero = {
      kind: "rest",
      weekday: WEEKDAYS[todayWeekday],
      next: next ? `Your next workout is on ${WEEKDAYS[next.weekday]}.` : "Your next workout is next week.",
    };
  }

  // "What to do today": the steps change as the day goes on.
  let steps: StepItem[] = [];
  if (today) {
    const total = today.items.length;
    const done = today.items.filter((i) => i.done).length;
    const allDone = total > 0 && done === total;
    const rated = today.feeling !== undefined;
    steps = [
      { icon: "bolt", title: "Warm up", hint: "3 easy minutes to get moving", status: done > 0 ? "done" : "current" },
      { icon: "dumbbell", title: "Do your exercises", hint: `${done} of ${total} done. Tap Start workout.`, status: allDone ? "done" : done > 0 ? "current" : "todo" },
      { icon: "smile", title: "Rate how it felt", hint: "This shapes next week", status: allDone ? (rated ? "done" : "current") : "todo" },
      { icon: "moon", title: "Rest and recover", hint: "Drink water and sleep well", status: allDone && rated ? "current" : "todo" },
    ];
  } else if (daysUsed > 0) {
    steps = [
      { icon: "moon", title: "Rest today", hint: "Muscles grow while you rest", status: "current" },
      { icon: "drop", title: "Drink water", hint: "Stay topped up", status: "todo" },
      {
        icon: "calendar",
        title: next ? `Next: ${WEEKDAYS[next.weekday]}` : "Next: next week",
        hint: next ? groupTitle(scheduleGroupsForDay(next.items)) : "Your new plan arrives on Monday",
        status: "todo",
      },
    ];
  }

  // Seven cards for the week strip.
  const strip: StripDay[] = Array.from({ length: 7 }, (_, weekday) => {
    const d = week.days.find((x) => x.weekday === weekday);
    return {
      weekday,
      workout: d
        ? {
            slot: d.slot,
            focus: groupTitle(scheduleGroupsForDay(d.items)),
            done: d.items.filter((i) => i.done).length,
            total: d.items.length,
            missed: missed.includes(d),
          }
        : undefined,
    };
  });

  return (
    <div className="space-y-10 sm:space-y-12">
      {missed.length > 0 && <RescheduleCard missedDays={missed.map((d) => WEEKDAYS[d.weekday])} />}

      <Hero {...hero} />
      {steps.length > 0 && <TodaySteps steps={steps} />}
      <Stats streak={streak} daysDone={daysThisWeek} daysPlanned={daysUsed} />

      {today && (
        <section aria-labelledby="today-exercises">
          <h2 id="today-exercises" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Today&apos;s exercises
          </h2>
          <ul className="mt-5 space-y-4">
            {today.items.map((item) => (
              <ExerciseCard key={item.id} item={item} units={profile.units} />
            ))}
          </ul>
          {today.items.length > 0 && today.items.every((i) => i.done) && (
            <FeedbackCard planId={week.planId} day={today.slot} feeling={today.feeling} />
          )}
        </section>
      )}

      {daysUsed > 0 && (
        <section aria-labelledby="week">
          <h2 id="week" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Your week
          </h2>
          <div className="mt-5">
            <WeekStrip days={strip} todayWeekday={todayWeekday} />
          </div>
        </section>
      )}

      <QuickLinks />
    </div>
  );
}
