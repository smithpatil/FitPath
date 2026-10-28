import Icon from "@/components/Icon";

// Two tiles: the week streak, and a progress ring for this week's workout days.
export default function Stats({ streak, daysDone, daysPlanned }: { streak: number; daysDone: number; daysPlanned: number }) {
  const fraction = daysPlanned > 0 ? Math.min(1, daysDone / daysPlanned) : 0;
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <section aria-label="Your stats" className="grid gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-5 rounded-card bg-white p-6 shadow-card ring-1 ring-gray-100">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Icon name="flame" className="h-9 w-9" />
        </span>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-muted">Your streak</p>
          <p className="text-4xl font-extrabold leading-tight tracking-tight">
            {streak} {streak === 1 ? "week" : "weeks"}
          </p>
          <p className="text-base text-muted">in a row with a workout</p>
        </div>
      </div>

      <div className="flex items-center gap-5 rounded-card bg-white p-6 shadow-card ring-1 ring-gray-100">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 80 80" className="h-16 w-16 -rotate-90" aria-hidden="true">
            <circle cx="40" cy="40" r={R} fill="none" stroke="#e5e7eb" strokeWidth="9" />
            <circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              stroke="#2f6b57"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - fraction)}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-base font-extrabold">{Math.round(fraction * 100)}%</span>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-muted">This week</p>
          <p className="text-4xl font-extrabold leading-tight tracking-tight">
            {daysDone} of {daysPlanned}
          </p>
          <p className="text-base text-muted">workout days done</p>
        </div>
      </div>
    </section>
  );
}
