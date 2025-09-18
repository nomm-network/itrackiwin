-- Add effort and load mode enums for comprehensive exercise type support
do $$ begin
  create type public.effort_mode as enum ('reps','time','distance','calories');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.load_mode as enum
    ('none','bodyweight_plus_optional','external_added','external_assist','machine_level','band_level');
exception when duplicate_object then null; end $$;

-- Add columns to exercises table
alter table public.exercises
  add column if not exists effort_mode public.effort_mode not null default 'reps',
  add column if not exists load_mode   public.load_mode   not null default 'external_added';