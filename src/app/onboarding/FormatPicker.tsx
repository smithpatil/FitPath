"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import FormatCard, { WASH } from "@/components/formats/FormatCard";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import { FORMAT_INFO, FORMAT_ORDER, HOME_ITEMS, formatOf, type Format } from "@/lib/formats";
import { DAY_OPTIONS, EQUIPMENT, LEVELS, LIMITATIONS, MINUTE_OPTIONS, type Goal } from "@/lib/onboarding";
import type { Profile } from "@/lib/profile";
import type { Equipment, Level, Limitation } from "@/lib/math/types";
import { saveOnboarding } from "./actions";

const GOAL_ORDER: Goal[] = ["build_strength", "lose_weight", "stay_active"];
const homeItems = EQUIPMENT.filter((o) => HOME_ITEMS.includes(o.value));

interface Choices {
  gymKind: "commercial" | "home";
  items: Equipment[]; // home-gym or strength equipment
  goal: Goal;
  level: Level;
  days: number;
  minutes: number;
  limitations: Limitation[];
}

/** Starting choices for a style. If the person already uses this style, start from what they saved. */
function defaultsFor(format: Format, saved: Profile | null): Choices {
  const base: Choices = {
    gymKind: "commercial",
    items: [],
    goal: format === "yoga" ? "stay_active" : "build_strength",
    level: "beginner",
    days: 3,
    minutes: 30,
    limitations: [],
  };
  if (!saved || formatOf(saved) !== format) return base;
  return {
    gymKind: saved.equipment.includes("gym") || format !== "gym" ? "commercial" : "home",
    items: saved.equipment.filter((e) => HOME_ITEMS.includes(e)),
    goal: saved.goal,
    level: saved.level,
    days: saved.days,
    minutes: saved.minutes,
    limitations: saved.limitations,
  };
}

