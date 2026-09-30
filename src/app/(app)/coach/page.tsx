import { getCurrentWeek } from "@/lib/planStore";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import CoachChat from "./CoachChat";

export const metadata = { title: "Ask the coach — FitPath" };

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = (await getProfile(supabase))!;
  const week = await getCurrentWeek(supabase, user!.id, profile);
  const sample = week.days[0]?.items[0]?.exercise.name;

  const suggestions = [
    "Can I swap an exercise?",
    "What does reps mean?",
    "How often should I rest?",
    ...(sample ? [`How do I do ${sample}?`] : []),
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Ask the coach</h1>
      <p className="mt-2 text-muted">Ask simple questions about your plan or getting started. The coach explains and encourages.</p>

      <div className="mt-6 rounded-2xl bg-accent-soft p-5 text-base text-accent-dark">
        <p>
          <strong>Please note:</strong> the coach is an AI helper, not a doctor or a dietitian. It cannot give medical or diet advice. If you
          have pain, an injury or a health condition, check with a doctor or physio. The coach cannot change your plan: use{" "}
          <strong>Swap exercise</strong> on the Plan page for that.
        </p>
        <p className="mt-2">Your questions and a short summary of your plan are sent to Groq, the AI service that writes the answers.</p>
      </div>

      <CoachChat suggestions={suggestions} />
    </div>
  );
}
