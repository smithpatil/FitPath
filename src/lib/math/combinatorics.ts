// 5. COMBINATORICS AND THE PIGEONHOLE PRINCIPLE
//
// C(n, k) = n! / (k! (n−k)!)  counts the ways to CHOOSE k things from n when order does not matter.
// Example: choosing 3 training days out of 7 can be done in C(7,3) = 35 ways.
// If separate choices are made one after another, the counts MULTIPLY (product rule).
//
// PIGEONHOLE PRINCIPLE: if you put more than m items into m boxes, some box holds at least 2.
// More precisely, some box holds at least ⌈items / boxes⌉.
// We use BigInt because these counts get very large, very quickly.

export function factorial(n: number): bigint {
  if (!Number.isInteger(n) || n < 0) throw new RangeError("n must be a non-negative integer");
  let result = 1n;
  for (let i = 2; i <= n; i++) result *= BigInt(i);
  return result;
}

/** C(n, k): the number of ways to choose k items from n. Returns 0 if k > n. */
export function choose(n: number, k: number): bigint {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0)
    throw new RangeError("n and k must be non-negative integers");
  if (k > n) return 0n;
  const kk = Math.min(k, n - k); // C(n,k) = C(n,n-k), so use the smaller one
  let result = 1n;
  for (let i = 1; i <= kk; i++) {
    // Multiplying first, then dividing, keeps every step an exact whole number.
    result = (result * BigInt(n - kk + i)) / BigInt(i);
  }
  return result;
}

export interface DayPool {
  /** How many usable exercises could be picked for this day. */
  available: number;
  /** How many of them the plan picks. */
  picks: number;
}

/** Number of possible weekly plans = product over days of C(available, picks). */
export function countWeeklyPlans(days: DayPool[]): bigint {
  return days.reduce((total, d) => total * choose(d.available, d.picks), 1n);
}

export interface PigeonholeResult {
  items: number;
  boxes: number;
  /** True when items > boxes, so at least one box must hold 2 or more. */
  repeatForced: boolean;
  /** Some box is guaranteed to hold at least this many: ⌈items / boxes⌉. */
  atLeastInSomeBox: number;
}

export function pigeonhole(items: number, boxes: number): PigeonholeResult {
  if (boxes < 1) throw new RangeError("boxes must be at least 1");
  return {
    items,
    boxes,
    repeatForced: items > boxes,
    atLeastInSomeBox: Math.ceil(items / boxes),
  };
}
