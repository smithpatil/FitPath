"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";

// One simple form used for both log in and sign up.
export default function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isLogin = mode === "login";

  return (
    <main id="main" tabIndex={-1} className="mx-auto w-full max-w-md flex-1 px-4 py-12 outline-none">
      <Link href="/" className="text-xl font-bold text-accent">
        FitPath
      </Link>
      <h1 className="mt-8 text-3xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-muted">
        {isLogin ? "Log in to see today's workout." : "It takes less than a minute."}
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-xl border-2 border-gray-500 px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isLogin ? undefined : 8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            aria-describedby={isLogin ? undefined : "pw-hint"}
            className="mt-1 w-full rounded-xl border-2 border-gray-500 px-4 py-3"
          />
          {!isLogin && (
            <p id="pw-hint" className="mt-1 text-base text-muted">
              At least 8 characters.
            </p>
          )}
        </div>

        {/* role="alert" makes screen readers announce the message */}
        {state.error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-800">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="rounded-xl bg-accent-soft px-4 py-3 text-accent-dark">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-muted">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-semibold text-accent underline">
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </main>
  );
}
