-- 1. Ensure base columns exist
ALTER TABLE public.readiness_checkins
  ADD COLUMN IF NOT EXISTS checkin_date date GENERATED ALWAYS AS ( (checkin_at AT TIME ZONE 'UTC')::date ) STORED,
  ADD COLUMN IF NOT EXISTS workout_id uuid NULL,
  ADD COLUMN IF NOT EXISTS score numeric NULL;

-- 2. Clean old conflicting uniques
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ux_readiness_daily') THEN
    EXECUTE 'DROP INDEX public.ux_readiness_daily';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ux_readiness_per_workout_only') THEN
    EXECUTE 'DROP INDEX public.ux_readiness_per_workout_only';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_readiness_user_workout_unique') THEN
    EXECUTE 'DROP INDEX public.idx_readiness_user_workout_unique';
  END IF;
END$$;

-- 3. Create clean, explicit, named partial uniques
CREATE UNIQUE INDEX IF NOT EXISTS uq_readiness_daily
  ON public.readiness_checkins(user_id, checkin_date)
  WHERE workout_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_readiness_per_workout
  ON public.readiness_checkins(user_id, workout_id)
  WHERE workout_id IS NOT NULL;

-- 4. Input range checks (0..10)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_readiness_0_10'
  ) THEN
    ALTER TABLE public.readiness_checkins
      ADD CONSTRAINT chk_readiness_0_10 CHECK (
        COALESCE(energy,0)        BETWEEN 0 AND 10 AND
        COALESCE(sleep_quality,0) BETWEEN 0 AND 10 AND
        COALESCE(soreness,0)      BETWEEN 0 AND 10 AND
        COALESCE(stress,0)        BETWEEN 0 AND 10
      );
  END IF;
END$$;

-- 5. Canonical scorer (0–100)
CREATE OR REPLACE FUNCTION public.compute_readiness_score(
  p_energy        numeric,
  p_sleep_quality numeric,
  p_sleep_hours   numeric,
  p_soreness      numeric,
  p_stress        numeric,
  p_mood          numeric,
  p_energizers    boolean,
  p_illness       boolean,
  p_alcohol       boolean
) RETURNS numeric
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  n_energy          numeric := LEAST(GREATEST(COALESCE(p_energy,5)/10,0),1);
  n_sleep_quality   numeric := LEAST(GREATEST(COALESCE(p_sleep_quality,5)/10,0),1);
  sleep_hours_score numeric := LEAST(GREATEST(1 - ABS(COALESCE(p_sleep_hours,8)-8)/4,0),1);
  soreness_score    numeric := 1 - LEAST(GREATEST(COALESCE(p_soreness,0)/10,0),1);
  stress_score      numeric := 1 - LEAST(GREATEST(COALESCE(p_stress,0)/10,0),1);
  mood_score        numeric := LEAST(GREATEST(COALESCE(p_mood,6)/10,0),1);
  energizers_score  numeric := CASE WHEN COALESCE(p_energizers,false) THEN 0.8 ELSE 0.2 END;
  base              numeric;
  final10           numeric;
BEGIN
  base := 0.20*n_energy + 0.18*n_sleep_quality + 0.15*sleep_hours_score
        + 0.15*soreness_score + 0.12*stress_score + 0.10*mood_score
        + 0.10*energizers_score;

  final10 := LEAST(GREATEST(base,0),1)*10;
  IF p_illness THEN final10 := final10 - 2; END IF;
  IF p_alcohol THEN final10 := final10 - 1; END IF;
  final10 := LEAST(GREATEST(final10,0),10);

  RETURN ROUND(final10*10); -- 0..100 integer-like
END$$;

-- 6. Single authoritative UPSERT (fixes ambiguous "score" & duplicates)
CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  p_energy        numeric,
  p_sleep_quality numeric,
  p_sleep_hours   numeric,
  p_soreness      numeric,
  p_stress        numeric,
  p_mood          numeric,
  p_energizers    boolean,
  p_illness       boolean,
  p_alcohol       boolean,
  p_workout_id    uuid DEFAULT NULL
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_now  timestamptz := now();
  v_score numeric;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_score := public.compute_readiness_score(
    p_energy, p_sleep_quality, p_sleep_hours,
    p_soreness, p_stress, p_mood,
    p_energizers, p_illness, p_alcohol
  );

  IF p_workout_id IS NULL THEN
    -- Daily record
    INSERT INTO public.readiness_checkins AS rc (
      id, user_id, checkin_at, energy, sleep_quality, sleep_hours,
      soreness, stress, mood, energizers, illness, alcohol, workout_id, score
    ) VALUES (
      gen_random_uuid(), v_user, v_now, p_energy, p_sleep_quality, p_sleep_hours,
      p_soreness, p_stress, p_mood, p_energizers, p_illness, p_alcohol, NULL, v_score
    )
    ON CONFLICT ON CONSTRAINT uq_readiness_daily
    DO UPDATE SET
      checkin_at   = EXCLUDED.checkin_at,
      energy       = EXCLUDED.energy,
      sleep_quality= EXCLUDED.sleep_quality,
      sleep_hours  = EXCLUDED.sleep_hours,
      soreness     = EXCLUDED.soreness,
      stress       = EXCLUDED.stress,
      mood         = EXCLUDED.mood,
      energizers   = EXCLUDED.energizers,
      illness      = EXCLUDED.illness,
      alcohol      = EXCLUDED.alcohol,
      score        = EXCLUDED.score,
      updated_at   = now();

  ELSE
    -- Per-workout record
    INSERT INTO public.readiness_checkins AS rc (
      id, user_id, checkin_at, energy, sleep_quality, sleep_hours,
      soreness, stress, mood, energizers, illness, alcohol, workout_id, score
    ) VALUES (
      gen_random_uuid(), v_user, v_now, p_energy, p_sleep_quality, p_sleep_hours,
      p_soreness, p_stress, p_mood, p_energizers, p_illness, p_alcohol, p_workout_id, v_score
    )
    ON CONFLICT ON CONSTRAINT uq_readiness_per_workout
    DO UPDATE SET
      checkin_at   = EXCLUDED.checkin_at,
      energy       = EXCLUDED.energy,
      sleep_quality= EXCLUDED.sleep_quality,
      sleep_hours  = EXCLUDED.sleep_hours,
      soreness     = EXCLUDED.soreness,
      stress       = EXCLUDED.stress,
      mood         = EXCLUDED.mood,
      energizers   = EXCLUDED.energizers,
      illness      = EXCLUDED.illness,
      alcohol      = EXCLUDED.alcohol,
      score        = EXCLUDED.score,
      updated_at   = now();
  END IF;

  RETURN v_score;
END$$;

-- 7. Kill the overloads / strays (conflict-proof)
-- Nuke old signatures that could be lingering
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  integer, integer, numeric, integer, integer, integer, boolean, boolean, boolean, uuid
);
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  smallint, smallint, numeric, smallint, smallint, smallint, boolean, boolean, boolean, uuid
);