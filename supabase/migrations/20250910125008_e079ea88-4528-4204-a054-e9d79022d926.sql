-- Drop existing function and recreate with proper return type
DROP FUNCTION IF EXISTS public.upsert_readiness_today(smallint,smallint,numeric,smallint,smallint,smallint,boolean,boolean,boolean);

-- Ensure mood column exists in readiness_checkins
ALTER TABLE public.readiness_checkins 
ADD COLUMN IF NOT EXISTS mood smallint DEFAULT 6;

-- Ensure checkin_date exists and is filled
ALTER TABLE public.readiness_checkins
ADD COLUMN IF NOT EXISTS checkin_date date;

-- Auto-fill checkin_date trigger
CREATE OR REPLACE FUNCTION public._rc_fill_checkin_date()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.checkin_date IS NULL THEN
    NEW.checkin_date := (NEW.checkin_at AT TIME ZONE 'UTC')::date;
  END IF;
  RETURN NEW;
END $$;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_rc_fill_checkin_date'
  ) THEN
    CREATE TRIGGER trg_rc_fill_checkin_date
    BEFORE INSERT OR UPDATE ON public.readiness_checkins
    FOR EACH ROW EXECUTE FUNCTION public._rc_fill_checkin_date();
  END IF;
END $$;

-- Create unique index for daily uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS readiness_unique_user_date
  ON public.readiness_checkins(user_id, checkin_date);

-- 1) One clear scoring function (0–100)
CREATE OR REPLACE FUNCTION public.compute_readiness_from_values(
  p_energy smallint,               -- 0..10
  p_sleep_quality smallint,        -- 0..10
  p_sleep_hours numeric,           -- e.g. 7.5
  p_soreness smallint,             -- 0..10 (higher = worse)
  p_stress smallint,               -- 0..10 (higher = worse)
  p_mood smallint,                 -- 0..10
  p_energizers boolean,            -- true/false
  p_illness boolean,               -- true/false
  p_alcohol boolean                -- true/false
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  n_energy          numeric := LEAST(GREATEST(COALESCE(p_energy,        5)/10.0,0),1);
  n_sleep_quality   numeric := LEAST(GREATEST(COALESCE(p_sleep_quality, 5)/10.0,0),1);
  sleep_hours_score numeric := LEAST(GREATEST(1 - ABS(COALESCE(p_sleep_hours,8)-8)/4.0,0),1);
  soreness_score    numeric := 1 - LEAST(GREATEST(COALESCE(p_soreness,  0)/10.0,0),1);
  stress_score      numeric := 1 - LEAST(GREATEST(COALESCE(p_stress,    0)/10.0,0),1);
  mood_score        numeric := LEAST(GREATEST(COALESCE(p_mood,          6)/10.0,0),1);
  energizers_score  numeric := CASE WHEN COALESCE(p_energizers,false) THEN 0.8 ELSE 0.2 END;
  base              numeric;
  score_0_100       numeric;
BEGIN
  base :=
      0.20*n_energy
    + 0.18*n_sleep_quality
    + 0.15*sleep_hours_score
    + 0.15*soreness_score
    + 0.12*stress_score
    + 0.10*mood_score
    + 0.10*energizers_score;

  score_0_100 := LEAST(GREATEST(base,0),1)*100;

  IF COALESCE(p_illness,false)  THEN score_0_100 := score_0_100 - 20; END IF;
  IF COALESCE(p_alcohol,false)  THEN score_0_100 := score_0_100 - 10; END IF;

  RETURN LEAST(GREATEST(score_0_100,0),100);
END $$;

-- 2) Make daily upsert unambiguous (no bare column names)
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
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_id uuid;
  v_score numeric;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Upsert the raw inputs first (no "score" math here)
  WITH ins AS (
    INSERT INTO public.readiness_checkins AS rc
      (user_id, checkin_at, checkin_date,
       energy, sleep_quality, sleep_hours, soreness, stress, mood,
       energizers, illness, alcohol)
    VALUES
      (v_user, now(), v_today,
       p_energy, p_sleep_quality, p_sleep_hours, p_soreness, p_stress, p_mood,
       p_energizers, p_illness, p_alcohol)
    ON CONFLICT (user_id, checkin_date) DO UPDATE SET
      energy        = EXCLUDED.energy,
      sleep_quality = EXCLUDED.sleep_quality,
      sleep_hours   = EXCLUDED.sleep_hours,
      soreness      = EXCLUDED.soreness,
      stress        = EXCLUDED.stress,
      mood          = EXCLUDED.mood,
      energizers    = EXCLUDED.energizers,
      illness       = EXCLUDED.illness,
      alcohol       = EXCLUDED.alcohol,
      checkin_at    = now()
    RETURNING rc.id,
              rc.energy, rc.sleep_quality, rc.sleep_hours,
              rc.soreness, rc.stress, rc.mood,
              rc.energizers, rc.illness, rc.alcohol
  ),
  scored AS (
    SELECT
      id,
      public.compute_readiness_from_values(
        energy, sleep_quality, sleep_hours, soreness, stress, mood,
        energizers, illness, alcohol
      ) AS score
    FROM ins
  )
  UPDATE public.readiness_checkins rc
     SET score = s.score,
         computed_at = now()
    FROM scored s
   WHERE rc.id = s.id
   RETURNING rc.id, rc.score
   INTO v_id, v_score;

  RETURN v_score; -- 0..100
END $$;