-- Fix start_workout function to properly copy template exercises
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id          uuid;
  v_workout_id       uuid;
  v_score            numeric;     -- readiness 0..100
  v_multiplier       numeric;     -- readiness multiplier (e.g. 1.02)
  rec                RECORD;      -- template exercise row
  v_base_weight      numeric;     -- picked from last 3 workouts 60 days (helper)
  v_target_weight    numeric;     -- final target for this workout
  v_attr             jsonb;       -- attribute_values_json builder
  v_template_name    text;        -- template name for workout title
BEGIN
  -- Auth
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get template name for workout title
  IF p_template_id IS NOT NULL THEN
    SELECT name INTO v_template_name
    FROM public.workout_templates
    WHERE id = p_template_id AND user_id = v_user_id;
    
    IF v_template_name IS NULL THEN
      RAISE EXCEPTION 'Template not found or access denied';
    END IF;
  END IF;

  -- Create workout shell with template name as title
  INSERT INTO public.workouts (user_id, started_at, template_id, title)
  VALUES (v_user_id, now(), p_template_id, COALESCE(v_template_name, 'Custom Workout'))
  RETURNING id INTO v_workout_id;

  -- If no template: just return new workout id
  IF p_template_id IS NULL THEN
    RETURN v_workout_id;
  END IF;

  -- Compute readiness (uses your implemented function)
  SELECT COALESCE(public.compute_readiness_for_user(v_user_id), 65)
  INTO v_score;

  -- Readiness multiplier (0.90 .. 1.08 etc.)
  SELECT COALESCE(public.readiness_multiplier(v_score), 1.0)
  INTO v_multiplier;

  -- Copy template_exercises → workout_exercises
  -- CRITICAL: Copy ALL template exercises, don't filter by user ownership here
  FOR rec IN
    SELECT te.exercise_id,
           te.order_index,
           te.default_sets,
           te.target_reps,
           te.target_weight_kg,
           te.weight_unit,
           te.default_warmup_plan
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index NULLS LAST
  LOOP
    -- pick base load (helper fn)
    SELECT COALESCE(public.pick_base_load(v_user_id, rec.exercise_id), 0)
    INTO v_base_weight;

    -- decide target_weight:
    -- prefer explicit template target; otherwise base*multiplier; otherwise NULL
    v_target_weight :=
      COALESCE(
        rec.target_weight_kg,
        CASE
          WHEN v_base_weight > 0 THEN ROUND(v_base_weight * v_multiplier, 1)
          ELSE NULL
        END
      );

    -- build attribute_values_json: store base & readiness for transparency
    v_attr := jsonb_build_object(
      'base_weight_kg',        v_base_weight,
      'readiness_score',       v_score,
      'readiness_multiplier',  v_multiplier
    );

    -- add warmup if we have a target or default warmup plan
    IF v_target_weight IS NOT NULL THEN
      v_attr := jsonb_set(
        v_attr,
        '{warmup}',
        COALESCE(rec.default_warmup_plan, public.generate_warmup_steps(v_target_weight)),
        true
      );
    ELSIF rec.default_warmup_plan IS NOT NULL THEN
      v_attr := jsonb_set(
        v_attr,
        '{warmup}',
        rec.default_warmup_plan,
        true
      );
    END IF;

    -- insert workout_exercise row
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      target_sets,
      target_reps,
      target_weight_kg,
      weight_unit,
      attribute_values_json
    )
    VALUES (
      v_workout_id,
      rec.exercise_id,
      rec.order_index,
      rec.default_sets,
      rec.target_reps,
      v_target_weight,
      COALESCE(rec.weight_unit, 'kg'),
      v_attr
    );
  END LOOP;

  -- also store workout-level readiness snapshot
  UPDATE public.workouts
  SET readiness_score = v_score
  WHERE id = v_workout_id;

  RETURN v_workout_id;
END;
$function$;