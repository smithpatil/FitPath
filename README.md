# FitPath

A calm, beginner-friendly fitness website. Answer six questions and get a weekly workout plan built by **discrete mathematics** (not AI). Log workouts, see progress, and ask a simple AI coach basic questions.

This is also a discrete-maths course project: see the **The Maths Behind It** page in the app, and `src/lib/math/`.

## Tech
Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (login + database) · Groq (free AI for the coach) · Vitest (tests) · Vercel (hosting)

## Run it on your computer
1. Install Node.js 20 or newer.
2. Install packages: `npm install`
3. Create **`.env.local`** (copy `.env.example`) and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API)
   - `GROQ_API_KEY` (free, from https://console.groq.com/keys). Optional: `GROQ_MODEL`.
4. In Supabase → SQL Editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
5. Start it: `npm run dev` and open http://localhost:3000

| Command | What it does |
|---|---|
| `npm run dev` | Start the site locally |
| `npm test` | Run all automated tests (maths, plan generator, coach safety…) |
| `npm run lint` | Check code style |
| `npm run build` | Make the production build (Vercel does this for you) |
| `npm run seed:gen` | Rebuild `supabase/seed.sql` from `src/data/exercises.ts` |

## Where things are
```
src/lib/math/       The 7 maths concepts (pure functions + tests)
src/lib/planGenerator.ts   Wires the maths together into a weekly plan
src/lib/mathsExamples.ts   Builds the live examples for the Maths page
src/lib/coach/      Coach safety rules, prompt and rate limit
src/data/exercises.ts      The 74 exercises (home + gym + cardio): the single source of truth
src/app/            Pages (landing, login, onboarding, dashboard, plan, progress, maths, coach, settings)
supabase/           schema.sql and seed.sql
```

## The 7 maths ideas
1. Set theory: usable = (equipment ∩ requirements) − excluded
2. Propositional logic: safety rules as implications, with truth tables
3. Relations: progression partial order (Hasse diagram) and swap equivalence classes
4. Graph colouring: muscle groups to training days
5. Combinatorics and pigeonhole: C(n, k), forced repeats
6. Recurrence and induction: W(n) = W(n−1) + d = W(0) + n·d
7. Dynamic programming: 0/1 knapsack for the best exercises within your minutes

## Safety
FitPath gives general fitness ideas, **not medical advice**. The coach never gives medical or diet advice, and pain/injury/condition messages get a fixed "see a doctor or physio" note added by our own code. The Groq API key is used on the server only.

## Changing the exercises
Edit `src/data/exercises.ts`, run `npm run seed:gen`, then run the new `supabase/seed.sql` in Supabase. Update the tests if the number of exercises changes.
