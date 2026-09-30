// The six onboarding questions, and a checker for the answers.
// Kept free of React/database code so it can be unit-tested.
import type { Equipment, Level, Limitation } from "./math/types";

export type Goal = "lose_weight" | "build_strength" | "stay_active";

export interface Answers {
  goal: Goal;
  level: Level;
  days: number;
  minutes: number;
  /** Extra equipment the user owns. "bodyweight" is always available, so it is not listed. */
  equipment: Equipment[];
  limitations: Limitation[];
}

export interface Option<T> {
  value: T;
  label: string;
  hint?: string;
}

export const GOALS: Option<Goal>[] = [
  { value: "lose_weight", label: "Lose weight", hint: "Burn more energy and feel lighter." },
  { value: "build_strength", label: "Get stronger", hint: "Build muscle and feel powerful." },
  { value: "stay_active", label: "Feel healthier", hint: "Move more and have more energy every day." },
];

export const LEVELS: Option<Level>[] = [
  { value: "beginner", label: "I am new to exercise", hint: "We will keep every move simple and gentle." },
  { value: "some_experience", label: "I have exercised before", hint: "We can include some harder moves." },
];

export const DAY_OPTIONS = [2, 3, 4, 5, 6];
export const MINUTE_OPTIONS = [15, 20, 30, 45, 60];

export const EQUIPMENT: Option<Equipment>[] = [
  { value: "gym", label: "I go to a gym", hint: "A full gym: machines, cables, barbells, dumbbells and more." },
  { value: "dumbbells", label: "Dumbbells", hint: "Small hand weights." },
  { value: "resistance_band", label: "Resistance bands", hint: "Stretchy elastic bands." },
  { value: "pull_up_bar", label: "Pull-up bar", hint: "A bar you can hang from." },
];

export const LIMITATIONS: Option<Limitation>[] = [
  { value: "knee", label: "Knees" },
  { value: "lower_back", label: "Lower back" },
  { value: "shoulder", label: "Shoulders" },
  { value: "wrist", label: "Wrists" },
];

export type ValidationResult = { ok: true; data: Answers } | { ok: false; error: string };

const values = <T>(opts: Option<T>[]) => opts.map((o) => o.value);

/** Check untrusted input (from the browser) and return clean answers. */
export function validateAnswers(input: unknown): ValidationResult {
  const bad = (error: string): ValidationResult => ({ ok: false, error });
  if (typeof input !== "object" || input === null) return bad("Missing answers.");
  const a = input as Record<string, unknown>;

  if (!values(GOALS).includes(a.goal as Goal)) return bad("Please choose a goal.");
  if (!values(LEVELS).includes(a.level as Level)) return bad("Please choose your experience level.");
  if (!DAY_OPTIONS.includes(a.days as number)) return bad("Please choose how many days per week.");
  if (!MINUTE_OPTIONS.includes(a.minutes as number)) return bad("Please choose how many minutes you have.");

  const list = (x: unknown): unknown[] | null => (Array.isArray(x) ? x : null);
  const eq = list(a.equipment);
  const lim = list(a.limitations);
  if (!eq || !eq.every((e) => values(EQUIPMENT).includes(e as Equipment))) return bad("Unknown equipment.");
  if (!lim || !lim.every((l) => values(LIMITATIONS).includes(l as Limitation))) return bad("Unknown limitation.");

  return {
    ok: true,
    data: {
      goal: a.goal as Goal,
      level: a.level as Level,
      days: a.days as number,
      minutes: a.minutes as number,
      // A gym has everything, so choosing it replaces the other choices.
      equipment: (eq as Equipment[]).includes("gym") ? ["gym"] : [...new Set(eq as Equipment[])],
      limitations: [...new Set(lim as Limitation[])],
    },
  };
}
