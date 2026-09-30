import AuthForm from "../AuthForm";
import { login } from "../actions";

export const metadata = { title: "Log in — FitPath" };

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
