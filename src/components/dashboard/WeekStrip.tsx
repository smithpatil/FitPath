import Link from "next/link";
import Icon from "@/components/Icon";

export interface StripDay {
  /** 0 = Monday … 6 = Sunday */
  weekday: number;
  /** Present only on training days. */
  workout?: { slot: number; focus: string; done: number; total: number; missed: boolean };
}

const SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Seven cards, one per day. Training days link to that day in the plan.
export default function WeekStrip({ days, todayWeekday }: { days: StripDay[]; todayWeekday: number }) {
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {days.map((d) => {
        const isToday = d.weekday === todayWeekday;
        const w = d.workout;
        const complete = w !== undefined && w.total > 0 && w.done === w.total;

        const look = isToday
          ? "on-deep bg-gradient-to-br from-deep to-accent text-white shadow-lift"
          : complete
            ? "bg-accent-soft ring-1 ring-accent/20"
            : w
              ? "bg-white shadow-card ring-1 ring-gray-100 hover:shadow-lift"
              : "border border-dashed border-gray-300 bg-slate-100";
        const shell = `flex h-full min-h-36 flex-col rounded-2xl p-4 transition-shadow ${look}`;

        const inner = (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-extrabold uppercase tracking-wider ${isToday ? "text-ice" : "text-muted"}`}>{SHORT[d.weekday]}</span>
              {isToday && <span className="rounded-full bg-spark px-2 py-0.5 text-xs font-extrabold text-deep">Today</span>}
              {w?.missed && !isToday && <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-extrabold text-amber-950">Missed</span>}
              {complete && !isToday && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                  <Icon name="check" className="h-4 w-4" strokeWidth={3} />
                </span>
              )}
            </div>
            {w ? (
              <>
                <p className="mt-3 line-clamp-3 text-base font-bold leading-snug">{w.focus}</p>
                <div className="mt-auto pt-4">
                  <div className={`h-1.5 w-full overflow-hidden rounded-full ${isToday ? "bg-white/25" : "bg-gray-200"}`} aria-hidden="true">
                    <div
                      className={`h-full rounded-full ${isToday ? "bg-spark" : "bg-accent"}`}
                      style={{ width: `${w.total ? (w.done / w.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className={`mt-2 text-sm ${isToday ? "text-ice" : "text-muted"}`}>
                    {w.done} of {w.total} done
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-3 flex items-center gap-1.5 text-base text-muted">
                <Icon name="moon" className="h-4 w-4" /> Rest
              </p>
            )}
          </>
        );

        return (
          <li key={d.weekday}>
            {w ? (
              <Link href={`/plan#day-${w.slot}`} className={shell} aria-label={`${LONG[d.weekday]}: ${w.focus}, ${w.done} of ${w.total} done`}>
                {inner}
              </Link>
            ) : (
              <div className={shell}>{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
