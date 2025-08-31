-- COMPLETE FIX: Normalize grip_key and ensure idempotent PR upserts
-- Issue: Second set fails due to grip_key inconsistency and trigger issues

-- 1) Helper function: returns stable grip_key ("id1,id2", or '' if none)
CREATE OR REPLACE FUNCTION public.make_grip_key(_grip_ids uuid[])
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
           array_to_string(
             (SELECT ARRAY(
                SELECT g::text
                FROM UNNEST(_grip_ids) g
                WHERE g IS NOT NULL
                ORDER BY g::text   -- stable order
             )), ','
           ),
           ''
         );
$$;

-- 2) Fix the PR upsert function to be truly idempotent
CREATE OR REPLACE FUNCTION public.upsert_prs_with_grips_after_set()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_exercise_id uuid;
  v_user_id uuid;
  v_epley numeric(8,2);
  v_grip_key text;
BEGIN
  -- Get exercise, user info, and normalized grip key
  SELECT we.exercise_id, w.user_id, public.make_grip_key(we.grip_ids)
    INTO v_exercise_id, v_user_id, v_grip_key
  FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = NEW.workout_exercise_id;

  IF v_exercise_id IS NULL OR v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Upsert weight PR (heaviest)
  IF NEW.weight IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (v_user_id, v_exercise_id, 'heaviest', NEW.weight, COALESCE(NEW.weight_unit, 'kg'), COALESCE(NEW.completed_at, now()), NEW.id, v_grip_key)
    ON CONFLICT (user_id, exercise_id, kind, grip_key)
    DO UPDATE SET 
      value = GREATEST(EXCLUDED.value, personal_records.value),
      unit = EXCLUDED.unit,
      achieved_at = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.achieved_at ELSE personal_records.achieved_at END,
      workout_set_id = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.workout_set_id ELSE personal_records.workout_set_id END;
  END IF;

  -- Upsert reps PR
  IF NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (v_user_id, v_exercise_id, 'reps', NEW.reps, 'reps', COALESCE(NEW.completed_at, now()), NEW.id, v_grip_key)
    ON CONFLICT (user_id, exercise_id, kind, grip_key)
    DO UPDATE SET 
      value = GREATEST(EXCLUDED.value, personal_records.value),
      achieved_at = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.achieved_at ELSE personal_records.achieved_at END,
      workout_set_id = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.workout_set_id ELSE personal_records.workout_set_id END;
  END IF;

  -- Upsert 1RM PR
  IF NEW.weight IS NOT NULL AND NEW.reps IS NOT NULL AND NEW.reps > 0 THEN
    v_epley := public.epley_1rm(NEW.weight, NEW.reps);
    IF v_epley IS NOT NULL THEN
      INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
      VALUES (v_user_id, v_exercise_id, '1RM', v_epley, COALESCE(NEW.weight_unit, 'kg'), COALESCE(NEW.completed_at, now()), NEW.id, v_grip_key)
      ON CONFLICT (user_id, exercise_id, kind, grip_key)
      DO UPDATE SET 
        value = GREATEST(EXCLUDED.value, personal_records.value),
        unit = EXCLUDED.unit,
        achieved_at = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.achieved_at ELSE personal_records.achieved_at END,
        workout_set_id = CASE WHEN EXCLUDED.value > personal_records.value THEN EXCLUDED.workout_set_id ELSE personal_records.workout_set_id END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Ensure the trigger exists
DROP TRIGGER IF EXISTS tr_upsert_prs_with_grips_after_set ON public.workout_sets;
CREATE TRIGGER tr_upsert_prs_with_grips_after_set
  AFTER INSERT OR UPDATE ON public.workout_sets
  FOR EACH ROW EXECUTE FUNCTION public.upsert_prs_with_grips_after_set();

-- 4) Create normalized unique index for extra safety with NULL grip_keys
CREATE UNIQUE INDEX IF NOT EXISTS ux_pr_user_ex_kind_grip_norm
  ON public.personal_records (user_id, exercise_id, kind, COALESCE(grip_key,''));