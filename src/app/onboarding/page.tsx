import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import OnboardingFlow from "./OnboardingFlow";

export const metadata = { title: "Your questions — FitPath" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const profile = await getProfile(supabase); // pre-fills answers if they are redoing it
  return (
    <main id="main" tabIndex={-1} className="mx-auto w-full max-w-xl flex-1 px-4 py-8 outline-none">
      <OnboardingFlow initial={profile} />
    </main>
  );
}
