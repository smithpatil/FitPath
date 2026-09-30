import type { SafetyRule, TruthRow } from "@/lib/math/logic";

const tf = (b: boolean) => (b ? "T" : "F");

// Truth table for a rule "(p ∧ q) → exclude". The one row where the rule is FALSE is highlighted.
export default function TruthTable({ rule, rows }: { rule: SafetyRule; rows: TruthRow[] }) {
  const cols = [...rule.premises, "exclude"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-center text-base">
        <caption className="mb-2 text-left text-muted">
          T = true, F = false. The last column is the value of the whole rule.
        </caption>
        <thead>
          <tr className="bg-white">
            {cols.map((c) => (
              <th key={c} scope="col" className="border border-gray-300 px-3 py-2 font-mono">
                {c}
              </th>
            ))}
            <th scope="col" className="border border-gray-300 px-3 py-2 font-mono">
              {rule.premises.join(" ∧ ")}
            </th>
            <th scope="col" className="border border-gray-300 px-3 py-2 font-mono">
              rule
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={r.result ? "bg-white" : "bg-red-50 font-semibold"}>
              {cols.map((c) => (
                <td key={c} className="border border-gray-300 px-3 py-2 font-mono">
                  {tf(r.values[c])}
                </td>
              ))}
              <td className="border border-gray-300 px-3 py-2 font-mono">{tf(r.antecedent)}</td>
              <td className="border border-gray-300 px-3 py-2 font-mono">
                {tf(r.result)}
                {!r.result && <span className="ml-1 font-sans text-sm text-red-800">(broken)</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
