-- Phase 9: "How did this workout feel?" feedback (adaptive overload).
-- Run ONCE in Supabase → SQL Editor → New query. Safe to run again.
-- (Also included in schema.sql for brand-new projects.)

create table if not exists public.workout_feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  week_start  date not null,                 -- Monday of the plan's week
  day         int  not null check (day >= 0), -- 0-based training-day slot
  feeling     text not null check (feeling in ('easy', 'right', 'hard')),
  created_at  timestamptz not null default now(),
  unique (user_id, week_start, day)          -- one answer per workout day (changing it replaces it)
);

alter table public.workout_feedback enable row level security;

drop policy if exists "own feedback" on public.workout_feedback;
create policy "own feedback" on public.workout_feedback for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
