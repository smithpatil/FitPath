-- Phase 11: cardio exercises (a new "cardio" muscle group, measured in minutes).
-- Run ONCE in Supabase → SQL Editor, THEN run the new supabase/seed.sql to add the exercises.
-- Safe to run again. (schema.sql already contains these rules for brand-new projects.)

alter table public.exercises drop constraint if exists exercises_muscle_group_check;
alter table public.exercises add constraint exercises_muscle_group_check
  check (muscle_group in ('legs','glutes','chest','back','shoulders','arms','core','cardio'));

alter table public.exercises drop constraint if exists exercises_unit_check;
alter table public.exercises add constraint exercises_unit_check
  check (unit in ('reps','seconds','minutes'));
