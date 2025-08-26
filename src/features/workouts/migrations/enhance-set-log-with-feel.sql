-- Migration: Enhance set_log function to derive RPE from Feel in notes
-- This allows the UI to only use Feel while keeping RPE for internal calculations

CREATE OR REPLACE FUNCTION public.set_log(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_set_id uuid;
  v_workout_exercise_id uuid;
  v_weight numeric;
  v_reps integer;
  v_weight_unit text;
  v_notes text;
  v_rpe integer;
  v_derived_rpe integer;
  v_feel text;
  v_set_kind public.set_type;
  v_is_completed boolean;
  v_grip_ids jsonb;
  v_grip_id uuid;
BEGIN
  -- Extract data from payload
  v_workout_exercise_id := (p_payload->>'workout_exercise_id')::uuid;
  v_weight := (p_payload->>'weight')::numeric;
  v_reps := (p_payload->>'reps')::integer;
  v_weight_unit := COALESCE(p_payload->>'weight_unit', 'kg');
  v_notes := COALESCE(p_payload->>'notes', '');
  v_rpe := (p_payload->>'rpe')::integer;
  v_set_kind := COALESCE((p_payload->>'set_kind')::public.set_type, 'normal');
  v_is_completed := COALESCE((p_payload->>'is_completed')::boolean, true);
  v_grip_ids := p_payload->'grip_ids';

  -- Derive RPE from Feel in notes if RPE not provided
  IF v_rpe IS NULL AND v_notes IS NOT NULL THEN
    -- Extract feel from notes (format: "Feel: ++")
    v_feel := (regexp_match(v_notes, 'Feel:\s*(--|-|=|\+|\+\+)'))[1];
    
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

  -- Insert the workout set
  INSERT INTO public.workout_sets (
    workout_exercise_id,
    weight,
    reps,
    weight_unit,
    rpe,
    notes,
    set_kind,
    is_completed
  ) VALUES (
    v_workout_exercise_id,
    v_weight,
    v_reps,
    v_weight_unit,
    v_rpe,
    v_notes,
    v_set_kind,
    v_is_completed
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

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'set_id', v_set_id,
    'derived_rpe', v_rpe,
    'feel_detected', v_feel
  );
END;
$$;