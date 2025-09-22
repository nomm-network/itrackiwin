-- Step 1B: Add the correct unique constraint that matches the trigger function
CREATE UNIQUE INDEX IF NOT EXISTS personal_records_user_ex_kind_grip_unique
ON public.personal_records (user_id, exercise_id, kind, grip_key);

-- Step 1C: Update the trigger function to handle NULL grip_key properly
CREATE OR REPLACE FUNCTION public.upsert_prs_with_grips_after_set()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    ON CONFLICT ON CONSTRAINT personal_records_user_ex_kind_grip_unique
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
    ON CONFLICT ON CONSTRAINT personal_records_user_ex_kind_grip_unique
    DO UPDATE SET
      value         = GREATEST(public.personal_records.value, EXCLUDED.value),
      achieved_at   = CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.achieved_at ELSE public.personal_records.achieved_at END,
      workout_set_id= CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.workout_set_id ELSE public.personal_records.workout_set_id END;
  END IF;

  -- 1RM (Epley) if both present
  IF v_weight IS NOT NULL AND NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records (user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (v_user_id, v_exercise_id, '1RM', v_weight * (1 + (NEW.reps::numeric / 30.0)), 'kg', v_now, NEW.id, gkey)
    ON CONFLICT ON CONSTRAINT personal_records_user_ex_kind_grip_unique
    DO UPDATE SET
      value         = GREATEST(public.personal_records.value, EXCLUDED.value),
      unit          = EXCLUDED.unit,
      achieved_at   = CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.achieved_at ELSE public.personal_records.achieved_at END,
      workout_set_id= CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.workout_set_id ELSE public.personal_records.workout_set_id END;
  END IF;

  RETURN NEW;
END;
$$;