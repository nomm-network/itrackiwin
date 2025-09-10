-- 1) Core table (adjust names/types if it already exists)
create table if not exists public.readiness_checkins (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  checkin_at    timestamptz not null default now(),

  -- inputs
  energy        int    check (energy between 0 and 10),
  sleep_quality int    check (sleep_quality between 0 and 10),
  sleep_hours   numeric,
  soreness      int    check (soreness between 0 and 10),
  stress        int    check (stress between 0 and 10),
  mood          int    check (mood between 0 and 10),
  energizers    boolean,
  illness       boolean,
  alcohol       boolean,

  -- outputs
  score         numeric,           -- 0–10 (we'll return 0–100 to the UI)
  computed_at   timestamptz
);

-- 2) Day key for idempotency (today in UTC; use your tz if needed)
alter table public.readiness_checkins
  add column if not exists checkin_date date
  generated always as ( (checkin_at at time zone 'UTC')::date ) stored;

-- 3) One per day per user
create unique index if not exists ux_readiness_daily
  on public.readiness_checkins(user_id, checkin_date);

-- RLS (let the current user insert/update their own row)
alter table public.readiness_checkins enable row level security;

drop policy if exists rp_readiness_all on public.readiness_checkins;

create policy rp_readiness_select
  on public.readiness_checkins for select
  using (auth.uid() = user_id);

create policy rp_readiness_upsert
  on public.readiness_checkins for insert
  with check (auth.uid() = user_id);

create policy rp_readiness_update
  on public.readiness_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Base calculator (0–10). Keep it pure/immutable.
create or replace function public.fn_compute_readiness_v1(
  p_energy int, p_sleep_quality int, p_sleep_hours numeric,
  p_soreness int, p_stress int, p_mood int, p_energizers boolean,
  p_illness boolean, p_alcohol boolean
) returns numeric
language plpgsql immutable as $$
declare
  n_energy          numeric := least(greatest(coalesce(p_energy,        5)/10.0, 0), 1);
  n_sleep_quality   numeric := least(greatest(coalesce(p_sleep_quality, 5)/10.0, 0), 1);
  sleep_hours_score numeric := 1 - (abs(coalesce(p_sleep_hours, 8) - 8) / 4.0);
  soreness_score    numeric := 1 - least(greatest(coalesce(p_soreness, 0)/10.0, 0), 1);
  stress_score      numeric := 1 - least(greatest(coalesce(p_stress,   0)/10.0, 0), 1);
  mood_score        numeric := least(greatest(coalesce(p_mood,         6)/10.0, 0), 1);
  energizers_score  numeric := case when coalesce(p_energizers,false) then 0.8 else 0.2 end;
  base              numeric;
  score10           numeric;
begin
  sleep_hours_score := least(greatest(sleep_hours_score, 0), 1);

  base :=
      0.20*n_energy
    + 0.18*n_sleep_quality
    + 0.15*sleep_hours_score
    + 0.15*soreness_score
    + 0.12*stress_score
    + 0.10*mood_score
    + 0.10*energizers_score;

  score10 := least(greatest(base, 0), 1)*10;

  if coalesce(p_illness,false) then score10 := score10 - 2; end if;
  if coalesce(p_alcohol,false) then score10 := score10 - 1; end if;

  return least(greatest(score10, 0), 10);
end $$;

-- RPC: upsert today's row and return score as 0–100
create or replace function public.upsert_readiness_today(
  p_energy int, p_sleep_quality int, p_sleep_hours numeric,
  p_soreness int, p_stress int, p_mood int,
  p_energizers boolean, p_illness boolean, p_alcohol boolean
) returns numeric
language plpgsql
security definer
set search_path=public as $$
declare
  v_user uuid := auth.uid();
  v_now  timestamptz := now();
  v_score10 numeric;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  v_score10 := public.fn_compute_readiness_v1(
    p_energy, p_sleep_quality, p_sleep_hours,
    p_soreness, p_stress, p_mood, p_energizers, p_illness, p_alcohol
  );

  insert into public.readiness_checkins as rc (
    user_id, checkin_at,
    energy, sleep_quality, sleep_hours, soreness, stress, mood,
    energizers, illness, alcohol,
    score, computed_at
  )
  values (
    v_user, v_now,
    p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress, p_mood,
    p_energizers, p_illness, p_alcohol,
    v_score10, v_now
  )
  on conflict (user_id, checkin_date)
  do update set
    checkin_at  = excluded.checkin_at,
    energy      = excluded.energy,
    sleep_quality = excluded.sleep_quality,
    sleep_hours = excluded.sleep_hours,
    soreness    = excluded.soreness,
    stress      = excluded.stress,
    mood        = excluded.mood,
    energizers  = excluded.energizers,
    illness     = excluded.illness,
    alcohol     = excluded.alcohol,
    score       = excluded.score,
    computed_at = excluded.computed_at
  where rc.user_id = v_user;

  -- return 0–100 for the UI
  return round(coalesce(v_score10,0) * 10.0);
end $$;

revoke all on function public.upsert_readiness_today(int,int,numeric,int,int,int,boolean,boolean,boolean) from public;
grant execute on function public.upsert_readiness_today(int,int,numeric,int,int,int,boolean,boolean,boolean) to authenticated, anon;