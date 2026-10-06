// 2. PROPOSITIONAL LOGIC
//
// A proposition is a statement that is either true or false (e.g. "the user has a knee problem").
// An implication  P → Q  ("if P then Q")  is false ONLY when P is true and Q is false.
//
// Each safety rule is an implication:   (p1 ∧ p2 ∧ ...) → exclude
// "exclude" means "do not put this exercise in the plan". Example:
//   (knee ∧ high_impact) → exclude

import type { Exercise, Limitation, Level, UserProfile } from "./types";

/** The true/false statements ("atoms") our rules talk about. */
export type Atom =
  | Limitation // user facts: knee, lower_back, shoulder, wrist
  | "beginner" // user fact
  | "high_impact" // exercise facts
  | "hard"
  | "knee_load"
  | "spine_load"
  | "overhead"
  | "wrist_load";

export type Valuation = Partial<Record<Atom, boolean>>;

export interface SafetyRule {
  id: string;
  /** Plain-English explanation shown to the user. */
  why: string;
  /** All of these must be true (they are joined with ∧) for the rule to fire. */
  premises: Atom[];
}

export const SAFETY_RULES: SafetyRule[] = [
  { id: "R1", premises: ["knee", "high_impact"], why: "Jumping puts a lot of force through the knees." },
  { id: "R2", premises: ["knee", "knee_load"], why: "Deep knee bending can bother a sore knee." },
  { id: "R3", premises: ["lower_back", "spine_load"], why: "Some moves put extra strain on the lower back." },
  { id: "R4", premises: ["shoulder", "overhead"], why: "Lifting arms overhead can bother a sore shoulder." },
  { id: "R5", premises: ["wrist", "wrist_load"], why: "Some moves put your weight through your wrists." },
  { id: "R6", premises: ["beginner", "hard"], why: "Hard moves are best left until you have built a base." },
];

/** P → Q is false only when P is true and Q is false. */
export const implies = (p: boolean, q: boolean): boolean => !p || q;

const val = (v: Valuation, a: Atom): boolean => v[a] === true;

/** Does the rule's condition (p1 ∧ p2 ∧ ...) hold? If so the rule forces "exclude". */
export function ruleFires(rule: SafetyRule, v: Valuation): boolean {
  return rule.premises.every((a) => val(v, a));
}

export function firedRules(v: Valuation): SafetyRule[] {
  return SAFETY_RULES.filter((r) => ruleFires(r, v));
}

/** An exercise is excluded when at least one rule fires. */
export const isExcluded = (v: Valuation): boolean => firedRules(v).length > 0;

/** Turn one user + one exercise into the true/false facts the rules use. */
export function valuationFor(
  user: { level: Level; limitations: Limitation[] },
  ex: Pick<Exercise, "impact" | "tags"> & { difficulty?: Exercise["difficulty"] },
): Valuation {
  const v: Valuation = {
    beginner: user.level === "beginner",
    high_impact: ex.impact === "high",
    hard: ex.difficulty === 3,
  };
  for (const l of user.limitations) v[l] = true;
  for (const t of ex.tags) v[t] = true;
  return v;
}

/** The injury-excluded set: ids of exercises where some safety rule fires. */
export function excludedExerciseIds(all: Exercise[], user: Pick<UserProfile, "level" | "limitations">) {
  return new Set(all.filter((e) => isExcluded(valuationFor(user, e))).map((e) => e.id));
}

export interface TruthRow {
  /** Value of each column, e.g. { knee: true, high_impact: false, exclude: false }. */
  values: Record<string, boolean>;
  /** The "if" part: p1 ∧ p2 ∧ ... */
  antecedent: boolean;
  /** Value of the whole implication (antecedent → exclude). */
  result: boolean;
}

/** Full truth table for one rule: every combination of premises and of "exclude". */
export function truthTable(rule: SafetyRule): TruthRow[] {
  const cols = [...rule.premises, "exclude"];
  const rows: TruthRow[] = [];
  for (let i = 0; i < 2 ** cols.length; i++) {
    // Count from "all true" downwards so the first row reads T T T like textbooks.
    const values: Record<string, boolean> = {};
    cols.forEach((c, j) => {
      values[c] = ((i >> (cols.length - 1 - j)) & 1) === 0;
    });
    const antecedent = rule.premises.every((p) => values[p]);
    rows.push({ values, antecedent, result: implies(antecedent, values.exclude) });
  }
  return rows;
}
