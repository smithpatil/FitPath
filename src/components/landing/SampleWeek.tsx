import Icon from "../Icon";

// A made-up example week, shown on the landing page as a preview of the real "Your week" cards.
const DAYS: { day: string; focus?: string; state: "done" | "today" | "todo" | "rest" }[] = [
  { day: "Mon", focus: "Legs + Core", state: "done" },
  { day: "Tue", state: "rest" },
  { day: "Wed", focus: "Chest + Back", state: "today" },
  { day: "Thu", state: "rest" },
  { day: "Fri", focus: "Glutes + Arms", state: "todo" },
  { day: "Sat", focus: "Cardio", state: "todo" },
  { day: "Sun", state: "rest" },
];

export default function SampleWeek() {
  return (
    <div className="rounded-hero border border-gray-200 bg-white p-4 shadow-card sm:p-6">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {DAYS.map((d) => (
          <li
            key={d.day}
            className={`flex min-h-32 flex-col rounded-2xl p-4 ${
              d.state === "today"
                ? "bg-gradient-to-br from-deep to-accent text-white shadow-lift"
                : d.state === "done"
                  ? "bg-accent-soft"
                  : d.state === "rest"
                    ? "border border-dashed border-gray-300 bg-gray-50"
                    : "border border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-extrabold uppercase tracking-wider ${d.state === "today" ? "text-ice" : "text-muted"}`}>{d.day}</span>
              {d.state === "done" && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                  <Icon name="check" className="h-4 w-4" strokeWidth={3} />
                </span>
              )}
              {d.state === "today" && <span className="rounded-full bg-spark px-2 py-0.5 text-xs font-extrabold text-deep">Today</span>}
            </div>
            {d.focus ? (
              <p className={`mt-3 text-base font-bold leading-snug ${d.state === "today" ? "text-white" : "text-ink"}`}>{d.focus}</p>
            ) : (
              <p className="mt-3 flex items-center gap-1.5 text-base text-muted">
                <Icon name="moon" className="h-4 w-4" /> Rest
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