export default function FormatPicker({ saved }: { saved: Profile | null }) {
  const [format, setFormat] = useState<Format | null>(null);
  const [c, setC] = useState<Choices>(() => defaultsFor("gym", null));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const heading = useRef<HTMLHeadingElement>(null);

  // Move focus to the new screen's heading so keyboard and screen-reader users know where they are.
  useEffect(() => {
    heading.current?.focus();
  }, [format]);

  function choose(f: Format) {
    setC(defaultsFor(f, saved));
    setError("");
    setFormat(f);
  }

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function save() {
    if (!format) return;
    setError("");
    const equipment: Equipment[] =
      format === "yoga" ? [] : format === "gym" && c.gymKind === "commercial" ? ["gym"] : c.items;
    startTransition(async () => {
      const res = await saveOnboarding({
        format,
        goal: c.goal,
        level: c.level,
        days: c.days,
        minutes: c.minutes,
        equipment,
        limitations: c.limitations,
      });
      if (res?.error) setError(res.error); // on success the server redirects
    });
  }

  /* ---------------- 1. choose a style ---------------- */
  if (!format) {
    return (
      <div className="space-y-8">
        <PageHeader icon="dumbbell" eyebrow={saved ? "Change your style" : "Welcome to FitPath"} title="Choose your workout">
          Pick the style you want. Tap a card to set up your week.
        </PageHeader>
        <h2 ref={heading} tabIndex={-1} className="sr-only outline-none">
          Choose your workout style
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {FORMAT_ORDER.map((f) => (
            <FormatCard key={f} format={f} current={saved ? formatOf(saved) === f : false} onChoose={() => choose(f)} />
          ))}
        </div>
        <p className="text-center text-base text-muted">
          FitPath gives general fitness ideas, not medical advice. Stop if something hurts.
        </p>
      </div>
    );
  }

  /* ---------------- 2. set up that style ---------------- */
  const info = FORMAT_INFO[format];
  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setFormat(null)}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-base font-bold text-accent hover:bg-accent-soft"
      >
        <Icon name="arrow-right" className="h-5 w-5 rotate-180" /> Change style
      </button>

      <div className={`on-deep relative overflow-hidden rounded-hero bg-gradient-to-br ${WASH[format]} p-6 text-white sm:p-10`}>
        <div className="relative grid items-center gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-widest text-ice">{info.length}</p>
            <h1 ref={heading} tabIndex={-1} className="mt-1 text-4xl font-extrabold leading-tight tracking-tight outline-none sm:text-5xl">
              Set up your {info.title} plan
            </h1>
            <p className="mt-3 max-w-md text-lg text-ice">{info.description}</p>
          </div>
        </div>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        {format === "gym" && (
          <Section title="Where will you train?">
            <div className="grid gap-3 sm:grid-cols-2">
              <BigPick checked={c.gymKind === "commercial"} onChange={() => setC({ ...c, gymKind: "commercial" })} name="gymkind" icon="dumbbell" title="A gym" hint="Machines, cables, barbells and weights" />
              <BigPick checked={c.gymKind === "home"} onChange={() => setC({ ...c, gymKind: "home" })} name="gymkind" icon="home" title="Home gym" hint="Dumbbells, bands or a pull-up bar at home" />
            </div>
            {c.gymKind === "home" && <HomeItems items={c.items} onToggle={(v) => setC({ ...c, items: toggle(c.items, v) })} text="What is in your home gym?" />}
          </Section>
        )}

        {format === "strength" && (
          <Section title="What do you have?" hint="No gym needed. Choose anything you own, or none: there are plenty of body-weight moves.">
            <HomeItems items={c.items} onToggle={(v) => setC({ ...c, items: toggle(c.items, v) })} />
          </Section>
        )}

        <Section title="Your goal">
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Your goal">
            {GOAL_ORDER.map((g) => (
              <Pick key={g} type="radio" name="goal" checked={c.goal === g} onChange={() => setC({ ...c, goal: g })}>
                {info.goals[g]}
              </Pick>
            ))}
          </div>
        </Section>

        <Section title="Days a week" hint="3 days is a great place to start. Rest days help your body recover.">
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Days a week">
            {DAY_OPTIONS.map((d) => (
              <Pick key={d} type="radio" name="days" checked={c.days === d} onChange={() => setC({ ...c, days: d })}>
                {d} days
              </Pick>
            ))}
          </div>
        </Section>

        <Section title="Minutes each time" hint="The time for ONE session, including warm-up and cool-down. Not the weekly total.">
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Minutes each time">
            {MINUTE_OPTIONS.map((m) => (
              <Pick key={m} type="radio" name="minutes" checked={c.minutes === m} onChange={() => setC({ ...c, minutes: m })}>
                {m} min
              </Pick>
            ))}
          </div>
        </Section>

        <Section title="Your experience">
          <div className="grid gap-3 sm:grid-cols-2">
            {LEVELS.map((l) => (
              <BigPick
                key={l.value}
                checked={c.level === l.value}
                onChange={() => setC({ ...c, level: l.value })}
                name="level"
                icon={l.value === "beginner" ? "smile" : "bolt"}
                title={l.label}
                hint={l.hint}
              />
            ))}
          </div>
        </Section>

        <Section title="Anything sore or limited?" hint="Optional. We will leave out moves that put extra strain on these areas.">
          <div className="flex flex-wrap gap-3">
            {LIMITATIONS.map((l) => (
              <Pick key={l.value} type="checkbox" name="limits" checked={c.limitations.includes(l.value)} onChange={() => setC({ ...c, limitations: toggle(c.limitations, l.value) })}>
                {l.label}
              </Pick>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-accent-soft p-4 text-base text-accent-dark">
            If you have pain, an injury or a medical condition, please talk to a doctor or physio before you start.
          </p>
        </Section>

        {error && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-red-800 ring-1 ring-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-5 text-xl font-extrabold text-white shadow-lift transition-colors hover:bg-accent-dark disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Building your plan…" : `Create my ${info.title} plan`}
          {!pending && <Icon name="arrow-right" className="h-6 w-6 transition-transform group-hover:translate-x-1" />}
        </button>
        <p className="text-sm text-muted">FitPath gives general fitness ideas, not medical advice. Stop if something hurts.</p>
      </form>
    </div>
  );
}

/* ---------------- small building blocks ---------------- */

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-white p-5 shadow-card ring-1 ring-gray-100 sm:p-6">
      <h2 className="text-xl font-extrabold">{title}</h2>
      {hint && <p className="mt-1 text-base text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// A pill-shaped choice. The real radio/checkbox is hidden but still works with the keyboard.
function Pick({ type, name, checked, onChange, children }: { type: "radio" | "checkbox"; name: string; checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="cursor-pointer">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="flex items-center gap-2 rounded-full border-2 border-gray-300 px-5 py-3 text-base font-bold text-ink transition-colors hover:border-accent peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
        {children}
      </span>
    </label>
  );
}

// A bigger choice with an icon, a title and one line of help.
function BigPick({ checked, onChange, name, icon, title, hint }: { checked: boolean; onChange: () => void; name: string; icon: "dumbbell" | "home" | "smile" | "bolt"; title: string; hint?: string }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="flex h-full items-start gap-4 rounded-2xl border-2 border-gray-300 p-4 transition-colors hover:border-accent peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-deep text-white">
          <Icon name={icon} className="h-6 w-6" />
        </span>
        <span>
          <span className="block text-lg font-extrabold leading-tight">{title}</span>
          {hint && <span className="mt-1 block text-base text-muted">{hint}</span>}
        </span>
      </span>
    </label>
  );
}

function HomeItems({ items, onToggle, text }: { items: Equipment[]; onToggle: (v: Equipment) => void; text?: string }) {
  return (
    <div className="mt-4">
      {text && <p className="mb-3 font-bold">{text}</p>}
      <div className="flex flex-wrap gap-3">
        {homeItems.map((o) => (
          <Pick key={o.value} type="checkbox" name="items" checked={items.includes(o.value)} onChange={() => onToggle(o.value)}>
            {o.label}
          </Pick>
        ))}
      </div>
    </div>
  );
}
