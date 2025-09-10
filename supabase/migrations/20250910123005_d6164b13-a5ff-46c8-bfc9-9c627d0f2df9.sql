-- Fix ambiguous column reference in upsert_readiness_today function
CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  p_energy smallint,
  p_sleep_quality smallint, 
  p_sleep_hours numeric,
  p_soreness smallint,
  p_stress smallint,
  p_mood smallint,
  p_energizers boolean,
  p_illness boolean,
  p_alcohol boolean
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  where rc.user_id = excluded.user_id;  -- Fixed: use excluded.user_id instead of v_user

  -- return 0–100 for the UI
  return round(coalesce(v_score10,0) * 10.0);
end;
$$;