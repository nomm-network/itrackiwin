-- 1) Safety: drop any older overloads so PostgREST has only one target.
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  p_energy integer, p_sleep_quality integer, p_sleep_hours numeric,
  p_soreness integer, p_stress integer, p_mood integer,
  p_energisers_taken boolean, p_illness boolean, p_alcohol boolean,
  p_workout_id uuid
);

DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  p_energy numeric, p_sleep_quality numeric, p_sleep_hours numeric,
  p_soreness numeric, p_stress numeric, p_mood numeric,
  p_energisers_taken boolean, p_illness boolean, p_alcohol boolean,
  p_workout_id uuid
);

-- 2) Ensure the two partial unique indexes exist & are right.
--    A) unique per user/day when NO workout_id is present
CREATE UNIQUE INDEX IF NOT EXISTS ux_readiness_user_day
ON public.readiness_checkins(user_id, checkin_date)
WHERE workout_id IS NULL;

--    B) unique per user/workout when workout_id IS present
CREATE UNIQUE INDEX IF NOT EXISTS ux_readiness_user_workout
ON public.readiness_checkins(user_id, workout_id)
WHERE workout_id IS NOT NULL;

-- 3) Canonical scorer (expects 0-10 inputs; returns 0-100).
--    If you already have it, keep yours. This is safe.
CREATE OR REPLACE FUNCTION public.compute_readiness_score(
  p_energy numeric, p_sleep_quality numeric, p_sleep_hours numeric,
  p_soreness numeric, p_stress numeric, p_mood numeric,
  p_energisers_taken boolean, p_illness boolean, p_alcohol boolean
) RETURNS numeric
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  n_energy        numeric := LEAST(GREATEST(COALESCE(p_energy,5)/10.0,0),1);
  n_sleep_quality numeric := LEAST(GREATEST(COALESCE(p_sleep_quality,5)/10.0,0),1);
  sleep_hours_score numeric := LEAST(GREATEST(1-ABS(COALESCE(p_sleep_hours,8)-8)/4.0,0),1);
  soreness_score  numeric := 1-LEAST(GREATEST(COALESCE(p_soreness,0)/10.0,0),1);
  stress_score    numeric := 1-LEAST(GREATEST(COALESCE(p_stress,0)/10.0,0),1);
  mood_score      numeric := LEAST(GREATEST(COALESCE(p_mood,6)/10.0,0),1);
  energisers_score numeric := CASE WHEN COALESCE(p_energisers_taken,false) THEN 0.8 ELSE 0.2 END;
  base numeric;
  score10 numeric;
BEGIN
  base :=
      0.20*n_energy + 0.18*n_sleep_quality + 0.15*sleep_hours_score
    + 0.15*soreness_score + 0.12*stress_score + 0.10*mood_score
    + 0.10*energisers_score;
  score10 := LEAST(GREATEST(base,0),1)*10;
  IF COALESCE(p_illness,false) THEN score10 := score10 - 2; END IF;
  IF COALESCE(p_alcohol,false) THEN score10 := score10 - 1; END IF;
  score10 := LEAST(GREATEST(score10,0),10);
  RETURN ROUND(score10*10); -- 0..100
END $$;

-- 4) Canonical UPSERT. PARAMETER NAMES MATCH CLIENT PAYLOAD.
CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  energy            numeric,
  sleep_quality     numeric,
  sleep_hours       numeric,
  soreness          numeric,
  stress            numeric,
  mood              numeric,
  energisers_taken  boolean,
  illness           boolean,
  alcohol           boolean,
  workout_id        uuid DEFAULT NULL
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_date date := (now() at time zone 'utc')::date;
  v_score numeric;
  v_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_score := public.compute_readiness_score(
    energy, sleep_quality, sleep_hours, soreness, stress, mood,
    energisers_taken, illness, alcohol
  );

  IF workout_id IS NOT NULL THEN
    -- Per-workout uniqueness
    INSERT INTO public.readiness_checkins AS rc (
      id, user_id, workout_id, checkin_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energizers, illness, alcohol, score, computed_at, checkin_at
    ) VALUES (
      gen_random_uuid(), v_user, workout_id, v_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energisers_taken, illness, alcohol, v_score, now(), now()
    )
    ON CONFLICT ON CONSTRAINT ux_readiness_user_workout
    DO UPDATE SET
      energy=EXCLUDED.energy, sleep_quality=EXCLUDED.sleep_quality,
      sleep_hours=EXCLUDED.sleep_hours, soreness=EXCLUDED.soreness,
      stress=EXCLUDED.stress, mood=EXCLUDED.mood,
      energizers=EXCLUDED.energizers, illness=EXCLUDED.illness, alcohol=EXCLUDED.alcohol,
      score=EXCLUDED.score, computed_at=EXCLUDED.computed_at, checkin_at=EXCLUDED.checkin_at
    RETURNING id INTO v_id;
  ELSE
    -- Per-day uniqueness (no workout)
    INSERT INTO public.readiness_checkins AS rc (
      id, user_id, workout_id, checkin_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energizers, illness, alcohol, score, computed_at, checkin_at
    ) VALUES (
      gen_random_uuid(), v_user, NULL, v_date,
      energy, sleep_quality, sleep_hours, soreness, stress, mood,
      energisers_taken, illness, alcohol, v_score, now(), now()
    )
    ON CONFLICT ON CONSTRAINT ux_readiness_user_day
    DO UPDATE SET
      energy=EXCLUDED.energy, sleep_quality=EXCLUDED.sleep_quality,
      sleep_hours=EXCLUDED.sleep_hours, soreness=EXCLUDED.soreness,
      stress=EXCLUDED.stress, mood=EXCLUDED.mood,
      energizers=EXCLUDED.energizers, illness=EXCLUDED.illness, alcohol=EXCLUDED.alcohol,
      score=EXCLUDED.score, computed_at=EXCLUDED.computed_at, checkin_at=EXCLUDED.checkin_at
    RETURNING id INTO v_id;
  END IF;

  RETURN v_score;
EXCEPTION
  WHEN unique_violation THEN
    -- Final guard — retry as UPDATE against both keys
    UPDATE public.readiness_checkins
       SET energy=energy, score=v_score, computed_at=now()
     WHERE user_id=v_user
       AND ( (workout_id IS NULL AND checkin_date=v_date AND workout_id IS NULL)
          OR (workout_id = workout_id) );
    RETURN v_score;
END $$;

-- 5) Permissions (so RPC can run)
GRANT EXECUTE ON FUNCTION public.upsert_readiness_today(
  numeric,numeric,numeric,numeric,numeric,numeric,boolean,boolean,boolean,uuid
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.compute_readiness_score(
  numeric,numeric,numeric,numeric,numeric,numeric,boolean,boolean,boolean
) TO authenticated;