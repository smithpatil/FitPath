import BarChart from "@/components/BarChart";
import PageHeader from "@/components/PageHeader";
import LineChart from "@/components/LineChart";
import { toISODate } from "@/lib/dates";
import { EXERCISES } from "@/data/exercises";
import Badges from "@/components/progress/Badges";
import HeatMap from "@/components/progress/HeatMap";
import StatTiles, { type Tile } from "@/components/progress/StatTiles";
import { formatOf } from "@/lib/formats";
import { getLogRows, getLoggedResults } from "@/lib/planStore";
import { badgesFor, computeStats, formatMinutes, monthGrid, monthParam, nextMilestone, parseMonth, shiftMonth } from "@/lib/stats";
import { personalBests } from "@/lib/strength";
import { getProfile } from "@/lib/profile";
import { weeklyCounts } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";
import { fromKg } from "@/lib/units";
import { weekStreak } from "@/lib/streak";
import { getToday } from "@/lib/today.server";
import BodyWeightForm from "./BodyWeightForm";
import { deleteBodyWeight } from "./actions";

export const metadata = { title: "Progress — FitPath" };

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const supabase = await createClient();
  const profile = (await getProfile(supabase))!;
  const logRows = await getLogRows(supabase);
  const logDates = logRows.map((r) => r.date);
  const now = await getToday();
  const { month } = await searchParams;
  const weeks = weeklyCounts(logDates, now, 8);
  const bests = personalBests(await getLoggedResults(supabase)).slice(0, 10);
  const total = weeks.reduce((s, w) => s + w.count, 0);
  const streak = weekStreak(logDates, now);

  // New: totals, streaks, badges and the month calendar.
  const stats = computeStats(logRows, now);
  const yoga = formatOf(profile) === "yoga";
  const badges = badgesFor(stats);
  const ym = parseMonth(month, now);
  const grid = monthGrid(ym.year, ym.month0, stats.countByDate);
  const current = parseMonth(undefined, now);
  const isCurrentMonth = ym.year === current.year && ym.month0 === current.month0;
  const weeksWord = (n: number) => `${n} ${n === 1 ? "week" : "weeks"}`;
  const tiles: Tile[] = [
    { icon: "calendar", label: "Workouts", value: String(stats.workoutDays), note: "days trained" },
    { icon: "flame", label: "Current streak", value: weeksWord(stats.currentStreak), note: "in a row", tone: "amber" },
    { icon: "star", label: "Longest streak", value: weeksWord(stats.longestStreak), note: "your record", tone: "amber" },
    { icon: "clock", label: "Time trained", value: formatMinutes(stats.minutes), note: "about, in total" },
    yoga
      ? { icon: "heart", label: "Poses done", value: String(stats.exercisesDone), note: "poses and flows" }
      : { icon: "dumbbell", label: "Exercises done", value: String(stats.exercisesDone), note: "finished so far" },
    yoga
      ? { icon: "timer", label: "Longest hold", value: stats.longestHoldSeconds ? `${stats.longestHoldSeconds} sec` : "–", note: "in one pose" }
      : {
          icon: "bolt",
          label: "Weight lifted",
          value: stats.volumeKg ? `${fromKg(stats.volumeKg, profile.units).toLocaleString("en-GB")} ${profile.units}` : "–",
          note: stats.volumeKg ? "weight × reps × sets" : "write down your weights to see this",
        },
  ];

  const { data: rows } = await supabase.from("body_weights").select("id, measured_on, kg").order("measured_on", { ascending: false }).limit(30);
  const weights = rows ?? [];
  const points = [...weights].reverse().slice(-12).map((r) => ({ date: r.measured_on as string, value: fromKg(Number(r.kg), profile.units) }));

  return (
    <div className="space-y-12">
      <PageHeader icon="chart" eyebrow="Your journey" title="Your progress">
        {total === 0
          ? "Finish your first workout and it will show up here."
          : `${stats.workoutDays} workout ${stats.workoutDays === 1 ? "day" : "days"} done. Your streak is ${weeksWord(streak)}.`}
      </PageHeader>

      <section aria-labelledby="numbers">
        <h2 id="numbers" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Your numbers
        </h2>
        <div className="mt-5">
          <StatTiles tiles={tiles} />
        </div>
      </section>

      <section aria-labelledby="badges">
        <h2 id="badges" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Milestones and badges
        </h2>
        <div className="mt-5">
          <Badges badges={badges} next={nextMilestone(stats.workoutDays)} workoutDays={stats.workoutDays} />
        </div>
      </section>

      <section aria-labelledby="calendar">
        <h2 id="calendar" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Your calendar
        </h2>
        <div className="mt-5">
          <HeatMap
            grid={grid}
            prevHref={`/progress?month=${monthParam(shiftMonth(ym, -1))}`}
            nextHref={isCurrentMonth ? null : `/progress?month=${monthParam(shiftMonth(ym, 1))}`}
            todayIso={toISODate(now)}
          />
        </div>
      </section>

      <section aria-labelledby="workouts">
        <h2 id="workouts" className="text-2xl font-bold">
          Workouts each week
        </h2>
        <div className="mt-4 max-w-xl">
          <BarChart data={weeks} />
        </div>
      </section>

      {!yoga && (
      <section aria-labelledby="bests">
        <h2 id="bests" className="text-2xl font-bold">
          Your best lifts
        </h2>
        {bests.length === 0 ? (
          <p className="mt-2 text-muted">
            When you finish a dumbbell or gym exercise, write down the weight you used. Your heaviest one for each exercise will show here.
          </p>
        ) : (
          <ul className="mt-4 max-w-xl divide-y divide-gray-200 rounded-2xl border-2 border-gray-200">
            {bests.map((b) => (
              <li key={b.exerciseId} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span className="font-medium">{EXERCISES.find((e) => e.id === b.exerciseId)?.name ?? b.exerciseId}</span>
                <span>
                  <strong>
                    {fromKg(b.weightKg, profile.units)} {profile.units}
                  </strong>{" "}
                  <span className="text-muted">on {b.date}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

      <section aria-labelledby="weight">
        <h2 id="weight" className="text-2xl font-bold">
          Body weight <span className="text-lg font-normal text-muted">(optional)</span>
        </h2>
        <p className="mt-2 text-muted">
          Only add this if you want to. Weight is just one number and does not show everything about your health.
        </p>
        <BodyWeightForm unit={profile.units} today={toISODate(now)} />

        {points.length > 0 && (
          <div className="mt-8 max-w-xl">
            <LineChart points={points} unit={profile.units} />
          </div>
        )}

        {weights.length > 0 && (
          <ul className="mt-8 max-w-xl divide-y divide-gray-200 rounded-2xl border-2 border-gray-200">
            {weights.slice(0, 10).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <span>
                  <strong>
                    {fromKg(Number(r.kg), profile.units)} {profile.units}
                  </strong>{" "}
                  <span className="text-muted">on {r.measured_on}</span>
                </span>
                <form action={deleteBodyWeight}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="rounded-full px-4 py-2 text-base font-medium text-accent underline hover:bg-accent-soft">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
