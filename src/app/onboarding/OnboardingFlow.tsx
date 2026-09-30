"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  DAY_OPTIONS,
  EQUIPMENT,
  GOALS,
  LEVELS,
  LIMITATIONS,
  MINUTE_OPTIONS,
  type Answers,
  type Option,
} from "@/lib/onboarding";
import { saveOnboarding } from "./actions";

type Draft = Omit<Answers, "goal" | "level" | "days" | "minutes"> & Nullable<Pick<Answers, "goal" | "level" | "days" | "minutes">>;
type Nullable<T> = { [K in keyof T]: T[K] | null };

const TOTAL = 6;

export default function OnboardingFlow({ initial }: { initial: Answers | null }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Draft>({
    goal: initial?.goal ?? null,
    level: initial?.level ?? null,
    days: initial?.days ?? null,
    minutes: initial?.minutes ?? null,
    equipment: initial?.equipment ?? [],
    limitations: initial?.limitations ?? [],
  });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const heading = useRef<HTMLHeadingElement>(null);

  // Move keyboard/screen-reader focus to the new question each time.
  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  // Can the user continue from this step? (Equipment and limitations may be empty.)
  const ready = [a.goal, a.level, a.days, a.minutes, true, true][step] !== null;
  const last = step === TOTAL - 1;

  function finish() {
    setError("");
    startTransition(async () => {
      const res = await saveOnboarding(a);
      if (res?.error) setError(res.error); // on success the server redirects
    });
  }

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div>
      {/* Progress bar */}
      <div className="mt-2">
        <p className="text-base font-medium text-muted">
          Question {step + 1} of {TOTAL}
        </p>
        <div
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-valuenow={step + 1}
          className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200"
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
        </div>
      </div>

      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ready) return;
          if (last) finish();
          else setStep(step + 1);
        }}
      >
        {step === 0 && (
          <Question title="What is your main goal?" headingRef={heading}>
            <Single name="goal" options={GOALS} value={a.goal} onChange={(v) => setA({ ...a, goal: v })} />
          </Question>
        )}
        {step === 1 && (
          <Question title="How much have you exercised before?" headingRef={heading}>
            <Single name="level" options={LEVELS} value={a.level} onChange={(v) => setA({ ...a, level: v })} />
          </Question>
        )}
        {step === 2 && (
          <Question
            title="How many days a week can you train?"
            help="3 days is a great place to start. Rest days help your body get stronger."
            headingRef={heading}
          >
            <Single
              name="days"
              columns
              options={DAY_OPTIONS.map((d) => ({ value: d, label: `${d} days` }))}
              value={a.days}
              onChange={(v) => setA({ ...a, days: v })}
            />
          </Question>
        )}
        {step === 3 && (
          <Question title="How many minutes can you spend on each workout day?" help="This is the time for ONE workout, including short rests between moves. It is not the total for the week." headingRef={heading}>
            <Single
              name="minutes"
              columns
              options={MINUTE_OPTIONS.map((m) => ({ value: m, label: `${m} min` }))}
              value={a.minutes}
              onChange={(v) => setA({ ...a, minutes: v })}
            />
          </Question>
        )}
        {step === 4 && (
          <Question
            title="What equipment do you have?"
            help="Choose everything you can use. No equipment is fine: there are plenty of moves that use just your body."
            headingRef={heading}
          >
            <Multi
              name="equipment"
              options={EQUIPMENT}
              value={a.equipment}
              // A gym has everything, so picking it replaces the other choices (and locks them).
              disabledValues={a.equipment.includes("gym") ? EQUIPMENT.map((o) => o.value).filter((v) => v !== "gym") : []}
              onToggle={(v) =>
                setA({
                  ...a,
                  equipment: v === "gym" ? (a.equipment.includes("gym") ? [] : ["gym"]) : toggle(a.equipment, v),
                })
              }
            />
            {a.equipment.includes("gym") && (
              <p className="mt-4 rounded-xl bg-accent-soft p-4 text-base text-accent-dark">
                A gym has all the other equipment too, so we will use machines, cables, barbells, dumbbells and bands in your plan.
              </p>
            )}
          </Question>
        )}
        {step === 5 && (
          <Question
            title="Is there anything that hurts or limits you?"
            help="Choose any that apply. We will leave out moves that put extra strain on those areas. Choose nothing if none apply."
            headingRef={heading}
          >
            <Multi
              name="limitations"
              options={LIMITATIONS}
              value={a.limitations}
              onToggle={(v) => setA({ ...a, limitations: toggle(a.limitations, v) })}
            />
            <p className="mt-4 rounded-xl bg-accent-soft p-4 text-base text-accent-dark">
              If you have pain, an injury or a medical condition, please talk to a doctor or physio before you start.
            </p>
          </Question>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-800">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-full border-2 border-accent px-6 py-3 text-lg font-semibold text-accent hover:bg-accent-soft"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={!ready || pending}
            className="rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            {last ? (pending ? "Saving…" : "Finish") : "Next"}
          </button>
        </div>
      </form>

      <p className="mt-10 text-sm text-muted">
        FitPath gives general fitness ideas, not medical advice. Stop if something hurts.
      </p>
    </div>
  );
}

function Question({
  title,
  help,
  headingRef,
  children,
}: {
  title: string;
  help?: string;
  headingRef: React.Ref<HTMLHeadingElement>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold leading-tight outline-none">
        {title}
      </h1>
      {help && <p className="mt-3 text-muted">{help}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

// Big card-style option. The real input is hidden but still works with the keyboard.
function Card({
  type,
  name,
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`block ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only" />
      <span className="block rounded-2xl border-2 border-gray-500 p-5 hover:border-accent peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
        <span className="block text-xl font-semibold">{label}</span>
        {hint && <span className="mt-1 block text-base text-muted">{hint}</span>}
      </span>
    </label>
  );
}

function Single<T extends string | number>({
  name,
  options,
  value,
  onChange,
  columns,
}: {
  name: string;
  options: Option<T>[];
  value: T | null;
  onChange: (v: T) => void;
  columns?: boolean;
}) {
  return (
    <div className={columns ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "space-y-3"}>
      {options.map((o) => (
        <Card key={String(o.value)} type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} label={o.label} hint={o.hint} />
      ))}
    </div>
  );
}

function Multi<T extends string>({
  name,
  options,
  value,
  onToggle,
  disabledValues = [],
}: {
  name: string;
  options: Option<T>[];
  value: T[];
  onToggle: (v: T) => void;
  disabledValues?: T[];
}) {
  return (
    <div className="space-y-3">
      {options.map((o) => (
        <Card key={o.value} type="checkbox" name={name} checked={value.includes(o.value)} onChange={() => onToggle(o.value)} label={o.label} hint={o.hint} disabled={disabledValues.includes(o.value)} />
      ))}
    </div>
  );
}
