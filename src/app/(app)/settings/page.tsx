import Link from "next/link";
import ButtonLink from "@/components/Button";
import { logout } from "@/app/(auth)/actions";
import { EQUIPMENT, GOALS, LEVELS, LIMITATIONS } from "@/lib/onboarding";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import DeleteAccountForm from "./DeleteAccountForm";
import { saveUnits } from "./actions";

export const metadata = { title: "Settings — FitPath" };

const labelOf = <T,>(opts: { value: T; label: string }[], v: T) => opts.find((o) => o.value === v)?.label ?? String(v);

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const p = (await getProfile(supabase))!;

  const rows: [string, string][] = [
    ["Goal", labelOf(GOALS, p.goal)],
    ["Experience", labelOf(LEVELS, p.level)],
    ["Training days per week", String(p.days)],
    ["Minutes per workout day", String(p.minutes)],
    ["Equipment", p.equipment.length ? p.equipment.map((e) => labelOf(EQUIPMENT, e)).join(", ") : "No equipment"],
    ["Limits", p.limitations.length ? p.limitations.map((l) => labelOf(LIMITATIONS, l)).join(", ") : "None"],
  ];

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted">
          Signed in as <strong className="text-ink">{user?.email}</strong>
        </p>
      </header>

      <section aria-labelledby="profile">
        <h2 id="profile" className="text-2xl font-bold">
          Your answers
        </h2>
        <dl className="mt-4 divide-y divide-gray-200 rounded-2xl border-2 border-gray-200">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-wrap justify-between gap-2 px-5 py-3">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-muted">
          Changing your answers builds a new plan for this week. Your past workouts and streak are kept.
        </p>
        <div className="mt-4">
          <ButtonLink href="/onboarding" variant="outline">
            Edit my answers
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="units">
        <h2 id="units" className="text-2xl font-bold">
          Weight units
        </h2>
        <form action={saveUnits} className="mt-4">
          <fieldset className="flex flex-wrap gap-4">
            <legend className="sr-only">Weight units</legend>
            {(["kg", "lb"] as const).map((u) => (
              <label key={u} className="cursor-pointer">
                <input type="radio" name="units" value={u} defaultChecked={p.units === u} className="peer sr-only" />
                <span className="block rounded-full border-2 border-gray-500 px-8 py-3 text-lg font-semibold peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                  {u === "kg" ? "Kilograms (kg)" : "Pounds (lb)"}
                </span>
              </label>
            ))}
          </fieldset>
          <button
            type="submit"
            className="mt-4 rounded-full bg-accent px-8 py-3 text-lg font-semibold text-white hover:bg-accent-dark"
          >
            Save units
          </button>
        </form>
      </section>

      <section aria-labelledby="account">
        <h2 id="account" className="text-2xl font-bold">
          Account
        </h2>
        <form action={logout} className="mt-4">
          <button
            type="submit"
            className="rounded-full border-2 border-accent px-8 py-3 text-lg font-semibold text-accent hover:bg-accent-soft"
          >
            Log out
          </button>
        </form>
      </section>

      <section aria-labelledby="danger" className="rounded-2xl border-2 border-red-200 p-6">
        <h2 id="danger" className="text-2xl font-bold text-red-800">
          Delete account
        </h2>
        <p className="mt-2 text-muted">
          This permanently deletes your account, plans, workout history and weight entries. It cannot be undone.
        </p>
        <DeleteAccountForm />
      </section>

      <p className="text-base text-muted">
        <Link href="/" className="underline">
          Back to home page
        </Link>
      </p>
    </div>
  );
}
