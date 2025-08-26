-- Add grip support to template and workout exercises
-- This enables multiple instances of the same exercise with different grips

-- Add grip_ids and display_name to template_exercises
ALTER TABLE public.template_exercises
  ADD COLUMN grip_ids uuid[] NULL,
  ADD COLUMN display_name text NULL;

-- Add grip_ids, display_name, and computed grip_key to workout_exercises
ALTER TABLE public.workout_exercises
  ADD COLUMN grip_ids uuid[] NULL,
  ADD COLUMN display_name text NULL,
  ADD COLUMN grip_key text GENERATED ALWAYS AS (
    CASE WHEN grip_ids IS NULL THEN NULL
         ELSE array_to_string(array(SELECT unnest(grip_ids::text[]) ORDER BY 1), ',')
    END
  ) STORED;

-- Add grip_key to user_exercise_estimates for grip-specific progression
ALTER TABLE public.user_exercise_estimates
  ADD COLUMN grip_key text NULL;

-- Create index for grip-specific estimate lookups
CREATE INDEX IF NOT EXISTS idx_user_ex_est_grip
  ON public.user_exercise_estimates(user_id, exercise_id, grip_key);

-- Add grip_key to personal_records for grip-specific PRs
ALTER TABLE public.personal_records
  ADD COLUMN grip_key text NULL;

-- Update the unique constraint to include grip_key
-- First drop the old constraint
ALTER TABLE public.personal_records 
  DROP CONSTRAINT IF EXISTS personal_records_user_id_exercise_id_kind_key;

-- Add new unique constraint that includes grip_key (fixed syntax)
ALTER TABLE public.personal_records 
  ADD CONSTRAINT personal_records_user_id_exercise_id_kind_grip_key 
  UNIQUE (user_id, exercise_id, kind, grip_key);

-- Create index for grip-specific PR lookups
CREATE INDEX IF NOT EXISTS idx_personal_records_grip
  ON public.personal_records(user_id, exercise_id, kind, grip_key);

-- Update the PR trigger to use grip information
CREATE OR REPLACE FUNCTION public.upsert_prs_with_grips_after_set()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_exercise_id uuid;
  v_user_id uuid;
  v_epley numeric(8,2);
  v_grip_key text;
BEGIN
  -- Get exercise, user info, and grip key
  SELECT we.exercise_id, w.user_id, we.grip_key
    INTO v_exercise_id, v_user_id, v_grip_key
  FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = NEW.workout_exercise_id;

  IF v_exercise_id IS NULL OR v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Update PRs with grip key consideration
  IF NEW.weight IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (v_user_id, v_exercise_id, 'heaviest', NEW.weight, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id, v_grip_key)
    ON CONFLICT (user_id, exercise_id, kind, grip_key)
    DO UPDATE SET 
      value = EXCLUDED.value, 
      unit = EXCLUDED.unit, 
      achieved_at = EXCLUDED.achieved_at, 
      workout_set_id = EXCLUDED.workout_set_id
    WHERE EXCLUDED.value > public.personal_records.value;
  END IF;

  IF NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (v_user_id, v_exercise_id, 'reps', NEW.reps, 'reps', COALESCE(NEW.completed_at, now()), NEW.id, v_grip_key)
    ON CONFLICT (user_id, exercise_id, kind, grip_key)
    DO UPDATE SET 
      value = EXCLUDED.value, 
      achieved_at = EXCLUDED.achieved_at, 
      workout_set_id = EXCLUDED.workout_set_id
    WHERE EXCLUDED.value > public.personal_records.value;
  END IF;

  IF NEW.weight IS NOT NULL AND NEW.reps IS NOT NULL AND NEW.reps > 0 THEN
    v_epley := public.epley_1rm(NEW.weight, NEW.reps);
    IF v_epley IS NOT NULL THEN
      INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
      VALUES (v_user_id, v_exercise_id, '1RM', v_epley, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id, v_grip_key)
      ON CONFLICT (user_id, exercise_id, kind, grip_key)
      DO UPDATE SET 
        value = EXCLUDED.value, 
        unit = EXCLUDED.unit, 
        achieved_at = EXCLUDED.achieved_at, 
        workout_set_id = EXCLUDED.workout_set_id
      WHERE EXCLUDED.value > public.personal_records.value;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Replace the old trigger with the new one
DROP TRIGGER IF EXISTS tr_upsert_prs_after_set ON public.workout_sets;
CREATE TRIGGER tr_upsert_prs_with_grips_after_set
  AFTER INSERT OR UPDATE ON public.workout_sets
  FOR EACH ROW EXECUTE FUNCTION public.upsert_prs_with_grips_after_set();