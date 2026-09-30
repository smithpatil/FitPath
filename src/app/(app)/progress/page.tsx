import BarChart from "@/components/BarChart";
import LineChart from "@/components/LineChart";
import { toISODate } from "@/lib/dates";
import { getLogDates } from "@/lib/planStore";
import { getProfile } from "@/lib/profile";
import { weeklyCounts } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";
import { fromKg } from "@/lib/units";
import { weekStreak } from "@/lib/streak";
import { getToday } from "@/lib/today.server";
import BodyWeightForm from "./BodyWeightForm";
import { deleteBodyWeight } from "./actions";

export const metadata = { title: "Progress — FitPath" };

export default async function ProgressPage() {
  const supabase = await createClient();
  const profile = (await getProfile(supabase))!;
  const logDates = await getLogDates(supabase);
  const now = await getToday();
  const weeks = weeklyCounts(logDates, now, 8);
  const total = weeks.reduce((s, w) => s + w.count, 0);
  const streak = weekStreak(logDates, now);

  const { data: rows } = await supabase.from("body_weights").select("id, measured_on, kg").order("measured_on", { ascending: false }).limit(30);
  const weights = rows ?? [];
  const points = [...weights].reverse().slice(-12).map((r) => ({ date: r.measured_on as string, value: fromKg(Number(r.kg), profile.units) }));

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold">Your progress</h1>
        <p className="mt-2 text-muted">
          {total === 0
            ? "Finish your first workout and it will show up here."
            : `You did ${total} workout ${total === 1 ? "day" : "days"} in the last 8 weeks. Your streak is ${streak} ${streak === 1 ? "week" : "weeks"}.`}
        </p>
      </header>

      <section aria-labelledby="workouts">
        <h2 id="workouts" className="text-2xl font-bold">
          Workouts each week
        </h2>
        <div className="mt-4 max-w-xl">
          <BarChart data={weeks} />
        </div>
      </section>

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
