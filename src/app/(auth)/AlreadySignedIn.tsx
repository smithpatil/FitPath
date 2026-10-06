import Link from "next/link";
import ButtonLink from "@/components/Button";
import { logout } from "./actions";

// Shown on /login and /signup when someone is already logged in, so they get a choice.
export default function AlreadySignedIn({ email }: { email: string }) {
  return (
    <main id="main" tabIndex={-1} className="mx-auto w-full max-w-md flex-1 px-4 py-12 outline-none">
      <Link href="/" className="text-xl font-bold text-accent">
        FitPath
      </Link>
      <h1 className="mt-8 text-3xl font-bold">You are already logged in</h1>
      <p className="mt-3 text-muted">
        Logged in as <strong className="text-ink">{email}</strong>.
      </p>
      <div className="mt-8 flex flex-col gap-4">
        <ButtonLink href="/dashboard">Continue to my workouts</ButtonLink>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-full border-2 border-accent px-8 py-4 text-lg font-semibold text-accent hover:bg-accent-soft"
          >
            Log out and use a different account
          </button>
        </form>
      </div>
    </main>
  );
}
