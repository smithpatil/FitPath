// 6. RECURRENCE RELATIONS AND INDUCTION (progressive overload)
//
// Progressive overload = doing a little more each week so your body keeps improving.
//   W(n) = the target (e.g. reps) in week n.
//   Recurrence:   W(n) = W(n−1) + d      with a start value W(0)
//   Closed form:  W(n) = W(0) + n·d      (jump straight to any week without looping)
//
// PROOF BY INDUCTION that the closed form is right for every n ≥ 0:
//   Base case:  n = 0 →  W(0) = W(0) + 0·d.  ✓
//   Step:       assume W(k) = W(0) + k·d.  Then
//               W(k+1) = W(k) + d = W(0) + k·d + d = W(0) + (k+1)·d.  ✓
//   By induction the formula holds for all n.

/** W(n) by following the recurrence one week at a time. */
export function overloadRecurrence(w0: number, d: number, n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new RangeError("n must be a non-negative integer");
  let w = w0;
  for (let week = 1; week <= n; week++) w = w + d;
  return w;
}

/** W(n) = W(0) + n·d, straight from the closed form. */
export function overloadClosedForm(w0: number, d: number, n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new RangeError("n must be a non-negative integer");
  return w0 + n * d;
}

/** The targets for weeks 0..weeks-1 (uses the closed form). */
export function overloadPlan(w0: number, d: number, weeks: number): number[] {
  return Array.from({ length: weeks }, (_, n) => overloadClosedForm(w0, d, n));
}

export interface InductionProof {
  claim: string;
  base: { lhs: number; rhs: number; holds: boolean; text: string };
  hypothesis: string;
  /** Steps of the inductive step, written with the user's own numbers. */
  stepLines: string[];
  conclusion: string;
  /** Extra sanity check: recurrence and closed form agree for weeks 0..checked. */
  checkedUpTo: number;
  allAgree: boolean;
}

/* ------------------------------------------------------------------------------------------
 * ADAPTIVE OVERLOAD (uses the user's "too easy / just right / too hard" feedback)
 *
 * Instead of always adding d, week i adds  mᵢ·d,  where the multiplier mᵢ comes from how
 * the PREVIOUS week felt:
 *   mostly "too easy"   → mᵢ = 2   (step up faster)
 *   "just right" / none → mᵢ = 1   (normal step)
 *   mostly "too hard"   → mᵢ = 0   (hold: same numbers again)
 *
 *   Recurrence:   W(n) = W(n−1) + mₙ·d
 *   Closed form:  W(n) = W(0) + d·S(n),   where S(n) = m₁ + m₂ + … + mₙ   (a summation)
 *   Bounds:       since 0 ≤ mᵢ ≤ 2,   W(0) ≤ W(n) ≤ W(0) + 2·n·d
 * The fixed plan is the special case where every mᵢ = 1, so S(n) = n.
 * ------------------------------------------------------------------------------------------ */

export type Feeling = "easy" | "right" | "hard";

/** One week's multiplier from that week's answers: easy counts +1, hard −1, then look at the sign. */
export function stepMultiplier(feelings: Feeling[]): 0 | 1 | 2 {
  const score = feelings.reduce((s, f) => s + (f === "easy" ? 1 : f === "hard" ? -1 : 0), 0);
  return score > 0 ? 2 : score < 0 ? 0 : 1;
}

/**
 * Multipliers m₁..mₙ for weeks 1..n. feelingsByWeek[i] holds the answers given in week i,
 * and they decide m for the FOLLOWING week (i + 1).
 */
export function multipliersFromFeedback(feelingsByWeek: Feeling[][], n: number): number[] {
  return Array.from({ length: Math.max(0, n) }, (_, i) => stepMultiplier(feelingsByWeek[i] ?? []));
}

/** S(n) = m₁ + … + mₙ: the number of "normal steps" taken so far. */
export const stepSum = (multipliers: number[]): number => multipliers.reduce((s, m) => s + m, 0);

/** W(0), W(1), …, W(n) by following the adaptive recurrence one week at a time. */
export function adaptiveSequence(w0: number, d: number, multipliers: number[]): number[] {
  const out = [w0];
  for (const m of multipliers) out.push(out[out.length - 1] + m * d);
  return out;
}

/** W(n) = W(0) + d·S(n), straight from the closed form. */
export const adaptiveClosedForm = (w0: number, d: number, multipliers: number[]): number => w0 + d * stepSum(multipliers);

/** Induction proof of the adaptive closed form, written with the user's numbers and checked. */
export function adaptiveInductionProof(w0: number, d: number, multipliers: number[]): InductionProof {
  const seq = adaptiveSequence(w0, d, multipliers);
  let allAgree = true;
  for (let n = 0; n < seq.length; n++) if (seq[n] !== adaptiveClosedForm(w0, d, multipliers.slice(0, n))) allAgree = false;
  return {
    claim: `For every week n ≥ 0:  W(n) = ${w0} + ${d}·S(n),  where S(n) = m₁ + … + mₙ`,
    base: {
      lhs: w0,
      rhs: w0,
      holds: true,
      text: `Base case (n = 0): no weeks have passed, so S(0) = 0 and ${w0} + ${d}·0 = ${w0} = W(0).`,
    },
    hypothesis: `Assume it is true for some week k:  W(k) = ${w0} + ${d}·S(k).`,
    stepLines: [
      `W(k+1) = W(k) + m(k+1)·${d}               (the adaptive recurrence)`,
      `       = ${w0} + ${d}·S(k) + ${d}·m(k+1)        (using the assumption)`,
      `       = ${w0} + ${d}·(S(k) + m(k+1))`,
      `       = ${w0} + ${d}·S(k+1)                (definition of S)`,
      "That is exactly the formula for week k+1.",
    ],
    conclusion:
      "True for week 0, and true for k+1 whenever true for k, so true for every week. Because every m is 0, 1 or 2, the target can never go down and never rises more than twice the normal speed.",
    checkedUpTo: multipliers.length,
    allAgree,
  };
}

/** Build the induction proof with concrete numbers, and verify it for weeks 0..checkUpTo. */
export function inductionProof(w0: number, d: number, checkUpTo = 12): InductionProof {
  let allAgree = true;
  for (let n = 0; n <= checkUpTo; n++)
    if (overloadRecurrence(w0, d, n) !== overloadClosedForm(w0, d, n)) allAgree = false;
  const lhs = overloadRecurrence(w0, d, 0);
  const rhs = overloadClosedForm(w0, d, 0);
  return {
    claim: `For every week n ≥ 0:  W(n) = ${w0} + n·${d}`,
    base: {
      lhs,
      rhs,
      holds: lhs === rhs,
      text: `Base case (n = 0): W(0) = ${w0}, and ${w0} + 0·${d} = ${rhs}. They match.`,
    },
    hypothesis: `Assume it is true for some week k:  W(k) = ${w0} + k·${d}.`,
    stepLines: [
      `W(k+1) = W(k) + ${d}          (the recurrence)`,
      `       = (${w0} + k·${d}) + ${d}   (using the assumption)`,
      `       = ${w0} + (k+1)·${d}     (collect the ${d}s)`,
      "That is exactly the formula for week k+1.",
    ],
    conclusion: "So if it is true for week k it is true for week k+1. Since it is true for week 0, it is true for every week.",
    checkedUpTo: checkUpTo,
    allAgree,
  };
}
