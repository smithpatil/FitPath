"use client";

import { useActionState } from "react";
import { rescheduleWeek, type RescheduleState } from "@/app/(app)/actions";

// Shown when a workout day has passed without any exercise done.
export default function RescheduleCard({ missedDays }: { missedDays: string[] }) {
  const [state, action, pending] = useActionState<RescheduleState>(rescheduleWeek, {});
  return (
    <section aria-labelledby="missed" className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
      <h2 id="missed" className="text-xl font-semibold text-amber-950">
        You missed {missedDays.length === 1 ? "a workout" : `${missedDays.length} workouts`}
      </h2>
      <p className="mt-2 text-amber-950">
        No problem, it happens to everyone ({missedDays.join(", ")}). We can fit {missedDays.length === 1 ? "it" : "them"} into the rest of this
        week, keeping muscles that work together on different days.
      </p>
      <form action={action} className="mt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Rescheduling…" : "Reschedule the rest of my week"}
        </button>
      </form>
      {state.message && (
        <p role="status" className="mt-3 text-amber-950">
          {state.message}
        </p>
      )}
      {state.error && (
        <p role="alert" className="mt-3 text-red-800">
          {state.error}
        </p>
      )}
    </section>
  );
}
