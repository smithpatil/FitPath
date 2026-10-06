import { getUserEmail } from "@/lib/supabase/user";
import AlreadySignedIn from "../AlreadySignedIn";
import AuthForm from "../AuthForm";
import { signup } from "../actions";

export const metadata = { title: "Sign up — FitPath" };

export default async function SignupPage() {
  const email = await getUserEmail();
  if (email) return <AlreadySignedIn email={email} />;
  return <AuthForm mode="signup" action={signup} />;
}
