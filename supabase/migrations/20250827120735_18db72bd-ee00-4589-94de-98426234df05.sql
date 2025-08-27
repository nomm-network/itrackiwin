-- Create localized exercises view
CREATE OR REPLACE VIEW public.v_exercises_localized AS
SELECT 
  e.id,
  e.slug,
  e.primary_muscle_id,
  e.equipment_id,
  e.load_type,
  e.requires_handle,
  e.allows_grips,
  e.is_unilateral,
  COALESCE(et_user.name, et_en.name) AS name,
  COALESCE(et_user.description, et_en.description) AS description
FROM public.exercises e
LEFT JOIN public.exercises_translations et_user
  ON et_user.exercise_id = e.id
  AND et_user.language_code = COALESCE(current_setting('app.lang', true), 'en')
LEFT JOIN public.exercises_translations et_en
  ON et_en.exercise_id = e.id
  AND et_en.language_code = 'en';

-- Warmup recalculation function
CREATE OR REPLACE FUNCTION public.recalc_warmup_from_last_set(p_workout_exercise_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  wex  RECORD;
  s    RECORD;
  top_weight numeric;
  top_reps   int;
  base jsonb;
  steps jsonb;
  adj_reps1 int := 12;
  adj_reps2 int := 10;
  adj_reps3 int := 8;
BEGIN
  SELECT * INTO wex FROM public.workout_exercises WHERE id = p_workout_exercise_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Get last completed set
  SELECT weight, reps
  INTO s
  FROM public.workout_sets
  WHERE workout_exercise_id = p_workout_exercise_id
    AND is_completed = true
  ORDER BY COALESCE(weight,0) DESC, completed_at DESC
  LIMIT 1;

  IF NOT FOUND OR s.weight IS NULL THEN
    top_weight := NULL;
  ELSE
    top_weight := s.weight;
    top_reps   := s.reps;
  END IF;

  -- Fallback to target weight if no completed sets
  IF top_weight IS NULL THEN
    SELECT target_weight INTO top_weight FROM public.workout_exercises WHERE id = p_workout_exercise_id;
  END IF;

  IF top_weight IS NULL THEN
    RETURN;
  END IF;

  -- Baseline warmup steps
  steps := jsonb_build_array(
    jsonb_build_object('label','W1','percent',0.40,'reps',adj_reps1,'rest_sec',45),
    jsonb_build_object('label','W2','percent',0.60,'reps',adj_reps2,'rest_sec',60),
    jsonb_build_object('label','W3','percent',0.80,'reps',adj_reps3,'rest_sec',60)
  );

  -- Adjust by feedback
  IF wex.warmup_feedback = 'too_little' THEN
    steps := jsonb_set(steps,'{0,reps}', to_jsonb(adj_reps1+3), false);
    steps := jsonb_set(steps,'{1,reps}', to_jsonb(adj_reps2+2), false);
    steps := jsonb_set(steps,'{2,reps}', to_jsonb(adj_reps3+1), false);
  ELSIF wex.warmup_feedback = 'too_much' THEN
    steps := jsonb_set(steps,'{0,reps}', to_jsonb(adj_reps1-2), false);
    steps := jsonb_set(steps,'{1,reps}', to_jsonb(adj_reps2-2), false);
  END IF;

  base := jsonb_build_object(
    'strategy','ramped',
    'top_weight', top_weight,
    'steps', steps,
    'last_recalc_at', to_jsonb(now()),
    'source','last_set'
  );

  UPDATE public.workout_exercises
  SET warmup_plan = base
  WHERE id = p_workout_exercise_id;
END$$;

-- Trigger to recalc warmup after set completion
CREATE OR REPLACE FUNCTION public.trg_after_set_logged()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_completed = true THEN
    PERFORM public.recalc_warmup_from_last_set(NEW.workout_exercise_id);
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_wset_after_insupd ON public.workout_sets;
CREATE TRIGGER trg_wset_after_insupd
AFTER INSERT OR UPDATE OF is_completed, weight, reps
ON public.workout_sets
FOR EACH ROW
EXECUTE FUNCTION public.trg_after_set_logged();