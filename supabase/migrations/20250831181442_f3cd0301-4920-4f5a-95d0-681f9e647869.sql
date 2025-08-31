-- 2.3 Recreate the single, correct trigger + function
-- First, let's check the workout_sets structure to match field names correctly
-- Based on the schema, we'll adapt the trigger function

CREATE OR REPLACE FUNCTION public.upsert_prs_with_grips_after_set()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id      uuid;
  v_exercise_id  uuid;
  v_kind         text;
  v_value        numeric;
  v_unit         text := 'kg';
  v_grip_key     text;
  workout_user_id uuid;
BEGIN
  -- Skip if set is not completed
  IF NEW.is_completed IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  -- Get user_id and exercise_id from workout_exercises and workouts
  SELECT w.user_id, we.exercise_id
  INTO workout_user_id, v_exercise_id
  FROM workout_exercises we
  JOIN workouts w ON w.id = we.workout_id
  WHERE we.id = NEW.workout_exercise_id;

  IF workout_user_id IS NULL OR v_exercise_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_user_id := workout_user_id;
  
  -- Get grip key from workout_set_grips table
  SELECT string_agg(wsg.grip_id::text, ',' ORDER BY wsg.grip_id)
  INTO v_grip_key
  FROM workout_set_grips wsg
  WHERE wsg.workout_set_id = NEW.id;
  
  v_grip_key := COALESCE(v_grip_key, '');

  -- Record heaviest weight (if weight exists)
  IF NEW.weight IS NOT NULL AND NEW.weight > 0 THEN
    v_kind := 'heaviest';
    v_value := NEW.weight;
    
    INSERT INTO personal_records (user_id, exercise_id, kind, value, unit, achieved_at, grip_key)
    VALUES (v_user_id, v_exercise_id, v_kind, v_value, v_unit, COALESCE(NEW.completed_at, now()), v_grip_key)
    ON CONFLICT ON CONSTRAINT pr_user_ex_kind_grip_uniq
    DO UPDATE SET 
       value = GREATEST(personal_records.value, EXCLUDED.value),
       unit = EXCLUDED.unit,
       achieved_at = CASE 
         WHEN EXCLUDED.value > personal_records.value 
         THEN EXCLUDED.achieved_at 
         ELSE personal_records.achieved_at 
       END;
  END IF;

  -- Record most reps (if reps exists)
  IF NEW.reps IS NOT NULL AND NEW.reps > 0 THEN
    v_kind := 'reps';
    v_value := NEW.reps;
    
    INSERT INTO personal_records (user_id, exercise_id, kind, value, unit, achieved_at, grip_key)
    VALUES (v_user_id, v_exercise_id, v_kind, v_value, 'reps', COALESCE(NEW.completed_at, now()), v_grip_key)
    ON CONFLICT ON CONSTRAINT pr_user_ex_kind_grip_uniq
    DO UPDATE SET 
       value = GREATEST(personal_records.value, EXCLUDED.value),
       unit = EXCLUDED.unit,
       achieved_at = CASE 
         WHEN EXCLUDED.value > personal_records.value 
         THEN EXCLUDED.achieved_at 
         ELSE personal_records.achieved_at 
       END;
  END IF;

  -- Calculate and record estimated 1RM (if both weight and reps exist)
  IF NEW.weight IS NOT NULL AND NEW.reps IS NOT NULL AND NEW.weight > 0 AND NEW.reps > 0 THEN
    v_kind := '1RM';
    v_value := NEW.weight * (1 + NEW.reps::numeric / 30.0);  -- Epley formula
    
    INSERT INTO personal_records (user_id, exercise_id, kind, value, unit, achieved_at, grip_key)
    VALUES (v_user_id, v_exercise_id, v_kind, v_value, v_unit, COALESCE(NEW.completed_at, now()), v_grip_key)
    ON CONFLICT ON CONSTRAINT pr_user_ex_kind_grip_uniq
    DO UPDATE SET 
       value = GREATEST(personal_records.value, EXCLUDED.value),
       unit = EXCLUDED.unit,
       achieved_at = CASE 
         WHEN EXCLUDED.value > personal_records.value 
         THEN EXCLUDED.achieved_at 
         ELSE personal_records.achieved_at 
       END;
  END IF;

  RETURN NEW;
END
$$;

-- Create the trigger
CREATE TRIGGER tr_upsert_prs_with_grips_after_set
AFTER INSERT OR UPDATE ON workout_sets
FOR EACH ROW
EXECUTE FUNCTION upsert_prs_with_grips_after_set();