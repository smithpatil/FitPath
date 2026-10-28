import Icon, { type IconName } from "@/components/Icon";

export interface StepItem {
  icon: IconName;
  title: string;
  hint: string;
  status: "done" | "current" | "todo";
}

// "What to do today": a short guide that updates as you work through the day.
export default function TodaySteps({ steps }: { steps: StepItem[] }) {
  return (
    <section aria-labelledby="steps-title">
      <div className="flex items-end justify-between gap-3">
        <h2 id="steps-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          What to do today
        </h2>
      </div>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => {
          const current = s.status === "current";
          const done = s.status === "done";
          return (
            <li
              key={s.title}
              aria-current={current ? "step" : undefined}
              className={`relative flex flex-col gap-3 rounded-card p-5 ${
                current
                  ? "on-deep bg-gradient-to-br from-deep to-accent text-white shadow-lift"
                  : done
                    ? "bg-accent-soft ring-1 ring-accent/15"
                    : "bg-white shadow-card ring-1 ring-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    current ? "bg-spark text-deep" : done ? "bg-accent text-white" : "bg-gray-100 text-muted"
                  }`}
                >
                  <Icon name={done ? "check" : s.icon} className="h-6 w-6" strokeWidth={done ? 3 : 2} />
                </span>
                <span className={`text-sm font-extrabold uppercase tracking-wider ${current ? "text-ice" : "text-muted"}`}>
                  {done ? "Done" : current ? "Now" : `Step ${i + 1}`}
                </span>
              </div>
              <div>
                <p className="text-xl font-extrabold leading-tight">{s.title}</p>
                <p className={`mt-1 text-base ${current ? "text-ice" : "text-muted"}`}>{s.hint}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
