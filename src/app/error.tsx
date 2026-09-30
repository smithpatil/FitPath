"use client";

import Link from "next/link";

// Shown if something unexpected breaks on a page. No technical details are shown to the user.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-muted">It was not your fault. Please try again. If it keeps happening, come back in a little while.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white hover:bg-accent-dark"
        >
          Try again
        </button>
        <Link href="/" className="rounded-full border-2 border-accent px-8 py-4 text-lg font-semibold text-accent hover:bg-accent-soft">
          Home page
        </Link>
      </div>
    </main>
  );
}
