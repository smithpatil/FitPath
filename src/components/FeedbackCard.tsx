import { saveFeeling } from "@/app/(app)/actions";
import type { Feeling } from "@/lib/math/recurrence";

const OPTIONS: { value: Feeling; label: string }[] = [
  { value: "easy", label: "Too easy" },
  { value: "right", label: "Just right" },
  { value: "hard", label: "Too hard" },
];

const THANKS: Record<Feeling, string> = {
  easy: "Great! This counts towards making next week's numbers go up a little faster.",
  right: "Perfect. Next week's numbers will go up by the normal small step.",
  hard: "Thanks for telling us. This counts towards keeping next week's numbers the same, so you can settle in.",
};

// Shown when every exercise of a workout day is done. One tap saves the answer (and it can be changed).
export default function FeedbackCard({ planId, day, feeling }: { planId: string; day: number; feeling?: Feeling }) {
  return (
    <section aria-labelledby={`feel-${day}`} className="mt-6 rounded-2xl border-2 border-accent bg-accent-soft p-5">
      <h3 id={`feel-${day}`} className="text-xl font-semibold text-accent-dark">
        Well done! How did this workout feel?
      </h3>
      <form action={saveFeeling} className="mt-4 flex flex-wrap gap-3">
        <input type="hidden" name="planId" value={planId} />
        <input type="hidden" name="day" value={day} />
        {OPTIONS.map((o) => {
          const chosen = feeling === o.value;
          return (
            <button
              key={o.value}
              type="submit"
              name="feeling"
              value={o.value}
              aria-pressed={chosen}
              className={`rounded-full border-2 px-6 py-3 text-base font-semibold ${
                chosen ? "border-accent bg-accent text-white" : "border-accent bg-white text-accent hover:bg-accent-soft"
              }`}
            >
              {chosen && <span aria-hidden="true">✓ </span>}
              {o.label}
            </button>
          );
        })}
      </form>
      {feeling ? (
        <p role="status" className="mt-4">
          {THANKS[feeling]}
        </p>
      ) : (
        <p className="mt-4 text-base text-muted">
          Your answer shapes next week: too easy → numbers rise faster, just right → normal step, too hard → same numbers again.
        </p>
      )}
      {feeling === "hard" && (
        <p className="mt-2 text-base text-muted">If anything hurt, stop that exercise and check with a doctor or physio.</p>
      )}
    </section>
  );
}
