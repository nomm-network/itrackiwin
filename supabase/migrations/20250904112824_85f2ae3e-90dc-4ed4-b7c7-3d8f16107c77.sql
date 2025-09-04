-- Complete the robust start_workout function
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_workout uuid;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- create workout (note: workouts.template_id exists in your DB)
  INSERT INTO public.workouts (user_id, template_id, started_at, readiness_score)
  VALUES (v_user, p_template_id, now(), public.compute_readiness_for_user(v_user))
  RETURNING id INTO v_workout;

  -- copy template exercises (use only columns you confirmed exist)
  IF p_template_id IS NOT NULL THEN
    INSERT INTO public.workout_exercises
      (workout_id, exercise_id, order_index, target_sets, target_reps, target_weight_kg, weight_unit, notes)
    SELECT
      v_workout,
      te.exercise_id,
      te.order_index,
      te.default_sets,
      te.target_reps,
      te.target_weight_kg,
      COALESCE(te.weight_unit, 'kg'),
      te.notes
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index;
  END IF;

  RETURN v_workout;
END;
$$;

-- ensure clients can call it
GRANT EXECUTE ON FUNCTION public.start_workout(uuid) TO authenticated, anon, service_role;

-- Optional warmup auto-init trigger
CREATE OR REPLACE FUNCTION public.initialize_warmup_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.target_weight_kg IS NOT NULL THEN
    NEW.attribute_values_json :=
      jsonb_set(
        COALESCE(NEW.attribute_values_json, '{}'::jsonb),
        '{warmup}',
        public.generate_warmup_steps(NEW.target_weight_kg),
        true
      );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_init_warmup ON public.workout_exercises;
CREATE TRIGGER trg_init_warmup
  BEFORE INSERT ON public.workout_exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_warmup_before_insert();