@AGENTS.md

# FitPath — project notes (persist across sessions)

Beginner-friendly fitness website. Also a **discrete mathematics course project**: the maths must be real and visible.

## Stack
Next.js (App Router) + TypeScript + Tailwind CSS · Supabase (auth + Postgres) · Vitest (unit tests) · Vercel.
No unnecessary libraries. Charts/diagrams are hand-written SVG. Simple, readable code with brief comments.
**Ask the user before adding anything not listed here.**

## Scope decision
AI Coach: the user first dropped it, then re-added it using the FREE **Groq** API (not the Claude API). It lives at `/coach` (small "Ask the coach" floating button links to it; NOT in the navbar, which stays at 5 items) with the server route `src/app/api/coach/route.ts`.
- Key is `GROQ_API_KEY` in `.env.local` / Vercel (server only, never `NEXT_PUBLIC_`). Model via optional `GROQ_MODEL` (default `llama-3.3-70b-versatile`).
- The AI only explains/motivates; the maths chooses exercises. Safety is enforced in our code too (`src/lib/coach/safety.ts`): doctor/physio note on pain/injury/condition, diet note on extreme-diet talk, browser can never send a "system" role, rate limit 8/min/user.

## Pages (MVP)
Landing · Sign up/Log in · Onboarding (one question per screen + progress bar) · Dashboard · Workout plan (Mark as done, Swap exercise) · Progress · Settings (profile, kg/lb, delete account).
Navbar: Today, Plan, Progress, Settings.

## Maths requirement (core)
All maths lives in `src/lib/math/` as pure, well-commented, unit-tested functions (no DB/UI imports):
1. Set theory — usable = (equipment ∩ requirements) − injury-excluded
2. Propositional logic — safety rules as implications, truth tables
3. Relations — partial order (progression chains, Hasse diagram) + equivalence relation (swap = same muscle group & equipment)
4. Graph colouring — muscle groups = vertices, conflicts = edges, colours = days
5. Combinatorics + pigeonhole — C(n,k), forced repeats
6. Recurrence + induction — W(n) = W(n-1) + d, closed form W(0) + n·d
7. DP 0/1 knapsack — maximise benefit within session minutes
Exercise selection and scheduling come ONLY from these functions.
(The "Maths Behind It" explanation page was REMOVED at the user's request; it can be restored from git history, commit ea2a095 or earlier. The maths itself still drives every plan.)

## Content rules
- 74 seeded, safe, common exercises: 40 for home (bodyweight, dumbbells, bands, pull-up bar) + 25 gym exercises (machines, cables, barbells) + 9 cardio (an 8th muscle group, unit "minutes", conflicts with legs). Warm-up/cool-down moves live in `src/data/warmups.ts` and take a fixed 5 minutes of each day (knapsack capacity = minutes − 5). Fields: muscle group, equipment, difficulty, duration, benefit score. Source of truth: `src/data/exercises.ts`; regenerate `supabase/seed.sql` with `npm run seed:gen` and re-run it in Supabase after any change.
- Equipment "gym" = every kind of equipment (set theory: U becomes the whole universe). Gym exercises require "gym".
- Session minutes are PER WORKOUT DAY, not per week.
- Never give medical or extreme-diet advice; if pain/injury/condition is mentioned, advise a doctor or physio.
- Short disclaimer on the onboarding screens.

## Design rules
Minimal, lots of white space, ONE accent colour (teal), large readable text, rounded buttons, simple sans-serif.
Mobile-first, responsive. Big obvious buttons, clear labels, no hidden menus. Accessible: good contrast, keyboard navigation, alt text.
No heavy animation, popups, or autoplay video. Plain language for beginners; explain terms (e.g. "reps" = how many times you do a movement).

## Working style
Build in small phases and stop after each for the user to test. Give exact run/test commands (Windows PowerShell).
STATUS: phases 0-8 are DONE, plus extras on the `features` branch: 9 feedback/adaptive overload, 10 workout mode, 11 warm-up/cool-down + cardio, 12 log weights/reps (double progression), 13 missed-day rescheduling (graph colouring with pre-coloured vertices, `src/lib/math/sessionColouring.ts`). Extra database updates live in `supabase/migrations/001-004*.sql` and must be run in Supabase before the matching feature works. Live at https://fit-path-theta.vercel.app (Vercel, auto-deploys on push to `main` of GitHub smithpatil/FitPath). Env vars set in Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GROQ_API_KEY (+ optional GROQ_MODEL). Supabase Auth Site URL / Redirect URLs must include the live address. "Confirm email" is OFF (Supabase built-in email only reaches team members). Database changes (schema/seed) must be run manually in Supabase; code changes go live with `git add -A; git commit; git push`.
Phases: 0 scaffold · 1 maths lib + tests · 2 Supabase + auth · 3 onboarding · 4 plan generator + dashboard/plan pages · 5 progress + settings · 6 Maths page · 7 polish + deploy.
