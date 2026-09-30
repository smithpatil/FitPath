"use client";

import { useActionState } from "react";
import { addBodyWeight, type WeightState } from "./actions";

export default function BodyWeightForm({ unit, today }: { unit: string; today: string }) {
  const [state, action, pending] = useActionState<WeightState, FormData>(addBodyWeight, {});
  return (
    <form action={action} className="mt-4 flex flex-wrap items-end gap-4">
      <div>
        <label htmlFor="weight" className="block font-medium">
          Weight ({unit})
        </label>
        <input
          id="weight"
          name="weight"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="1"
          required
          className="mt-1 w-36 rounded-xl border-2 border-gray-500 px-4 py-3"
        />
      </div>
      <div>
        <label htmlFor="date" className="block font-medium">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={today}
          max={today}
          required
          className="mt-1 rounded-xl border-2 border-gray-500 px-4 py-3"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-8 py-3 text-lg font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state.error && (
        <p role="alert" className="w-full rounded-xl bg-red-50 px-4 py-3 text-red-800">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p role="status" className="w-full rounded-xl bg-accent-soft px-4 py-3 text-accent-dark">
          Saved.
        </p>
      )}
    </form>
  );
}
