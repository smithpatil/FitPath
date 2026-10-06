"use client";

import { useActionState } from "react";
import { logResult, type LogState } from "@/app/(app)/actions";

const AMOUNT_LABEL = { reps: "Reps per set", seconds: "Seconds held", minutes: "Minutes" } as const;

// Optional "what did you actually do?" form shown on a finished exercise.
export default function LogResultForm({
  itemId,
  unit,
  weighted,
  units,
  defaultAmount,
  defaultWeight,
}: {
  itemId: string;
  unit: "reps" | "seconds" | "minutes";
  weighted: boolean;
  units: "kg" | "lb";
  defaultAmount: number | null;
  defaultWeight: number | null;
}) {
  const [state, action, pending] = useActionState<LogState, FormData>(logResult, {});
  return (
    <form action={action} className="mt-4 rounded-xl bg-white/70 p-4">
      <p className="text-base font-medium">What did you actually do? (optional)</p>
      <input type="hidden" name="itemId" value={itemId} />
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={`amount-${itemId}`} className="block text-base">
            {AMOUNT_LABEL[unit]}
          </label>
          <input
            id={`amount-${itemId}`}
            name="amount"
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            defaultValue={defaultAmount ?? ""}
            className="mt-1 w-28 rounded-xl border-2 border-gray-500 px-3 py-2"
          />
        </div>
        {weighted && (
          <div>
            <label htmlFor={`weight-${itemId}`} className="block text-base">
              Weight ({units})
            </label>
            <input
              id={`weight-${itemId}`}
              name="weight"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0.5"
              defaultValue={defaultWeight ?? ""}
              className="mt-1 w-28 rounded-xl border-2 border-gray-500 px-3 py-2"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border-2 border-accent px-5 py-2 text-base font-semibold text-accent hover:bg-accent-soft disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="mt-2 text-base text-red-800">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p role="status" className="mt-2 text-base text-accent-dark">
          Saved.
        </p>
      )}
    </form>
  );
}
