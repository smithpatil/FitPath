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
