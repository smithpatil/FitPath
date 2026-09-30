import { redirect } from "next/navigation";
import CoachButton from "@/components/CoachButton";
import Navbar from "@/components/Navbar";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

// Layout for all signed-in pages: navbar on top, centred content below.
// New users who have not answered the onboarding questions are sent there first.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const profile = await getProfile(supabase);
  if (!profile) redirect("/onboarding");

  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 pb-24 outline-none">{children}</main>
      <CoachButton />
    </>
  );
}
