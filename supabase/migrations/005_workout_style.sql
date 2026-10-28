-- Workout style: the user chooses Gym, Strength or Yoga on the "Choose your workout" screen.
-- Run ONCE in Supabase -> SQL Editor. Safe to run again. Existing profiles keep working (empty = worked out from equipment).

alter table public.profiles add column if not exists format text;

alter table public.profiles drop constraint if exists profiles_format_check;
alter table public.profiles add constraint profiles_format_check
  check (format is null or format in ('gym', 'strength', 'yoga'));
