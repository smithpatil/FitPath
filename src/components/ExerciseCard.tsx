import { toggleDone } from "@/app/(app)/actions";
import { describeTarget, EQUIPMENT_LABEL, GROUP_LABEL } from "@/lib/labels";
import type { WeekItem } from "@/lib/planStore";
import { describeResult, isWeighted, suggestionFor } from "@/lib/strength";
import { fromKg, type Unit } from "@/lib/units";
import LogResultForm from "./LogResultForm";
import SwapButton from "./SwapButton";

// One exercise with its sets/reps, a how-to note, last time's result, and the action buttons.
export default function ExerciseCard({ item, units, compact }: { item: WeekItem; units: Unit; compact?: boolean }) {
  const { exercise: ex } = item;
  const weighted = isWeighted(ex);
  const suggestion = weighted ? suggestionFor(item.last, units) : null;
  const lastText = item.last ? describeResult(item.last, ex.unit, units) : "";

  return (
    <li className={`rounded-2xl border-2 p-5 ${item.done ? "border-accent bg-accent-soft" : "border-gray-200"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">
            {item.done && <span aria-hidden="true">✓ </span>}
            {ex.name}
          </h3>
          <p className="mt-1 text-lg font-medium text-accent-dark">{describeTarget(item.sets, item.reps, ex.unit)}</p>
          <p className="text-base text-muted">
            {GROUP_LABEL[ex.muscleGroup]} · {EQUIPMENT_LABEL[ex.equipment[0]]} · about {ex.durationMin} min
          </p>
          {lastText && !item.done && (
            <p className="mt-1 text-base">
              <span className="text-muted">Last time:</span> {lastText}
              {suggestion !== null && (
                <>
                  {" "}
                  · <strong>try {suggestion} {units} today</strong>
                </>
              )}
            </p>
          )}
        </div>
        {item.done && <span className="rounded-full bg-accent px-3 py-1 text-base font-semibold text-white">Done</span>}
      </div>

      {!compact && (
        <p className="mt-3">
          <strong>How to do it: </strong>
          {ex.howTo}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <form action={toggleDone}>
          <input type="hidden" name="itemId" value={item.id} />
          <button
            type="submit"
            className={`rounded-full px-6 py-3 text-base font-semibold ${
              item.done ? "border-2 border-accent text-accent hover:bg-white" : "bg-accent text-white hover:bg-accent-dark"
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
