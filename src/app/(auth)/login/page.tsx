import { getUserEmail } from "@/lib/supabase/user";
import AlreadySignedIn from "../AlreadySignedIn";
import AuthForm from "../AuthForm";
import { login } from "../actions";

export const metadata = { title: "Log in — FitPath" };

export default async function LoginPage() {
  const email = await getUserEmail();
  if (email) return <AlreadySignedIn email={email} />;
  return <AuthForm mode="login" action={login} />;
}
