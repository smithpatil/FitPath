import Logo from "@/components/Logo";

// Shared layout for login, sign-up and "already logged in": just the form, centred on the page.
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="flex min-h-screen flex-1 items-center justify-center bg-accent-soft px-4 py-10 outline-none">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-hero bg-white p-6 shadow-lift ring-1 ring-gray-100 sm:p-10">{children}</div>
        <p className="mt-6 text-center text-sm text-muted">General fitness guidance, not medical advice.</p>
      </div>
    </main>
  );
}
