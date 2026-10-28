import ButtonLink from "@/components/Button";
import Icon from "@/components/Icon";

// The banner above each workout day on the Plan page: weekday, muscle focus, chips and a start button.
export default function DayHeader({
  id,
  weekday,
  focus,
  minutes,
  limit,
  exerciseCount,
  noun = "exercises",
  missed,
  startHref,
  note,
}: {
  id: string;
  weekday: string;
  focus: string;
  /** Total minutes including warm-up and cool-down. */
  minutes: number;
  /** The user's minutes limit for a workout day. */
  limit: number;
  exerciseCount: number;
  /** "exercises", or "poses" in yoga. */
  noun?: string;
  missed: boolean;
  /** Link to workout mode, or null when everything is done. */
  startHref: string | null;
  note?: string;
}) {
  return (
    <div className="on-deep relative overflow-hidden rounded-card bg-gradient-to-br from-deep via-[#431407] to-accent p-5 text-white sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-spark/15 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id={id} className="text-sm font-extrabold uppercase tracking-widest text-amber-300">
              {weekday}
            </h2>
            {missed && <span className="rounded-full bg-amber-200 px-3 py-0.5 text-sm font-extrabold text-amber-950">Missed</span>}
          </div>
          <p className="mt-1 text-3xl font-extrabold leading-tight tracking-tight">{focus}</p>
          <ul className="mt-4 flex flex-wrap gap-2 text-base font-semibold">
            <li className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 ring-1 ring-white/20">
              <Icon name="dumbbell" className="h-4 w-4 text-spark" /> {exerciseCount} {noun}
            </li>
            <li className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 ring-1 ring-white/20">
              <Icon name="clock" className="h-4 w-4 text-spark" /> about {minutes} min <span className="font-normal text-ice">of {limit}</span>
            </li>
          </ul>
          {note && <p className="mt-3 max-w-xl text-base text-ice">{note}</p>}
        </div>
        {startHref && (
          <ButtonLink href={startHref} variant="spark" arrow>
            {noun === "poses" ? "Start session" : "Start workout"}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
