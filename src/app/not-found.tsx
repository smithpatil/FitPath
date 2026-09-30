import ButtonLink from "@/components/Button";

export const metadata = { title: "Page not found — FitPath" };

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl font-bold text-accent" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold">We could not find that page</h1>
      <p className="mt-3 text-muted">The link may be old or mistyped. Let&apos;s get you back on track.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/dashboard">Go to today&apos;s workout</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Home page
        </ButtonLink>
      </div>
    </main>
  );
}
