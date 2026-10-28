import Icon from "@/components/Icon";
import type { Badge } from "@/lib/stats";

// "Next milestone" progress bar, then a grid of badges (earned in colour, locked in grey).
export default function Badges({
  badges,
  next,
  workoutDays,
}: {
  badges: Badge[];
  next: { target: number; remaining: number; fraction: number } | null;
  workoutDays: number;
}) {
  const earned = badges.filter((b) => b.earned).length;
  return (
    <div className="space-y-6">
      <div className="on-deep rounded-card bg-gradient-to-br from-deep via-[#172554] to-accent p-5 text-white sm:p-6">
        <p className="text-sm font-extrabold uppercase tracking-widest text-ice">Next milestone</p>
        {next ? (
          <>
            <p className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
              {next.remaining} more {next.remaining === 1 ? "workout" : "workouts"} to reach {next.target}
            </p>
            <div
              role="progressbar"
              aria-label="Progress to your next milestone"
              aria-valuemin={0}
              aria-valuemax={next.target}
              aria-valuenow={workoutDays}
              className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/25"
            >
              <div className="h-full rounded-full bg-spark" style={{ width: `${Math.max(4, Math.round(next.fraction * 100))}%` }} />
            </div>
            <p className="mt-2 text-base text-ice">
              {workoutDays} {workoutDays === 1 ? "workout day" : "workout days"} so far
            </p>
          </>
        ) : (
          <p className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">You have passed every workout milestone. Amazing!</p>
        )}
      </div>

      <div>
        <p className="font-bold text-muted">
          {earned} of {badges.length} badges earned
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => (
            <li
              key={b.id}
              className={`flex flex-col items-center gap-2 rounded-card p-4 text-center ${
                b.earned ? "bg-white shadow-card ring-1 ring-amber-200" : "border border-dashed border-gray-300 bg-slate-100"
              }`}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full ${
                  b.earned ? "bg-gradient-to-br from-spark to-amber-500 text-deep shadow-sm" : "bg-gray-200 text-gray-500"
                }`}
              >
                <Icon name={b.icon} className="h-7 w-7" />
              </span>
              <span className="text-base font-extrabold leading-tight">{b.title}</span>
              <span className="text-sm text-muted">{b.earned ? "Earned" : b.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
