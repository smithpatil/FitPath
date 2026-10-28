import Link from "next/link";
import Logo from "@/components/Logo";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import FormatPicker from "./FormatPicker";

export const metadata = { title: "Choose your workout — FitPath" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const profile = await getProfile(supabase); // set when someone is changing their style
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Logo href={profile ? "/dashboard" : "/"} />
        {profile && (
          <Link href="/dashboard" className="rounded-full border-2 border-gray-200 px-5 py-2 text-base font-bold transition-colors hover:border-accent hover:text-accent">
            Back to Today
          </Link>
        )}
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 outline-none">
        <FormatPicker saved={profile} />
      </main>
    </>
  );
}
