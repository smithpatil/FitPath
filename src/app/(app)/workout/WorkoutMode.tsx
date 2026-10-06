"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { markDone } from "@/app/(app)/actions";
import { finishesExercise, formatClock, initialState, workoutReducer, type WorkoutAction, type WorkoutState } from "@/lib/workoutMode";

export interface WorkoutItem {
  id: string;
  name: string;
  howTo: string;
  sets: number;
  reps: number;
  unit: "reps" | "seconds";
  target: string;
  done: boolean;
}

// Step-by-step workout screen: one exercise at a time, a set counter, hold and rest timers.
export default function WorkoutMode({
  items,
  restSecs,
  daySlot,
  title,
}: {
  items: WorkoutItem[];
  restSecs: number;
  daySlot: number;
  title: string;
}) {
  const [state, setState] = useState<WorkoutState>(() => initialState(items.map((i) => i.done)));
  const [doneIds, setDoneIds] = useState(() => new Set(items.filter((i) => i.done).map((i) => i.id)));
  const [endsAt, setEndsAt] = useState<number | null>(null); // when the running timer reaches 0
  const [now, setNow] = useState(() => Date.now());
  const [saveError, setSaveError] = useState(false);

  const steps = items.map((i) => ({ sets: i.sets }));
  const item = items[state.index];
  const remaining = endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));

  function apply(action: WorkoutAction): WorkoutState {
    const next = workoutReducer(steps, state, action);
    setState(next);
    return next;
  }

  function finishSet() {
    // Finishing the LAST set of an exercise ticks it done (saved straight away).
    if (finishesExercise(state, steps) && !doneIds.has(item.id)) {
      setDoneIds(new Set(doneIds).add(item.id));
      markDone(item.id).catch(() => setSaveError(true));
    }
    const next = apply({ type: "finishSet" });
    setEndsAt(next.phase === "resting" ? Date.now() + restSecs * 1000 : null);
  }

  function startHold() {
    apply({ type: "startHold" });
    setNow(Date.now());
    setEndsAt(Date.now() + item.reps * 1000);
  }

  function endRest() {
    apply({ type: "restOver" });
    setEndsAt(null);
  }

  function jump(type: "next" | "prev") {
    apply({ type });
    setEndsAt(null);
  }

  // When a timer reaches 0: a hold counts as a finished set, a rest simply ends.
  const onTimerEnd = useRef<() => void>(() => {});
  useEffect(() => {
    onTimerEnd.current = state.phase === "holding" ? finishSet : endRest;
  });
  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= endsAt) {
        clearInterval(id);
        onTimerEnd.current();
      }
    }, 250);
    return () => clearInterval(id);
  }, [endsAt]);

  // Keep the phone screen awake during the workout (where the browser supports it).
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    if ("wakeLock" in navigator) navigator.wakeLock.request("screen").then((l) => (lock = l)).catch(() => {});
    return () => {
      lock?.release().catch(() => {});
    };
  }, []);

  const doneCount = doneIds.size;
  const announce =
    state.phase === "complete"
      ? "Workout complete."
      : state.phase === "resting"
        ? `Rest for ${formatClock(restSecs)}. Up next: ${item.name}, set ${state.set} of ${item.sets}.`
        : state.phase === "holding"
          ? `Hold for ${item.reps} seconds.`
          : `${item.name}, set ${state.set} of ${item.sets}.`;

  const big = "rounded-full px-8 py-4 text-lg font-semibold";
  const primary = `${big} bg-accent text-white hover:bg-accent-dark`;
  const outline = `${big} border-2 border-accent text-accent hover:bg-accent-soft`;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-bold">Workout mode</h1>
        <Link href="/dashboard" className="font-semibold text-accent underline">
          Exit
        </Link>
      </div>
      <p className="mt-1 text-muted">{title}</p>

      {/* Progress through the exercises */}
      <p className="mt-6 text-base font-medium text-muted">
        {doneCount} of {items.length} exercises done
      </p>
      <div
        role="progressbar"
        aria-label="Workout progress"
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={doneCount}
        className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>

      {/* Screen readers hear each new step (not every tick of the clock) */}
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>

      <section className="mt-8 rounded-2xl border-2 border-gray-200 p-6">
        {state.phase === "complete" ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-accent-dark">Workout complete!</h2>
            <p className="mt-3 text-muted">Brilliant work. Take a moment to stretch and drink some water.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href={`/plan#day-${daySlot}`} className={primary}>
                Rate how it felt
              </Link>
              <Link href="/dashboard" className={outline}>
                Back to Today
              </Link>
            </div>
          </div>
        ) : state.phase === "resting" ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Rest</h2>
            <p role="timer" className="mt-4 font-mono text-7xl font-bold text-accent-dark">
              {formatClock(remaining)}
            </p>
            <p className="mt-4 text-muted">
              Up next: <strong className="text-ink">{item.name}</strong>, set {state.set} of {item.sets}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button type="button" onClick={endRest} className={primary}>
                Skip rest
              </button>
              <button type="button" onClick={() => setEndsAt((e) => (e ?? Date.now()) + 15_000)} className={outline}>
                +15 seconds
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-base font-semibold text-accent">
              Exercise {state.index + 1} of {items.length}
              {doneIds.has(item.id) && " · already done ✓"}
            </p>
            <h2 className="mt-1 text-3xl font-bold">{item.name}</h2>
            <p className="mt-2 text-xl font-medium text-accent-dark">
              Set {state.set} of {item.sets}: {item.unit === "seconds" ? `hold for ${item.reps} seconds` : `${item.reps} reps`}
            </p>
            <p className="mt-4">
              <strong>How to do it: </strong>
              {item.howTo}
            </p>

            {state.phase === "holding" ? (
              <div className="mt-8 text-center">
                <p className="text-base text-muted">Hold…</p>
                <p role="timer" className="font-mono text-7xl font-bold text-accent-dark">
                  {formatClock(remaining)}
                </p>
                <button type="button" onClick={finishSet} className={`${outline} mt-6`}>
                  I stopped early
                </button>
              </div>
            ) : (
              <div className="mt-8">
                {item.unit === "seconds" ? (
                  <button type="button" onClick={startHold} className={primary}>
                    Start {item.reps}-second hold
                  </button>
                ) : (
                  <button type="button" onClick={finishSet} className={primary}>
                    I finished set {state.set}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {saveError && (
        <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-amber-900">
          We could not save a tick just now. You can mark it done later on the Plan page.
        </p>
      )}

      {state.phase !== "complete" && (
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button
            type="button"
            onClick={() => jump("prev")}
            disabled={state.index === 0}
            className="rounded-full border-2 border-gray-500 px-5 py-2 text-base font-medium disabled:opacity-40"
          >
            ← Previous exercise
          </button>
          <button type="button" onClick={() => jump("next")} className="rounded-full border-2 border-gray-500 px-5 py-2 text-base font-medium">
            Skip to next exercise →
          </button>
        </div>
      )}

      {/* The whole list, so you can see where you are */}
      <ol className="mt-8 space-y-1 text-base">
        {items.map((it, i) => (
          <li key={it.id} className={i === state.index && state.phase !== "complete" ? "font-semibold text-ink" : "text-muted"}>
            {doneIds.has(it.id) ? "✓" : `${i + 1}.`} {it.name} <span className="text-muted">({it.target})</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted">Move slowly and stop if anything hurts.</p>
    </div>
  );
}
