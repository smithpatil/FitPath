import AuthForm from "../AuthForm";
import { signup } from "../actions";

export const metadata = { title: "Sign up — FitPath" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
