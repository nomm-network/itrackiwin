-- =============== ENUMS ===============
do $$ begin
  create type warmup_feedback as enum ('not_enough','excellent','too_much');
exception when duplicate_object then null; end $$;

-- =============== TABLES ===============
-- Per-user, per-exercise, single active warm‑up plan (TEXT), tiny row.
create table if not exists public.user_exercise_warmups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  plan_text text not null,            -- your "w1: 25kg × 10..." block
  source text not null default 'auto', -- 'auto' | 'manual' | 'coach'
  last_feedback warmup_feedback,      -- from user (overall for the exercise)
  success_streak smallint not null default 0, -- # consecutive 'excellent'
  updated_at timestamptz not null default now(),
  unique (user_id, exercise_id)
);

-- OPTIONAL: snapshot that was used inside a workout (so history remains even if plan changes later)
alter table public.workout_exercises
  add column if not exists warmup_snapshot text,
  add column if not exists warmup_feedback warmup_feedback;

-- =============== SECURITY (RLS) ===============
alter table public.user_exercise_warmups enable row level security;

create policy "warmups_select_own"
on public.user_exercise_warmups
for select
using (user_id = auth.uid());

create policy "warmups_insert_own"
on public.user_exercise_warmups
for insert with check (user_id = auth.uid());

create policy "warmups_update_own"
on public.user_exercise_warmups
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "warmups_delete_own"
on public.user_exercise_warmups
for delete using (user_id = auth.uid());

-- =============== HELPER FUNCTION ===============
-- Simple UPSERT that resets/bumps streak based on feedback
create or replace function public.upsert_user_exercise_warmup(
  _user_id uuid,
  _exercise_id uuid,
  _plan_text text,
  _source text default 'auto',
  _feedback warmup_feedback default null
) returns public.user_exercise_warmups
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.user_exercise_warmups;
  next_streak smallint := 0;
begin
  if _user_id is distinct from auth.uid() then
    -- only allow a user to upsert their own data (keeps clients simple)
    raise exception 'Unauthorized';
  end if;

  select * into existing
  from public.user_exercise_warmups
  where user_id = _user_id and exercise_id = _exercise_id;

  if existing.id is not null then
    next_streak :=
      case
        when _feedback = 'excellent' then existing.success_streak + 1
        when _feedback is null then existing.success_streak
        else 0
      end;

    update public.user_exercise_warmups
       set plan_text     = coalesce(_plan_text, existing.plan_text),
           source        = coalesce(_source, existing.source),
           last_feedback = coalesce(_feedback, existing.last_feedback),
           success_streak= next_streak,
           updated_at    = now()
     where id = existing.id
     returning * into existing;

    return existing;
  else
    insert into public.user_exercise_warmups (
      user_id, exercise_id, plan_text, source, last_feedback, success_streak
    )
    values (_user_id, _exercise_id, _plan_text, _source, coalesce(_feedback,null),
            case when _feedback = 'excellent' then 1 else 0 end)
    returning * into existing;

    return existing;
  end if;
end
$$;