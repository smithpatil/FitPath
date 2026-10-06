import Link from "next/link";
import ButtonLink from "@/components/Button";
import { getUserEmail } from "@/lib/supabase/user";

const benefits = [
  { title: "Made for you", text: "Your plan fits your goal, your time and the equipment you have." },
  { title: "Simple and safe", text: "Beginner-friendly exercises, with clear notes on how to do each one." },
  { title: "See your progress", text: "Tick off workouts and watch your weekly streak grow." },
];

const steps = [
  { title: "Answer a few questions", text: "Tell us your goal, how much time you have and what equipment you own." },
  { title: "Get your weekly plan", text: "We build it using real maths, so it is balanced and fits your time." },
  { title: "Do it and tick it off", text: "Follow each day's workout and mark it done." },
];

export default async function Home() {
  const loggedIn = (await getUserEmail()) !== null;
  return (
    <>
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
        <span className="text-xl font-bold text-accent">FitPath</span>
        {loggedIn ? (
          <Link href="/dashboard" className="rounded-full px-4 py-2 font-medium hover:bg-accent-soft">
            My workouts
          </Link>
        ) : (
          <Link href="/login" className="rounded-full px-4 py-2 font-medium hover:bg-accent-soft">
            Log in
          </Link>
        )}
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 outline-none">
        <section className="py-16 text-center sm:py-24">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            A calm, simple start to fitness
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-xl text-muted">
            Answer a few questions and get a weekly workout plan made just for you. No experience needed.
          </p>
          <div className="mt-10">
            <ButtonLink href={loggedIn ? "/dashboard" : "/signup"}>{loggedIn ? "Go to my workouts" : "Get started"}</ButtonLink>
          </div>
        </section>

        <section aria-labelledby="benefits" className="py-10">
          <h2 id="benefits" className="sr-only">Benefits</h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <li key={b.title} className="rounded-2xl bg-accent-soft p-6">
                <h3 className="text-xl font-semibold text-accent-dark">{b.title}</h3>
                <p className="mt-2 text-muted">{b.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how" className="py-16">
          <h2 id="how" className="text-3xl font-bold">How it works</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-white"
                >
                  {i + 1}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <ButtonLink href={loggedIn ? "/dashboard" : "/signup"}>{loggedIn ? "Go to my workouts" : "Get started"}</ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 px-4 py-6 text-center text-base text-muted">
        FitPath is general fitness guidance, not medical advice. If you have pain, an injury or a health condition, check with a doctor or physio first.
      </footer>
    </>
  );
}
