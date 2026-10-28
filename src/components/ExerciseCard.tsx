import { toggleDone } from "@/app/(app)/actions";
import { describeTarget, EQUIPMENT_LABEL, groupLabel } from "@/lib/labels";
import type { WeekItem } from "@/lib/planStore";
import { describeResult, isWeighted, suggestionFor } from "@/lib/strength";
import { fromKg, type Unit } from "@/lib/units";
import Icon, { groupIcon } from "./Icon";
import LogResultForm from "./LogResultForm";
import SwapButton from "./SwapButton";

// One exercise as a card: an icon badge, the name, a bold target, small tags, how-to, and the buttons.
export default function ExerciseCard({ item, units, compact }: { item: WeekItem; units: Unit; compact?: boolean }) {
  const { exercise: ex } = item;
  const weighted = isWeighted(ex);
  const suggestion = weighted ? suggestionFor(item.last, units) : null;
  const lastText = item.last ? describeResult(item.last, ex.unit, units) : "";

  return (
    <li
      className={`rounded-card p-5 sm:p-6 ${
        item.done ? "bg-accent-soft ring-2 ring-accent" : "bg-white shadow-card ring-1 ring-gray-100"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
            item.done ? "bg-accent text-white" : "bg-gradient-to-br from-accent to-deep text-white"
          }`}
        >
          <Icon name={item.done ? "check" : groupIcon(ex.muscleGroup, ex.style === "yoga")} className="h-7 w-7" strokeWidth={item.done ? 3 : 2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-xl font-extrabold leading-tight">{ex.name}</h3>
            {item.done && <span className="rounded-full bg-accent px-3 py-1 text-sm font-extrabold text-white">Done</span>}
          </div>
          <p className="mt-1 inline-block rounded-full bg-deep px-3 py-1 text-base font-extrabold text-white">
            {describeTarget(item.sets, item.reps, ex.unit)}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
            {[groupLabel(ex.muscleGroup, ex.style === "yoga" ? "yoga" : undefined), ex.style === "yoga" ? "Mat" : EQUIPMENT_LABEL[ex.equipment[0]], `about ${ex.durationMin} min`].map((t) => (
              <li key={t} className="rounded-full bg-slate-200 px-3 py-1 text-gray-700">
                {t}
              </li>
            ))}
          </ul>
          {lastText && !item.done && (
            <p className="mt-3 text-base">
              <span className="text-muted">Last time:</span> {lastText}
              {suggestion !== null && (
                <>
                  {" "}
                  · <strong className="text-deep">try {suggestion} {units} today</strong>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <p className="mt-4 text-muted">
          <strong className="text-ink">How to do it: </strong>
          {ex.howTo}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-start gap-3">
        <form action={toggleDone}>
          <input type="hidden" name="itemId" value={item.id} />
          <button
            type="submit"
            className={`rounded-full px-6 py-3 text-base font-bold transition-colors ${
              item.done ? "border-2 border-accent text-deep hover:bg-white" : "bg-accent text-white shadow-sm hover:bg-accent-dark"
            }`}
          >
            {item.done ? "Undo" : "Mark as done"}
          </button>
        </form>
        <SwapButton itemId={item.id} disabled={item.done} />
      </div>

      {item.done && (
        <LogResultForm
          itemId={item.id}
          unit={ex.unit}
          weighted={weighted}
          units={units}
          defaultAmount={item.log?.amount ?? item.reps}
          defaultWeight={item.log?.weightKg != null ? fromKg(item.log.weightKg, units) : suggestion}
        />
      )}
    </li>
  );
}
