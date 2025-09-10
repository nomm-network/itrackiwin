-- Drop any overloads to avoid "function already exists" traps
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  smallint, smallint, numeric, smallint, smallint, smallint, boolean, boolean, boolean
);
DROP FUNCTION IF EXISTS public.upsert_readiness_today(
  p_energy smallint, p_sleep_quality smallint, p_sleep_hours numeric,
  p_soreness smallint, p_stress smallint, p_mood smallint,
  p_energizers boolean, p_illness boolean, p_alcohol boolean
);

CREATE OR REPLACE FUNCTION public.upsert_readiness_today(
  p_energy        smallint,
  p_sleep_quality smallint,
  p_sleep_hours   numeric,
  p_soreness      smallint,
  p_stress        smallint,
  p_mood          smallint,
  p_energizers    boolean,
  p_illness       boolean,
  p_alcohol       boolean
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_checkin_date date := CURRENT_DATE;
  v_computed numeric;  -- DO NOT call this "score"
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Inline calculation to avoid function dependencies
  v_computed := (
    LEAST(GREATEST(p_energy/10.0,0),1)              * 0.20 +
    LEAST(GREATEST(p_sleep_quality/10.0,0),1)       * 0.18 +
    LEAST(GREATEST(1 - ABS(p_sleep_hours - 8)/4.0,0),1) * 0.15 +
    (1 - LEAST(GREATEST(p_soreness/10.0,0),1))      * 0.15 +
    (1 - LEAST(GREATEST(p_stress/10.0,0),1))        * 0.12 +
    LEAST(GREATEST(p_mood/10.0,0),1)                * 0.10 +
    (CASE WHEN p_energizers THEN 0.8 ELSE 0.2 END)  * 0.10
  ) * 10;  -- 0..10

  -- Normalize penalties
  IF p_illness THEN v_computed := v_computed - 2; END IF;
  IF p_alcohol THEN v_computed := v_computed - 1; END IF;
  v_computed := LEAST(GREATEST(v_computed, 0), 10);  -- clamp

  INSERT INTO public.readiness_checkins AS rc
    (user_id, checkin_date, checkin_at,
     energy, sleep_quality, sleep_hours, soreness, stress,
     mood, energizers, illness, alcohol,
     score, computed_at)
  VALUES
    (v_user, v_checkin_date, now(),
     p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress,
     p_mood, p_energizers, p_illness, p_alcohol,
     v_computed, now())
  ON CONFLICT (user_id, checkin_date)
  DO UPDATE SET
     energy        = EXCLUDED.energy,
     sleep_quality = EXCLUDED.sleep_quality,
     sleep_hours   = EXCLUDED.sleep_hours,
     soreness      = EXCLUDED.soreness,
     stress        = EXCLUDED.stress,
     mood          = EXCLUDED.mood,
     energizers    = EXCLUDED.energizers,
     illness       = EXCLUDED.illness,
     alcohol       = EXCLUDED.alcohol,
     score         = EXCLUDED.score,          -- ✅ fully qualified
     computed_at   = now(),
     checkin_at    = now()
  WHERE rc.user_id = EXCLUDED.user_id
    AND rc.checkin_date = EXCLUDED.checkin_date
  ;

  -- Return 0..100 for UI
  RETURN ROUND(v_computed * 10, 0);
END;
$$;

-- Ensure the daily-unique constraint exists
ALTER TABLE public.readiness_checkins
  ADD COLUMN IF NOT EXISTS checkin_date date
  GENERATED ALWAYS AS ( (checkin_at AT TIME ZONE 'UTC')::date ) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS ux_readiness_user_day
  ON public.readiness_checkins(user_id, checkin_date);

-- Ensure 0..10 ranges
ALTER TABLE public.readiness_checkins
  ALTER COLUMN energy        TYPE smallint,
  ALTER COLUMN sleep_quality TYPE smallint,
  ALTER COLUMN soreness      TYPE smallint,
  ALTER COLUMN stress        TYPE smallint,
  ALTER COLUMN mood          TYPE smallint;

-- Add constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_energy_0_10') THEN
    ALTER TABLE public.readiness_checkins ADD CONSTRAINT chk_energy_0_10 CHECK (energy BETWEEN 0 AND 10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_sleep_quality_0_10') THEN
    ALTER TABLE public.readiness_checkins ADD CONSTRAINT chk_sleep_quality_0_10 CHECK (sleep_quality BETWEEN 0 AND 10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_soreness_0_10') THEN
    ALTER TABLE public.readiness_checkins ADD CONSTRAINT chk_soreness_0_10 CHECK (soreness BETWEEN 0 AND 10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_stress_0_10') THEN
    ALTER TABLE public.readiness_checkins ADD CONSTRAINT chk_stress_0_10 CHECK (stress BETWEEN 0 AND 10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_mood_0_10') THEN
    ALTER TABLE public.readiness_checkins ADD CONSTRAINT chk_mood_0_10 CHECK (mood BETWEEN 0 AND 10);
  END IF;
END $$;