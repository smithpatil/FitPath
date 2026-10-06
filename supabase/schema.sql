-- FitPath database schema. Run this once in Supabase → SQL Editor → New query.
-- Safe to run again: it uses "if not exists" / "or replace" where possible.

-- ============ Exercises (fixed list, read-only for users) ============
create table if not exists public.exercises (
  id           text primary key,
  name         text not null,
  muscle_group text not null check (muscle_group in ('legs','glutes','chest','back','shoulders','arms','core','cardio')),
  equipment    text[] not null,
  difficulty   int  not null check (difficulty between 1 and 3),
  duration_min int  not null check (duration_min > 0),
  benefit      int  not null check (benefit between 1 and 10),
  impact       text not null check (impact in ('low','high')),
  tags         text[] not null default '{}',
  unit         text not null check (unit in ('reps','seconds','minutes')),
  easier_ids   text[] not null default '{}',
  how_to       text not null
);

-- ============ Each user's profile (answers from onboarding) ============
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  goal                text check (goal in ('lose_weight','build_strength','stay_active')),
  level               text check (level in ('beginner','some_experience')),
  days_per_week       int  check (days_per_week between 2 and 6),
  minutes_per_session int  check (minutes_per_session between 10 and 90),
  equipment           text[] not null default '{}',
  limitations         text[] not null default '{}',
  units               text not null default 'kg' check (units in ('kg','lb')),
  onboarded_at        timestamptz,
  created_at          timestamptz not null default now()
);

-- ============ Weekly plans and their exercises ============
create table if not exists public.plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table if not exists public.plan_items (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references public.plans(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  day         int  not null check (day >= 0),       -- 0-based training-day slot
  position    int  not null default 0,              -- order within the day
  exercise_id text not null references public.exercises(id),
  sets        int  not null check (sets > 0),
  reps        int  not null check (reps > 0),       -- reps, or seconds for timed moves
  done        boolean not null default false,
  done_at     timestamptz
);

-- ============ Logs ============
create table if not exists public.workout_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  plan_item_id uuid references public.plan_items(id) on delete set null,
  exercise_id  text not null references public.exercises(id),
  completed_on date not null default current_date,
  created_at   timestamptz not null default now(),
  -- Phase 12 (also in migrations/003_logged_results.sql): what was actually done
  amount_done  int check (amount_done is null or amount_done between 1 and 1000),          -- reps per set / seconds / minutes
  weight_kg    numeric(6,2) check (weight_kg is null or (weight_kg > 0 and weight_kg <= 500)) -- always stored in kg
);

create table if not exists public.body_weights (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  measured_on date not null default current_date,
  kg          numeric(5,2) not null check (kg > 0),   -- always stored in kg
  unique (user_id, measured_on)
);

-- How each workout felt (Phase 9, adaptive overload). Same as migrations/001_workout_feedback.sql.
create table if not exists public.workout_feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  week_start  date not null,
  day         int  not null check (day >= 0),
  feeling     text not null check (feeling in ('easy', 'right', 'hard')),
  created_at  timestamptz not null default now(),
  unique (user_id, week_start, day)
);

-- ============ Row-level security: people only see their own rows ============
alter table public.workout_feedback enable row level security;
drop policy if exists "own feedback" on public.workout_feedback;
create policy "own feedback" on public.workout_feedback for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.exercises     enable row level security;
alter table public.profiles      enable row level security;
alter table public.plans         enable row level security;
alter table public.plan_items    enable row level security;
alter table public.workout_logs  enable row level security;
alter table public.body_weights  enable row level security;

drop policy if exists "exercises are readable" on public.exercises;
create policy "exercises are readable" on public.exercises for select using (true);

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own plans" on public.plans;
create policy "own plans" on public.plans for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own plan items" on public.plan_items;
create policy "own plan items" on public.plan_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own workout logs" on public.workout_logs;
create policy "own workout logs" on public.workout_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own body weights" on public.body_weights;
create policy "own body weights" on public.body_weights for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ Delete my account (used by Settings in Phase 5) ============
-- Deleting the auth user automatically deletes all their rows (on delete cascade).
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
