import Link from "next/link";
import AthleteArt from "@/components/art/AthleteArt";
import ButtonLink from "@/components/Button";
import Icon, { type IconName } from "@/components/Icon";
import SampleWeek from "@/components/landing/SampleWeek";
import Logo from "@/components/Logo";
import { getUserEmail } from "@/lib/supabase/user";

const STATS: { icon: IconName; big: string; small: string }[] = [
  { icon: "dumbbell", big: "74", small: "exercises" },
  { icon: "clock", big: "15–60", small: "minutes a day" },
  { icon: "home", big: "Home", small: "or gym" },
];

const TRUST: { icon: IconName; text: string }[] = [
  { icon: "smile", text: "No experience needed" },
  { icon: "shield", text: "Safe for sore knees and backs" },
  { icon: "timer", text: "Timers and tracking built in" },
  { icon: "chat", text: "Friendly coach" },
];

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: "target", title: "Tell us about you", text: "Answer 6 quick questions: your goal, your time and your equipment." },
  { icon: "play", title: "Follow your plan", text: "Open Today, press Start workout, and we guide you step by step." },
  { icon: "smile", title: "Tick it. Rate it. Repeat.", text: "Say how it felt, and next week adapts to you." },
];

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: "target", title: "Made for you", text: "A weekly plan for your goal, time and kit." },
  { icon: "timer", title: "Guided workouts", text: "Set counter, hold timer and rest timer." },
  { icon: "chart", title: "See your progress", text: "Weekly chart, best lifts, body weight." },
  { icon: "shield", title: "Safe by design", text: "Risky moves are left out for your sore spots." },
  { icon: "flame", title: "Streaks that stick", text: "Keep a week streak going and feel proud." },
  { icon: "chat", title: "Ask the coach", text: "Simple answers to simple questions." },
];

export default async function Home() {
  const loggedIn = (await getUserEmail()) !== null;
  const cta = loggedIn ? { href: "/dashboard", label: "Go to my workouts" } : { href: "/signup", label: "Get started free" };

  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <Link
          href={loggedIn ? "/dashboard" : "/login"}
          className="rounded-full border-2 border-gray-200 px-5 py-2 text-base font-bold transition-colors hover:border-accent hover:text-accent"
        >
          {loggedIn ? "My workouts" : "Log in"}
        </Link>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 outline-none">
        {/* HERO */}
        <section className="on-deep relative overflow-hidden rounded-hero bg-gradient-to-br from-deep via-[#064e4a] to-accent text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-spark/10 blur-3xl" />
          <div className="relative grid items-center gap-8 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-ice ring-1 ring-white/20">
                <Icon name="bolt" className="h-4 w-4 text-spark" /> Fitness for complete beginners
              </p>
              <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Your workout plan,
                <br />
                <span className="text-spark">built for you.</span>
              </h1>
              <p className="mt-5 max-w-lg text-xl text-ice">6 quick questions. A full week of safe, simple workouts.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ButtonLink href={cta.href} variant="spark" arrow>
                  {cta.label}
                </ButtonLink>
                <Link
                  href="#how"
                  className="rounded-full px-6 py-4 text-lg font-bold text-white ring-2 ring-white/40 transition-colors hover:bg-white/10"
                >
                  See how it works
                </Link>
              </div>
              <ul className="mt-10 grid max-w-md grid-cols-3 gap-3">
                {STATS.map((s) => (
                  <li key={s.small} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
                    <Icon name={s.icon} className="h-5 w-5 text-spark" />
                    <p className="mt-1 text-2xl font-extrabold leading-none">{s.big}</p>
                    <p className="mt-1 text-sm text-ice">{s.small}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <AthleteArt tone="dark" className="w-full" />
              <div className="float-soft absolute left-0 top-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-deep shadow-lift sm:-left-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Icon name="flame" className="h-6 w-6" />
                </span>
                <span className="leading-tight">
                  <span className="block text-xl font-extrabold">3 weeks</span>
                  <span className="block text-sm text-muted">streak</span>
                </span>
              </div>
              <div className="float-soft absolute bottom-10 right-0 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-deep shadow-lift [animation-delay:1.5s] sm:-right-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon name="check" className="h-6 w-6" strokeWidth={3} />
                </span>
                <span className="leading-tight">
                  <span className="block text-xl font-extrabold">Workout done</span>
                  <span className="block text-sm text-muted">+2 reps next week</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <ul className="mt-6 flex flex-wrap justify-center gap-3">
          {TRUST.map((t) => (
            <li key={t.text} className="flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-base font-semibold text-accent-dark">
              <Icon name={t.icon} className="h-5 w-5" /> {t.text}
            </li>
          ))}
        </ul>

        {/* WHAT YOU DO */}
        <section id="how" aria-labelledby="how-title" className="scroll-mt-6 py-16 sm:py-20">
          <p className="text-center text-sm font-extrabold uppercase tracking-widest text-accent">What you do</p>
          <h2 id="how-title" className="mt-2 text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
            Just 3 steps
          </h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-card bg-white p-7 shadow-card ring-1 ring-gray-100">
                <span className="absolute -top-5 left-7 flex h-10 w-10 items-center justify-center rounded-full bg-spark text-lg font-extrabold text-deep shadow-sm">
                  {i + 1}
                </span>
                <span className="mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-deep text-white">
                  <Icon name={s.icon} className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold leading-tight">{s.title}</h3>
                <p className="mt-2 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FEATURES */}
        <section aria-labelledby="features-title" className="rounded-hero bg-accent-soft px-6 py-14 sm:px-12">
          <h2 id="features-title" className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
            Everything you need
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-4 rounded-card bg-white p-5 shadow-card">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon name={f.icon} className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-xl font-extrabold leading-tight">{f.title}</span>
                  <span className="mt-1 block text-base text-muted">{f.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* SAMPLE WEEK */}
        <section aria-labelledby="week-title" className="py-16 sm:py-20">
          <p className="text-center text-sm font-extrabold uppercase tracking-widest text-accent">A peek inside</p>
          <h2 id="week-title" className="mt-2 text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
            Your week at a glance
          </h2>
          <div className="mt-10">
            <SampleWeek />
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section aria-labelledby="cta-title" className="on-deep relative mb-16 overflow-hidden rounded-hero bg-gradient-to-br from-deep via-[#064e4a] to-accent px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-spark/15 blur-3xl" />
          <div className="relative">
            <h2 id="cta-title" className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Ready to <span className="text-spark">start?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-xl text-ice">It takes about a minute. No experience needed.</p>
            <div className="mt-8">
              <ButtonLink href={cta.href} variant="spark" arrow>
                {cta.label}
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 px-4 py-6 text-center text-base text-muted">
        FitPath is general fitness guidance, not medical advice. If you have pain, an injury or a health condition, check with a doctor or physio first.
      </footer>
    </>
  );
}
