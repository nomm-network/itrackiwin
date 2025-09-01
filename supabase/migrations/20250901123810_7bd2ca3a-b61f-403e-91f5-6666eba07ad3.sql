-- CRITICAL FIX: Personal Records Constraint Conflict Resolution (Simplified)
-- This fixes the "duplicate key value violates unique constraint" error in workout set logging

BEGIN;

-- 0) Make sure grip_key exists on personal_records and is normalized
ALTER TABLE public.personal_records
  ADD COLUMN IF NOT EXISTS grip_key text;

UPDATE public.personal_records
SET grip_key = COALESCE(grip_key, '')
WHERE grip_key IS NULL;

-- 1) Drop the specific legacy 3-col unique constraint (simplified approach)
DO $$
BEGIN
  -- Drop the known problematic constraint
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'personal_records_user_ex_kind_unique'
      AND conrelid = 'public.personal_records'::regclass
  ) THEN
    ALTER TABLE public.personal_records
    DROP CONSTRAINT personal_records_user_ex_kind_unique;
  END IF;

  -- Also check for other common variations
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'personal_records_user_id_exercise_id_kind_key'
      AND conrelid = 'public.personal_records'::regclass
  ) THEN
    ALTER TABLE public.personal_records
    DROP CONSTRAINT personal_records_user_id_exercise_id_kind_key;
  END IF;
END$$;

-- 2) Ensure the correct 4-col unique exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'personal_records_user_ex_kind_grip_unique'
      AND conrelid = 'public.personal_records'::regclass
  ) THEN
    ALTER TABLE public.personal_records
      ADD CONSTRAINT personal_records_user_ex_kind_grip_unique
      UNIQUE (user_id, exercise_id, kind, grip_key);
  END IF;
END$$;

-- 3) Replace the PR upsert function (grip-aware, simple & safe)
CREATE OR REPLACE FUNCTION public.upsert_prs_with_grips_after_set()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  gkey text;
  v_now timestamptz := now();
  v_weight numeric;
  v_user_id uuid;
  v_exercise_id uuid;
BEGIN
  -- Get user_id and exercise_id from related tables
  SELECT we.exercise_id, w.user_id
  INTO v_exercise_id, v_user_id
  FROM workout_exercises we
  JOIN workouts w ON w.id = we.workout_id
  WHERE we.id = NEW.workout_exercise_id;

  IF v_user_id IS NULL OR v_exercise_id IS NULL THEN
    RETURN NEW; -- Skip if we can't resolve IDs
  END IF;

  -- Build a stable grip key: explicit -> from workout_exercise -> empty
  IF NEW.grip_key IS NOT NULL AND NEW.grip_key != '' THEN
    gkey := NEW.grip_key;
  ELSE
    -- Try to get grip_key from workout_exercise
    SELECT 
      CASE 
        WHEN we.grip_id IS NOT NULL THEN g.slug
        ELSE ''
      END
    INTO gkey
    FROM workout_exercises we
    LEFT JOIN grips g ON g.id = we.grip_id
    WHERE we.id = NEW.workout_exercise_id;
    
    gkey := COALESCE(gkey, '');
  END IF;

  -- Get weight value
  v_weight := NEW.weight;

  -- HEAVIEST
  IF v_weight IS NOT NULL THEN
    INSERT INTO public.personal_records (user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (v_user_id, v_exercise_id, 'heaviest', v_weight, 'kg', v_now, NEW.id, gkey)
    ON CONFLICT (user_id, exercise_id, kind, grip_key)
    DO UPDATE SET
      value         = GREATEST(public.personal_records.value, EXCLUDED.value),
      unit          = EXCLUDED.unit,
      achieved_at   = CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.achieved_at ELSE public.personal_records.achieved_at END,
      workout_set_id= CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.workout_set_id ELSE public.personal_records.workout_set_id END;
  END IF;

  -- REPS
  IF NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records (user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (v_user_id, v_exercise_id, 'reps', NEW.reps, 'reps', v_now, NEW.id, gkey)
    ON CONFLICT (user_id, exercise_id, kind, grip_key)
    DO UPDATE SET
      value         = GREATEST(public.personal_records.value, EXCLUDED.value),
      achieved_at   = CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.achieved_at ELSE public.personal_records.achieved_at END,
      workout_set_id= CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.workout_set_id ELSE public.personal_records.workout_set_id END;
  END IF;

  -- 1RM (Epley) if both present
  IF v_weight IS NOT NULL AND NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records (user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (v_user_id, v_exercise_id, '1RM', v_weight * (1 + (NEW.reps::numeric / 30.0)), 'kg', v_now, NEW.id, gkey)
    ON CONFLICT (user_id, exercise_id, kind, grip_key)
    DO UPDATE SET
      value         = GREATEST(public.personal_records.value, EXCLUDED.value),
      unit          = EXCLUDED.unit,
      achieved_at   = CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.achieved_at ELSE public.personal_records.achieved_at END,
      workout_set_id= CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.workout_set_id ELSE public.personal_records.workout_set_id END;
  END IF;

  RETURN NEW;
END
$fn$;

-- 4) Make sure ONLY the correct trigger exists on workout_sets
DROP TRIGGER IF EXISTS trg_upsert_prs_after_set          ON public.workout_sets;
DROP TRIGGER IF EXISTS upsert_prs_with_grips_trigger     ON public.workout_sets;
DROP TRIGGER IF EXISTS tr_upsert_prs_with_grips_after_set ON public.workout_sets;

CREATE TRIGGER tr_upsert_prs_with_grips_after_set
AFTER INSERT OR UPDATE ON public.workout_sets
FOR EACH ROW
WHEN (NEW.is_completed = true)
EXECUTE FUNCTION public.upsert_prs_with_grips_after_set();

COMMIT;