import ButtonLink from "@/components/Button";
import AuthShell from "./AuthShell";
import { logout } from "./actions";

// Shown on /login and /signup when someone is already logged in, so they get a choice.
export default function AlreadySignedIn({ email }: { email: string }) {
  return (
    <AuthShell>
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight">You are already logged in</h1>
      <p className="mt-3 text-muted">
        Logged in as <strong className="text-ink">{email}</strong>.
      </p>
      <div className="mt-8 flex flex-col gap-4">
        <ButtonLink href="/dashboard" arrow>
          Continue to my workouts
        </ButtonLink>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-full border-2 border-accent px-8 py-4 text-lg font-bold text-deep transition-colors hover:bg-accent-soft"
          >
            Log out and use a different account
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
