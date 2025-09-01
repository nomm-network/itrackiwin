-- 1) Safety: remove any legacy version that referenced t.is_public etc.
DROP FUNCTION IF EXISTS public.start_workout(uuid);

-- 2) Robust starter that adapts to the columns actually present
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id        uuid := auth.uid();
  v_workout_id     uuid;
  v_we_id          uuid;

  -- what columns exist on workout_exercises in THIS database?
  has_target_sets  boolean;
  has_target_reps  boolean;
  has_target_wkg   boolean;
  has_weight_unit  boolean;
  has_rest_secs    boolean;

  rec record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.workouts (user_id, started_at)
  VALUES (v_user_id, now())
  RETURNING id INTO v_workout_id;

  IF p_template_id IS NOT NULL THEN
    -- validate ownership (no is_public column in workout_templates)
    PERFORM 1
    FROM public.workout_templates wt
    WHERE wt.id = p_template_id AND wt.user_id = v_user_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Template not found or access denied';
    END IF;

    -- column presence checks (make the function resilient to schema drift)
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='workout_exercises' AND column_name='target_sets'
    ) INTO has_target_sets;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='workout_exercises' AND column_name='target_reps'
    ) INTO has_target_reps;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='workout_exercises' AND column_name='target_weight_kg'
    ) INTO has_target_wkg;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='workout_exercises' AND column_name='weight_unit'
    ) INTO has_weight_unit;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='workout_exercises' AND column_name='rest_seconds'
    ) INTO has_rest_secs;

    FOR rec IN
      SELECT
        te.exercise_id,
        te.order_index,
        te.default_sets                         AS tmpl_sets,
        te.target_reps                          AS tmpl_reps,
        COALESCE(te.target_weight_kg, te.target_weight)::numeric AS tmpl_weight_kg,
        te.weight_unit                          AS tmpl_unit,
        te.rest_seconds                         AS tmpl_rest,
        te.notes
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      -- always insert the minimal, always-present columns
      INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, notes)
      VALUES (v_workout_id, rec.exercise_id, rec.order_index, rec.notes)
      RETURNING id INTO v_we_id;

      -- set optional targets only if those columns exist
      IF has_target_sets  THEN
        UPDATE public.workout_exercises SET target_sets      = rec.tmpl_sets  WHERE id = v_we_id;
      END IF;
      IF has_target_reps  THEN
        UPDATE public.workout_exercises SET target_reps      = rec.tmpl_reps  WHERE id = v_we_id;
      END IF;
      IF has_target_wkg   THEN
        UPDATE public.workout_exercises SET target_weight_kg = rec.tmpl_weight_kg WHERE id = v_we_id;
      END IF;
      IF has_weight_unit  THEN
        UPDATE public.workout_exercises SET weight_unit      = COALESCE(rec.tmpl_unit, 'kg') WHERE id = v_we_id;
      END IF;
      IF has_rest_secs    THEN
        UPDATE public.workout_exercises SET rest_seconds     = rec.tmpl_rest WHERE id = v_we_id;
      END IF;
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$$;