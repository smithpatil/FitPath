// 7. DYNAMIC PROGRAMMING: 0/1 KNAPSACK
//
// Problem: you have T minutes. Each exercise has a time cost (weight) and a benefit (value).
// Pick exercises, each at most once (0 or 1), to get the most total benefit within T minutes.
//
// Dynamic programming solves small sub-problems and reuses their answers:
//   best[i][t] = best total benefit using only the first i exercises with t minutes available
//   best[i][t] = best[i−1][t]                                   if exercise i does not fit
//              = max( best[i−1][t],                             skip exercise i
//                     best[i−1][t − w_i] + v_i )               take exercise i
//   with best[0][t] = 0.
// The answer is best[n][T]. We then walk the table backwards to see WHICH exercises were taken.

export interface KnapsackItem {
  id: string;
  /** Time in whole minutes. */
  weight: number;
  value: number;
}

export interface KnapsackResult {
  bestValue: number;
  chosenIds: string[];
  totalWeight: number;
  /** table[i][t] as defined above, (items+1) rows by (capacity+1) columns, for display. */
  table: number[][];
}

export function knapsack(items: KnapsackItem[], capacity: number): KnapsackResult {
  if (!Number.isInteger(capacity) || capacity < 0) throw new RangeError("capacity must be a non-negative integer");
  for (const it of items)
    if (!Number.isInteger(it.weight) || it.weight < 0) throw new RangeError(`weight of ${it.id} must be a non-negative integer`);

  const n = items.length;
  const table: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    for (let t = 0; t <= capacity; t++) {
      table[i][t] = table[i - 1][t]; // skip it
      if (weight <= t) table[i][t] = Math.max(table[i][t], table[i - 1][t - weight] + value); // or take it
    }
  }

  // Walk back from the bottom-right cell: if the value changed at row i, exercise i was taken.
  const chosenIds: string[] = [];
  let t = capacity;
  for (let i = n; i >= 1; i--) {
    if (table[i][t] !== table[i - 1][t]) {
      chosenIds.push(items[i - 1].id);
      t -= items[i - 1].weight;
    }
  }
  chosenIds.reverse();
  const totalWeight = items.filter((it) => chosenIds.includes(it.id)).reduce((s, it) => s + it.weight, 0);
  return { bestValue: table[n][capacity], chosenIds, totalWeight, table };
}
