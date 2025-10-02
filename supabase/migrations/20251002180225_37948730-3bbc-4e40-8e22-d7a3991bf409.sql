-- Update start_workout function to load and apply user exercise preferences
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid, p_program_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_workout_id uuid;
  v_user_id uuid;
  v_program_rep_min integer;
  v_program_rep_max integer;
  rec RECORD;
  v_pref RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- If program_id provided, get its default rep ranges
  IF p_program_id IS NOT NULL THEN
    SELECT default_rep_min, default_rep_max
    INTO v_program_rep_min, v_program_rep_max
    FROM public.training_programs
    WHERE id = p_program_id AND user_id = v_user_id;
  END IF;

  -- Create workout with program reference if provided
  INSERT INTO public.workouts (user_id, started_at, template_id, program_id)
  VALUES (v_user_id, now(), p_template_id, p_program_id)
  RETURNING id INTO v_workout_id;

  IF p_template_id IS NOT NULL THEN
    FOR rec IN
      SELECT 
        te.exercise_id,
        te.order_index,
        te.default_sets AS target_sets,
        te.target_reps,
        te.target_weight_kg,
        te.weight_unit,
        te.notes
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY COALESCE(te.order_index, 9999)
    LOOP
      -- Try to get user preferences for this exercise
      -- Priority: template-specific > program-specific > general
      SELECT 
        preferred_target_sets,
        preferred_rep_min,
        preferred_rep_max,
        preferred_grip_ids
      INTO v_pref
      FROM public.user_exercise_preferences
      WHERE user_id = v_user_id 
        AND exercise_id = rec.exercise_id
        AND (
          template_id = p_template_id OR
          (template_id IS NULL AND program_id = p_program_id) OR
          (template_id IS NULL AND program_id IS NULL)
        )
      ORDER BY 
        CASE WHEN template_id = p_template_id THEN 1
             WHEN program_id = p_program_id THEN 2
             ELSE 3
        END
      LIMIT 1;

      INSERT INTO public.workout_exercises (
        workout_id,
        exercise_id,
        order_index,
        target_sets,
        target_reps,
        target_reps_min,
        target_reps_max,
        target_weight_kg,
        weight_unit,
        notes,
        grip_ids
      ) VALUES (
        v_workout_id,
        rec.exercise_id,
        rec.order_index,
        -- Use preference if available, otherwise template value
        COALESCE(v_pref.preferred_target_sets, rec.target_sets),
        -- If program provided, don't use target_reps (use range instead)
        CASE WHEN p_program_id IS NOT NULL THEN NULL ELSE rec.target_reps END,
        -- Use preference > program > null
        COALESCE(v_pref.preferred_rep_min, v_program_rep_min, NULL),
        COALESCE(v_pref.preferred_rep_max, v_program_rep_max, NULL),
        rec.target_weight_kg,
        COALESCE(rec.weight_unit, 'kg'),
        rec.notes,
        -- Use preferred grips if available
        v_pref.preferred_grip_ids
      );
    END LOOP;
  END IF;

  -- Seed initial targets (last set/PR/estimates) for first-set warm-up & targets
  PERFORM public.apply_initial_targets(v_workout_id);

  RETURN v_workout_id;
END
$function$;