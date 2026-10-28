"use client";

import Link from "next/link";
import { useActionState } from "react";
import Icon from "@/components/Icon";
import AuthShell from "./AuthShell";
import type { AuthState } from "./actions";

const FIELD =
  "mt-2 w-full rounded-2xl border-2 border-gray-300 bg-white px-4 py-3.5 text-ink placeholder:text-gray-500 hover:border-gray-400 focus-visible:border-accent";

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
    <AuthShell>
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight">{isLogin ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-muted">{isLogin ? "Log in to see today's workout." : "It takes less than a minute."}</p>

      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block font-bold">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={FIELD} />
        </div>
        <div>
          <label htmlFor="password" className="block font-bold">
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
            className={FIELD}
          />
          {!isLogin && (
            <p id="pw-hint" className="mt-2 text-base text-muted">
              At least 8 characters.
            </p>
          )}
        </div>

        {/* role="alert" makes screen readers announce the message */}
        {state.error && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-red-800 ring-1 ring-red-200">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="rounded-2xl bg-accent-soft px-4 py-3 text-deep ring-1 ring-accent/20">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
          {!pending && <Icon name="arrow-right" className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
        </button>
      </form>

      <p className="mt-8 text-muted">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-bold text-deep underline underline-offset-4">
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </AuthShell>
  );
}
