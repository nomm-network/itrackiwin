-- Fix template_exercises inserts to include required attribute_values_json field
CREATE OR REPLACE FUNCTION public.create_demo_template_for_current_user()
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit, attribute_values_json)
    VALUES (v_template_id, v_bench, 1, 3, 8, 'kg', '{}'::jsonb);
  END IF;
  IF v_ohp IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit, attribute_values_json)
    VALUES (v_template_id, v_ohp, 2, 3, 10, 'kg', '{}'::jsonb);
  END IF;
  IF v_pushdown IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit, attribute_values_json)
    VALUES (v_template_id, v_pushdown, 3, 3, 12, 'kg', '{}'::jsonb);
  END IF;

  RETURN v_template_id;
END;
$function$;