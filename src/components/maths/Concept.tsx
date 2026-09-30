// Layout for one maths concept: plain-words definition, the formula/diagram, then live data.
export default function Concept({
  id,
  number,
  title,
  where,
  simple,
  formula,
  children,
}: {
  id: string;
  number: number;
  title: string;
  /** Where the app uses it, in one short sentence. */
  where: string;
  simple: React.ReactNode;
  formula: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-6 border-t-2 border-gray-200 pt-10">
      <p className="text-base font-semibold text-accent">Concept {number} of 7</p>
      <h2 id={`${id}-h`} className="mt-1 text-3xl font-bold">
        {title}
      </h2>
      <p className="mt-2 text-muted">
        <strong className="text-ink">Where FitPath uses it:</strong> {where}
      </p>

      <h3 className="mt-6 text-xl font-semibold">In simple words</h3>
      <div className="mt-2 space-y-3">{simple}</div>

      <h3 className="mt-6 text-xl font-semibold">The formula or diagram</h3>
      <div className="mt-2 space-y-3">{formula}</div>

      <h3 className="mt-6 text-xl font-semibold">Your own numbers</h3>
      <div className="mt-2 space-y-4 rounded-2xl bg-accent-soft p-5">{children}</div>
    </section>
  );
}

/** A boxed formula line. */
export function Formula({ children }: { children: React.ReactNode }) {
  return <p className="overflow-x-auto rounded-xl bg-gray-100 px-4 py-3 font-mono text-base leading-relaxed">{children}</p>;
}

/** A small rounded label, used for set elements. */
export function Chip({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "strong" | "muted" }) {
  const styles = {
    plain: "bg-white border-gray-300",
    strong: "bg-accent text-white border-accent",
    muted: "bg-gray-100 text-muted border-gray-200 line-through",
  }[tone];
  return <span className={`inline-block rounded-full border px-3 py-1 text-base ${styles}`}>{children}</span>;
}
