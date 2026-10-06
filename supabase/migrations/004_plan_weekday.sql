-- Phase 13: remember which weekday each workout is on, so a missed workout can be rescheduled.
-- Run ONCE in Supabase → SQL Editor. Safe to run again. Existing rows are kept (empty = use the default pattern).

alter table public.plan_items add column if not exists weekday int;

alter table public.plan_items drop constraint if exists plan_items_weekday_check;
alter table public.plan_items add constraint plan_items_weekday_check
  check (weekday is null or weekday between 0 and 6);   -- 0 = Monday … 6 = Sunday
