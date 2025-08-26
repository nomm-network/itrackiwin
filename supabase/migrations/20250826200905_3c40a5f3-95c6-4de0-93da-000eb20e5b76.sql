-- Fix 1: Replace set_log RPC to compute set_index on database side
CREATE OR REPLACE FUNCTION public.set_log(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_workout_exercise_id uuid;
  v_weight numeric;
  v_reps integer;
  v_weight_unit text;
  v_notes text;
  v_rpe integer;
  v_derived_rpe integer;
  v_feel text;
  v_pain boolean;
  v_set_kind public.set_type;
  v_is_completed boolean;
  v_grip_ids jsonb;
  v_grip_id uuid;
  v_next_index integer;
  v_set_id uuid;
BEGIN
  -- Extract data from payload
  v_workout_exercise_id := (p_payload->>'workout_exercise_id')::uuid;
  v_weight := (p_payload->>'weight')::numeric;
  v_reps := (p_payload->>'reps')::integer;
  v_weight_unit := COALESCE(p_payload->>'weight_unit', 'kg');
  v_notes := COALESCE(p_payload->>'notes', '');
  v_rpe := (p_payload->>'rpe')::integer;
  v_feel := p_payload->>'feel';
  v_pain := COALESCE((p_payload->>'pain')::boolean, false);
  v_set_kind := COALESCE((p_payload->>'set_kind')::public.set_type, 'normal');
  v_is_completed := COALESCE((p_payload->>'is_completed')::boolean, true);
  v_grip_ids := p_payload->'grip_ids';

  IF v_workout_exercise_id IS NULL THEN
    RAISE EXCEPTION 'workout_exercise_id is required';
  END IF;

  -- Choose first non-completed index if exists, otherwise next max+1
  SELECT COALESCE(
    (SELECT set_index
     FROM public.workout_sets
     WHERE workout_exercise_id = v_workout_exercise_id
       AND is_completed = false
     ORDER BY set_index
     LIMIT 1),
    (SELECT COALESCE(MAX(set_index) + 1, 1)
     FROM public.workout_sets
     WHERE workout_exercise_id = v_workout_exercise_id)
  ) INTO v_next_index;

  -- Derive RPE from Feel in notes if RPE not provided
  IF v_rpe IS NULL AND v_feel IS NOT NULL THEN
    -- Map Feel to RPE
    v_derived_rpe := CASE v_feel
      WHEN '++' THEN 6  -- Very easy
      WHEN '+' THEN 7   -- Easy
      WHEN '=' THEN 8   -- Just right
      WHEN '-' THEN 9   -- Hard
      WHEN '--' THEN 10 -- Maximal
      ELSE 8            -- Default to RPE 8 if no feel found
    END;
    
    v_rpe := v_derived_rpe;
  END IF;

  -- Use default RPE if still null
  IF v_rpe IS NULL THEN
    v_rpe := 8;
  END IF;

  -- Insert the workout set with computed set_index
  INSERT INTO public.workout_sets (
    workout_exercise_id,
    set_index,
    weight,
    reps,
    weight_unit,
    rpe,
    notes,
    feel,
    pain,
    set_kind,
    is_completed,
    completed_at
  ) VALUES (
    v_workout_exercise_id,
    v_next_index,
    v_weight,
    v_reps,
    v_weight_unit,
    v_rpe,
    v_notes,
    v_feel,
    v_pain,
    v_set_kind,
    v_is_completed,
    CASE WHEN v_is_completed THEN now() ELSE NULL END
  ) RETURNING id INTO v_set_id;

  -- Handle grip assignments if provided
  IF v_grip_ids IS NOT NULL THEN
    FOR v_grip_id IN SELECT value::uuid FROM jsonb_array_elements_text(v_grip_ids)
    LOOP
      INSERT INTO public.workout_set_grips (workout_set_id, grip_id)
      VALUES (v_set_id, v_grip_id)
      ON CONFLICT (workout_set_id, grip_id) DO NOTHING;
    END LOOP;
  END IF;

  -- Return success response with set_id and computed index
  RETURN jsonb_build_object(
    'success', true,
    'set_id', v_set_id,
    'set_index', v_next_index,
    'derived_rpe', v_rpe,
    'feel_detected', v_feel
  );
END;
$$;

-- Fix 2: Add warmup_feedback column to workout_exercises
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS warmup_feedback text 
CHECK (warmup_feedback IN ('not_enough', 'excellent', 'too_much'));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_workout_exercises_warmup_feedback 
ON public.workout_exercises(warmup_feedback) 
WHERE warmup_feedback IS NOT NULL;