import { createClient } from "./server";

/** The logged-in user's email, or null if nobody is logged in (never throws, so public pages stay up). */
export async function getUserEmail(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ? (user.email ?? "your account") : null;
  } catch {
    return null;
  }
}
