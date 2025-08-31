-- Clean grip flow: single grip on workout_exercises, locked after first set

BEGIN;

-- 1) Ensure workout_exercises has single grip_id (not array)
DO $$
BEGIN
  -- Add single grip_id if missing
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'workout_exercises'
      AND column_name  = 'grip_id'
  ) THEN
    ALTER TABLE public.workout_exercises
    ADD COLUMN grip_id uuid NULL;
  END IF;

  -- Migrate from grip_ids array to single grip_id if needed
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'workout_exercises'
      AND column_name  = 'grip_ids'
  ) THEN
    -- Take first grip from array as the single grip
    UPDATE public.workout_exercises
    SET grip_id = grip_ids[1]
    WHERE grip_ids IS NOT NULL AND array_length(grip_ids, 1) > 0 AND grip_id IS NULL;
  END IF;
END$$;

-- 2) Remove grip storage from workout_sets (it should only be on workout_exercises)
ALTER TABLE public.workout_sets
  DROP COLUMN IF EXISTS grip_ids,
  DROP COLUMN IF EXISTS grip_key;

-- 3) Lock grip changes after first set is logged
CREATE OR REPLACE FUNCTION public.block_grip_change_after_first_set()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  set_exists boolean;
BEGIN
  -- Only care when grip_id is being changed
  IF TG_OP = 'UPDATE' AND NEW.grip_id IS DISTINCT FROM OLD.grip_id THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.workout_sets ws
      WHERE ws.workout_exercise_id = OLD.id
      LIMIT 1
    ) INTO set_exists;

    IF set_exists THEN
      RAISE EXCEPTION 'Grip cannot be changed after the first set is logged for this exercise.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach the trigger to workout_exercises
DROP TRIGGER IF EXISTS trg_block_grip_change_after_first_set ON public.workout_exercises;
CREATE TRIGGER trg_block_grip_change_after_first_set
BEFORE UPDATE ON public.workout_exercises
FOR EACH ROW
EXECUTE FUNCTION public.block_grip_change_after_first_set();

-- 4) Clean up old broken triggers/functions
DROP TRIGGER IF EXISTS trg_upsert_prs_after_set ON public.workout_sets;
DROP TRIGGER IF EXISTS upsert_prs_with_grips_trigger ON public.workout_sets;
DROP TRIGGER IF EXISTS tr_upsert_prs_with_grips_after_set ON public.workout_sets;
DROP FUNCTION IF EXISTS public.upsert_prs_after_set();

-- 5) PR function that reads grip from workout_exercises (not from sets)
CREATE OR REPLACE FUNCTION public.upsert_prs_with_grips_after_set()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_exercise_id uuid;
  v_grip_key text;
  v_estimated_1rm numeric;
  v_workout_id uuid;
BEGIN
  -- Only process completed sets with weight and reps
  IF NEW.is_completed != true OR NEW.weight IS NULL OR NEW.reps IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get user_id, exercise_id, and grip from workout_exercises
  SELECT w.user_id, we.exercise_id, COALESCE(we.grip_id::text, ''), w.id
  INTO v_user_id, v_exercise_id, v_grip_key, v_workout_id
  FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = NEW.workout_exercise_id;

  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate estimated 1RM using Epley formula
  v_estimated_1rm := NEW.weight * (1 + NEW.reps::numeric / 30.0);

  -- Upsert heaviest weight PR
  INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
  VALUES (v_user_id, v_exercise_id, 'heaviest', NEW.weight, 'kg', NEW.completed_at, NEW.id, v_grip_key)
  ON CONFLICT (user_id, exercise_id, kind, grip_key)
  DO UPDATE SET
    value = GREATEST(EXCLUDED.value, personal_records.value),
    achieved_at = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.achieved_at ELSE personal_records.achieved_at END,
    workout_set_id = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.workout_set_id ELSE personal_records.workout_set_id END;

  -- Upsert most reps PR
  INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
  VALUES (v_user_id, v_exercise_id, 'reps', NEW.reps, 'reps', NEW.completed_at, NEW.id, v_grip_key)
  ON CONFLICT (user_id, exercise_id, kind, grip_key)
  DO UPDATE SET
    value = GREATEST(EXCLUDED.value, personal_records.value),
    achieved_at = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.achieved_at ELSE personal_records.achieved_at END,
    workout_set_id = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.workout_set_id ELSE personal_records.workout_set_id END;

  -- Upsert estimated 1RM PR
  INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
  VALUES (v_user_id, v_exercise_id, '1RM', v_estimated_1rm, 'kg', NEW.completed_at, NEW.id, v_grip_key)
  ON CONFLICT (user_id, exercise_id, kind, grip_key)
  DO UPDATE SET
    value = GREATEST(EXCLUDED.value, personal_records.value),
    achieved_at = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.achieved_at ELSE personal_records.achieved_at END,
    workout_set_id = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.workout_set_id ELSE personal_records.workout_set_id END;

  RETURN NEW;
END;
$$;

-- Attach the clean trigger
CREATE TRIGGER tr_upsert_prs_with_grips_after_set
AFTER INSERT OR UPDATE ON public.workout_sets
FOR EACH ROW
EXECUTE FUNCTION public.upsert_prs_with_grips_after_set();

-- 6) Clean up the normalize_grip_key function (no longer needed)
DROP FUNCTION IF EXISTS public.normalize_grip_key(uuid[]);

COMMIT;