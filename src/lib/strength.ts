// Logged results and weight suggestions.
//
// DOUBLE PROGRESSION (a piecewise recurrence on the weight you lift):
//   W(n+1) = W(n) + Δ   if last time you managed all the target reps
//   W(n+1) = W(n)       otherwise (stay at this weight until you do)
// Δ is one small step: 2 kg or 5 lb. Reps rise with the plan's own recurrence; the weight only
// rises once the reps are achieved, so the two never both jump at once.
import type { Exercise } from "./math/types";
import { fromKg, type Unit } from "./units";

/** Exercises where a weight makes sense: rep-based moves with dumbbells or gym machines/barbells. */
export const isWeighted = (ex: Pick<Exercise, "unit" | "equipment">): boolean =>
  ex.unit === "reps" && ex.equipment.some((q) => q === "dumbbells" || q === "gym");

/** One small step on the weight, in the user's own unit. */
export const WEIGHT_STEP: Record<Unit, number> = { kg: 2, lb: 5 };

/** The piecewise recurrence above. All values in the user's unit. */
export function suggestNextWeight(lastWeight: number, repsDone: number | null, targetReps: number | null, step: number): number {
  const managedAll = repsDone !== null && targetReps !== null && repsDone >= targetReps;
  return Math.round((managedAll ? lastWeight + step : lastWeight) * 10) / 10;
}

export interface LoggedResult {
  exerciseId: string;
  weightKg: number | null;
  /** Reps per set, seconds held, or minutes (matching the exercise's unit). */
  amount: number | null;
  /** The plan's target for that day, so we can tell if all reps were managed. */
  target: number | null;
  date: string;
}

/** The heaviest weight logged for each exercise (the earliest date wins a tie), newest first. */
export function personalBests(logs: LoggedResult[]): { exerciseId: string; weightKg: number; date: string }[] {
  const best = new Map<string, { exerciseId: string; weightKg: number; date: string }>();
  for (const l of logs) {
    if (l.weightKg === null) continue;
    const b = best.get(l.exerciseId);
    if (!b || l.weightKg > b.weightKg || (l.weightKg === b.weightKg && l.date < b.date)) {
      best.set(l.exerciseId, { exerciseId: l.exerciseId, weightKg: l.weightKg, date: l.date });
    }
  }
  return [...best.values()].sort((a, b) => b.date.localeCompare(a.date) || b.weightKg - a.weightKg);
}

const UNIT_WORD: Record<Exercise["unit"], string> = { reps: "reps", seconds: "seconds", minutes: "minutes" };

/** "10 kg × 10 reps", "12 reps", "30 seconds" … for showing a logged result. */
export function describeResult(r: Pick<LoggedResult, "amount" | "weightKg">, unit: Exercise["unit"], units: Unit): string {
  const amount = r.amount === null ? "" : `${r.amount} ${UNIT_WORD[unit]}`;
  if (r.weightKg === null) return amount;
  const w = `${fromKg(r.weightKg, units)} ${units}`;
  return amount ? `${w} × ${amount}` : w;
}

/** Suggested weight for today from the last weighted result (null when there is nothing to go on). */
export function suggestionFor(last: LoggedResult | undefined, units: Unit): number | null {
  if (!last || last.weightKg === null) return null;
  return suggestNextWeight(fromKg(last.weightKg, units), last.amount, last.target, WEIGHT_STEP[units]);
}

/** Check a typed amount: a whole number from 1 to 1000, or empty (= not given). */
export function parseAmount(text: string): number | null | "invalid" {
  const t = text.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : "invalid";
}

/** Check a typed weight in the user's unit: above 0 and at most 500, or empty. Accepts "7,5". */
export function parseWeight(text: string): number | null | "invalid" {
  const t = text.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 && n <= 500 ? n : "invalid";
}
