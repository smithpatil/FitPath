// There is no separate landing page: opening the website shows the login form.
// If you are already logged in, you get a choice to continue or to log in as someone else.
import { getUserEmail } from "@/lib/supabase/user";
import AlreadySignedIn from "./(auth)/AlreadySignedIn";
import AuthForm from "./(auth)/AuthForm";
import { login } from "./(auth)/actions";

export const metadata = { title: "Log in — FitPath" };

export default async function Home() {
  const email = await getUserEmail();
  if (email) return <AlreadySignedIn email={email} />;
  return <AuthForm mode="login" action={login} />;
}
