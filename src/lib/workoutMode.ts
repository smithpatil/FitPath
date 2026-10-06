// Workout mode: the step-by-step logic, kept free of React so it can be unit-tested.
//
// For each exercise you do its sets one by one. Between sets (and between exercises) there is a
// rest. Timed exercises ("hold for 20 seconds") get a hold countdown instead of counting reps.

export type Phase = "ready" | "holding" | "resting" | "complete";

export interface WorkoutState {
  /** Which exercise (0-based). */
  index: number;
  /** Which set of that exercise is next / in progress (1-based). */
  set: number;
  phase: Phase;
}

export type WorkoutAction =
  | { type: "startHold" } // timed exercise: start the countdown
  | { type: "finishSet" } // reps done, or the hold countdown reached 0
  | { type: "restOver" } // rest timer reached 0, or "Skip rest"
  | { type: "next" } // jump to the next exercise
  | { type: "prev" }; // go back to the previous exercise

export interface Step {
  sets: number;
}

/** Start at the first exercise not done yet (everything done = complete). */
export function initialState(done: boolean[]): WorkoutState {
  const first = done.findIndex((d) => !d);
  return first === -1 ? { index: 0, set: 1, phase: "complete" } : { index: first, set: 1, phase: "ready" };
}

/** True when this "finishSet" completes the exercise (so the app should tick it done). */
export const finishesExercise = (state: WorkoutState, steps: Step[]): boolean =>
  (state.phase === "ready" || state.phase === "holding") && state.set >= steps[state.index].sets;

export function workoutReducer(steps: Step[], state: WorkoutState, action: WorkoutAction): WorkoutState {
  const last = steps.length - 1;
  switch (action.type) {
    case "startHold":
      return state.phase === "ready" ? { ...state, phase: "holding" } : state;
    case "finishSet": {
      if (state.phase !== "ready" && state.phase !== "holding") return state;
      if (state.set < steps[state.index].sets) return { ...state, set: state.set + 1, phase: "resting" }; // rest, then next set
      if (state.index >= last) return { ...state, phase: "complete" }; // that was the very last set
      return { index: state.index + 1, set: 1, phase: "resting" }; // rest, then next exercise
    }
    case "restOver":
      return state.phase === "resting" ? { ...state, phase: "ready" } : state;
    case "next":
      return state.index >= last ? { ...state, phase: "complete" } : { index: state.index + 1, set: 1, phase: "ready" };
    case "prev":
      return { index: Math.max(0, state.index - 1), set: 1, phase: "ready" };
  }
}

/** Rest between sets: a little longer for people with some experience (they do more sets). */
export const restSeconds = (level: "beginner" | "some_experience"): number => (level === "beginner" ? 60 : 90);

/** mm:ss for the timers, e.g. 75 → "1:15". */
export const formatClock = (seconds: number): string =>
  `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.max(0, seconds) % 60).padStart(2, "0")}`;
