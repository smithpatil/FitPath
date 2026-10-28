import AthleteArt from "@/components/art/AthleteArt";
import Icon, { type IconName } from "@/components/Icon";
import Logo from "@/components/Logo";

const POINTS: { icon: IconName; text: string }[] = [
  { icon: "target", text: "A weekly plan built for you" },
  { icon: "timer", text: "Guided workouts with timers" },
  { icon: "flame", text: "Streaks and progress that motivate" },
];

// Shared layout for login, sign-up and "already logged in": an illustrated panel beside the form.
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="grid min-h-screen flex-1 outline-none lg:grid-cols-2">
      {/* Illustrated panel (desktop) */}
      <aside className="on-deep relative hidden overflow-hidden bg-gradient-to-br from-deep via-[#064e4a] to-accent p-12 text-white lg:flex lg:flex-col lg:justify-between lg:gap-10">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-spark/10 blur-3xl" />
        <Logo light className="relative" />
        <div className="relative">
          <AthleteArt tone="dark" className="mx-auto w-full max-w-sm" />
          <h2 className="mt-4 text-center text-4xl font-extrabold leading-tight">
            Train smart. Feel <span className="text-spark">stronger.</span>
          </h2>
          <ul className="mx-auto mt-6 max-w-sm space-y-3">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-lg text-ice">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-spark ring-1 ring-white/20">
                  <Icon name={p.icon} className="h-5 w-5" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-ice">General fitness guidance, not medical advice.</p>
      </aside>

      <section className="flex flex-col">
        {/* Banner (phones and tablets) */}
        <div className="on-deep relative overflow-hidden bg-gradient-to-br from-deep via-[#064e4a] to-accent px-6 pb-10 pt-6 text-white lg:hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-spark/15 blur-3xl" />
          <Logo light className="relative" />
          <p className="relative mt-6 text-3xl font-extrabold leading-tight">
            Train smart.
            <br />
            Feel <span className="text-spark">stronger.</span>
          </p>
        </div>

        <div className="-mt-5 flex flex-1 flex-col justify-center rounded-t-3xl bg-white px-6 py-10 sm:px-12 lg:mt-0 lg:rounded-none">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </section>
    </main>
  );
}
