-- Phase 12: record what was actually done (reps / seconds / minutes, and the weight used).
-- Run ONCE in Supabase → SQL Editor. Safe to run again. Existing rows are kept (the new columns start empty).

alter table public.workout_logs add column if not exists amount_done int;
alter table public.workout_logs add column if not exists weight_kg numeric(6,2);

alter table public.workout_logs drop constraint if exists workout_logs_amount_done_check;
alter table public.workout_logs add constraint workout_logs_amount_done_check
  check (amount_done is null or amount_done between 1 and 1000);

alter table public.workout_logs drop constraint if exists workout_logs_weight_kg_check;
alter table public.workout_logs add constraint workout_logs_weight_kg_check
  check (weight_kg is null or (weight_kg > 0 and weight_kg <= 500));
