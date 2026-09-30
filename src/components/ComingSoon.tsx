// Temporary placeholder shown until a page is built in a later phase.
export default function ComingSoon({ title, phase }: { title: string; phase: number }) {
  return (
    <section>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4 text-muted">This page will be built in Phase {phase}.</p>
    </section>
  );
}
