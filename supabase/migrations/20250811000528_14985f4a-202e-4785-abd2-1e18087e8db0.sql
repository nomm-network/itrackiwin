-- Fix security linter: set search_path explicitly on all functions

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.epley_1rm(weight numeric, reps int)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF weight IS NULL OR reps IS NULL OR reps <= 0 THEN
    RETURN NULL;
  END IF;
  RETURN weight * (1 + reps::numeric / 30.0);
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_prs_after_set()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_exercise_id uuid;
  v_user_id uuid;
  v_epley numeric(8,2);
BEGIN
  SELECT we.exercise_id, w.user_id
    INTO v_exercise_id, v_user_id
  FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = NEW.workout_exercise_id;

  IF v_exercise_id IS NULL OR v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.weight IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id)
    VALUES (v_user_id, v_exercise_id, 'heaviest', NEW.weight, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id)
    ON CONFLICT (user_id, exercise_id, kind)
    DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit, achieved_at = EXCLUDED.achieved_at, workout_set_id = EXCLUDED.workout_set_id
    WHERE EXCLUDED.value > public.personal_records.value;
  END IF;

  IF NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id)
    VALUES (v_user_id, v_exercise_id, 'reps', NEW.reps, 'reps', COALESCE(NEW.completed_at, now()), NEW.id)
    ON CONFLICT (user_id, exercise_id, kind)
    DO UPDATE SET value = EXCLUDED.value, achieved_at = EXCLUDED.achieved_at, workout_set_id = EXCLUDED.workout_set_id
    WHERE EXCLUDED.value > public.personal_records.value;
  END IF;

  IF NEW.weight IS NOT NULL AND NEW.reps IS NOT NULL AND NEW.reps > 0 THEN
    v_epley := public.epley_1rm(NEW.weight, NEW.reps);
    IF v_epley IS NOT NULL THEN
      INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id)
      VALUES (v_user_id, v_exercise_id, '1RM', v_epley, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id)
      ON CONFLICT (user_id, exercise_id, kind)
      DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit, achieved_at = EXCLUDED.achieved_at, workout_set_id = EXCLUDED.workout_set_id
      WHERE EXCLUDED.value > public.personal_records.value;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_workout_id uuid;
  rec RECORD;
  v_we_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.workouts(user_id) VALUES (auth.uid()) RETURNING id INTO v_workout_id;

  IF p_template_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.workout_templates t WHERE t.id = p_template_id AND t.user_id = auth.uid()) THEN
      RAISE EXCEPTION 'Template not found or not owned by user';
    END IF;

    FOR rec IN
      SELECT te.exercise_id, te.order_index, te.default_sets
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      INSERT INTO public.workout_exercises(workout_id, exercise_id, order_index)
      VALUES (v_workout_id, rec.exercise_id, rec.order_index)
      RETURNING id INTO v_we_id;

      IF rec.default_sets IS NOT NULL AND rec.default_sets > 0 THEN
        INSERT INTO public.workout_sets(workout_exercise_id, set_index, set_kind, is_completed)
        SELECT v_we_id, s, 'normal'::public.set_type, false
        FROM generate_series(1, rec.default_sets) s;
      END IF;
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.end_workout(p_workout_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.workouts SET ended_at = now()
  WHERE id = p_workout_id AND user_id = auth.uid()
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Workout not found or not owned by user';
  END IF;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_set(p_workout_exercise_id uuid, p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_set_id uuid;
  v_next_index int;
  v_kind public.set_type;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  PERFORM 1 FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = p_workout_exercise_id AND w.user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workout exercise not found or not owned by user';
  END IF;

  SELECT COALESCE(MAX(set_index), 0) + 1 INTO v_next_index
  FROM public.workout_sets WHERE workout_exercise_id = p_workout_exercise_id;

  v_kind := COALESCE((p_payload->>'set_kind')::public.set_type, 'normal');

  INSERT INTO public.workout_sets (
    workout_exercise_id, set_index, set_kind, reps, weight, weight_unit, duration_seconds, distance, rpe, notes, is_completed
  ) VALUES (
    p_workout_exercise_id,
    COALESCE((p_payload->>'set_index')::int, v_next_index),
    v_kind,
    (p_payload->>'reps')::int,
    (p_payload->>'weight')::numeric,
    COALESCE(p_payload->>'weight_unit', 'kg'),
    (p_payload->>'duration_seconds')::int,
    (p_payload->>'distance')::numeric,
    (p_payload->>'rpe')::numeric,
    NULLIF(p_payload->>'notes',''),
    COALESCE((p_payload->>'is_completed')::boolean, true)
  ) RETURNING id INTO v_set_id;

  RETURN v_set_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.clone_template_to_workout(p_template_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN public.start_workout(p_template_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_demo_template_for_current_user()
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_template_id uuid;
  v_user uuid := auth.uid();
  v_bench uuid; v_ohp uuid; v_pushdown uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_bench FROM public.exercises WHERE owner_user_id IS NULL AND slug = 'barbell-bench-press' LIMIT 1;
  SELECT id INTO v_ohp FROM public.exercises WHERE owner_user_id IS NULL AND slug = 'overhead-press' LIMIT 1;
  SELECT id INTO v_pushdown FROM public.exercises WHERE owner_user_id IS NULL AND slug = 'triceps-pushdown' LIMIT 1;

  INSERT INTO public.workout_templates(user_id, name, notes)
  VALUES (v_user, 'Push Day', 'Demo template')
  ON CONFLICT (user_id, name) DO UPDATE SET notes = EXCLUDED.notes
  RETURNING id INTO v_template_id;

  DELETE FROM public.template_exercises WHERE template_id = v_template_id;

  IF v_bench IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit)
    VALUES (v_template_id, v_bench, 1, 3, 8, 'kg');
  END IF;
  IF v_ohp IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit)
    VALUES (v_template_id, v_ohp, 2, 3, 10, 'kg');
  END IF;
  IF v_pushdown IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit)
    VALUES (v_template_id, v_pushdown, 3, 3, 12, 'kg');
  END IF;

  RETURN v_template_id;
END;
$$;