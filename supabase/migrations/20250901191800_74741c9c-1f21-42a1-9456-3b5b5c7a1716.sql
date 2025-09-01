-- Fix start_workout function - remove is_public column reference
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_workout_id uuid;
  v_user_id    uuid;
  v_cols_workout_ex   text[] := ARRAY['target_sets','target_reps','target_weight_kg','weight_unit','rest_seconds','notes','grip_ids'];
  v_cols_template_ex  text[] := ARRAY['default_sets','target_reps','target_weight_kg','weight_unit','rest_seconds','notes','default_grip_ids'];
  v_optional_pairs    text[][]; -- [ [we_col, te_col], ... ]
  v_cols_we_exist     text[];
  v_cols_te_exist     text[];
  v_pairs             text[];
  v_insert_cols       text;
  v_select_cols       text;
  v_sql               text;
BEGIN
  -- Who's calling?
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the workout shell
  INSERT INTO public.workouts (user_id, started_at)
  VALUES (v_user_id, now())
  RETURNING id INTO v_workout_id;

  -- If no template -> we're done
  IF p_template_id IS NULL THEN
    RETURN v_workout_id;
  END IF;

  -- Make sure the caller can use this template (owner only for now)
  IF NOT EXISTS (
    SELECT 1
    FROM public.workout_templates wt
    WHERE wt.id = p_template_id
      AND wt.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Template % not found or not accessible', p_template_id;
  END IF;

  /*
    Build a dynamic INSERT that only copies columns that exist on BOTH sides:
      template_exercises  -> workout_exercises
    Base required columns we always set: workout_id, exercise_id, order_index
    Optional pairs we'll try to map:
      workout_exercises.target_sets        <- template_exercises.default_sets
      workout_exercises.target_reps        <- template_exercises.target_reps
      workout_exercises.target_weight_kg   <- template_exercises.target_weight_kg
      workout_exercises.weight_unit        <- template_exercises.weight_unit
      workout_exercises.rest_seconds       <- template_exercises.rest_seconds
      workout_exercises.notes              <- template_exercises.notes
      workout_exercises.grip_ids           <- template_exercises.default_grip_ids
  */

  -- What optional columns really exist on workout_exercises?
  SELECT array_agg(column_name::text)
  INTO   v_cols_we_exist
  FROM   information_schema.columns
  WHERE  table_schema = 'public'
    AND  table_name   = 'workout_exercises'
    AND  column_name = ANY (v_cols_workout_ex);

  -- What optional columns really exist on template_exercises?
  SELECT array_agg(column_name::text)
  INTO   v_cols_te_exist
  FROM   information_schema.columns
  WHERE  table_schema = 'public'
    AND  table_name   = 'template_exercises'
    AND  column_name = ANY (v_cols_template_ex);

  -- Build the (we_col, te_col) pairs we can actually copy
  v_optional_pairs := ARRAY[]::text[][];
  FOR i IN 1 .. array_length(v_cols_workout_ex,1) LOOP
    IF v_cols_workout_ex[i] = ANY (COALESCE(v_cols_we_exist, ARRAY[]::text[]))
       AND v_cols_template_ex[i] = ANY (COALESCE(v_cols_te_exist, ARRAY[]::text[])) THEN
      v_optional_pairs := v_optional_pairs || ARRAY[ ARRAY[v_cols_workout_ex[i], v_cols_template_ex[i]] ];
    END IF;
  END LOOP;

  -- Assemble column lists
  v_insert_cols := 'workout_id, exercise_id, order_index';
  v_select_cols := 'v_workout_id, te.exercise_id, COALESCE(te.order_index, rn)';

  IF array_length(v_optional_pairs,1) IS NOT NULL THEN
    FOREACH v_pairs SLICE 1 IN ARRAY v_optional_pairs LOOP
      -- v_pairs[1]=we_col, v_pairs[2]=te_col
      v_insert_cols := v_insert_cols || ', ' || quote_ident(v_pairs[1]);
      -- For grip_ids copy, cast if necessary
      IF v_pairs[1] = 'grip_ids' THEN
        v_select_cols := v_select_cols || ', ' || 'te.' || quote_ident(v_pairs[2]) || '::uuid[]';
      ELSE
        v_select_cols := v_select_cols || ', ' || 'te.' || quote_ident(v_pairs[2]);
      END IF;
    END LOOP;
  END IF;

  -- Compose dynamic INSERT … SELECT
  v_sql := format($q$
    WITH te_rows AS (
      SELECT te.*,
             ROW_NUMBER() OVER (ORDER BY te.order_index NULLS LAST, te.created_at NULLS LAST, te.id) AS rn
      FROM   public.template_exercises te
      WHERE  te.template_id = %L
    )
    INSERT INTO public.workout_exercises (%s)
    SELECT %s
    FROM   te_rows te;
  $q$, p_template_id, v_insert_cols, v_select_cols);

  -- Execute the copy
  EXECUTE v_sql USING v_workout_id;

  RETURN v_workout_id;
END;
$$;