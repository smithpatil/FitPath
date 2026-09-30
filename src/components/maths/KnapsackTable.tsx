import type { KnapsackItem, KnapsackResult } from "@/lib/math/knapsack";

// The dynamic-programming table. Row i = "using only the first i exercises".
// Column t = "with t minutes available". Each cell = best total benefit.
export default function KnapsackTable({
  items,
  result,
  capacity,
}: {
  items: (KnapsackItem & { name: string })[];
  result: KnapsackResult;
  capacity: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-center text-sm">
        <caption className="mb-2 text-left text-base text-muted">
          Columns are minutes available (0 to {capacity}). The bottom-right cell is the answer.
        </caption>
        <thead>
          <tr className="bg-white">
            <th scope="col" className="sticky left-0 border border-gray-300 bg-white px-2 py-1 text-left">
              Exercises allowed
            </th>
            {Array.from({ length: capacity + 1 }, (_, t) => (
              <th key={t} scope="col" className="border border-gray-300 px-2 py-1 font-mono">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.table.map((row, i) => {
            const chosen = i > 0 && result.chosenIds.includes(items[i - 1].id);
            return (
              <tr key={i} className="bg-white">
                <th scope="row" className="sticky left-0 border border-gray-300 bg-white px-2 py-1 text-left font-normal">
                  {i === 0 ? (
                    "none"
                  ) : (
                    <>
                      + {items[i - 1].name}{" "}
                      <span className="text-muted">
                        ({items[i - 1].weight} min, benefit {items[i - 1].value})
                      </span>
                      {chosen && <strong className="ml-1 text-accent">✓ taken</strong>}
                    </>
                  )}
                </th>
                {row.map((v, t) => {
                  const answer = i === items.length && t === capacity;
                  return (
                    <td
                      key={t}
                      className={`border border-gray-300 px-2 py-1 font-mono ${answer ? "bg-accent font-bold text-white" : ""}`}
                    >
                      {v}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
