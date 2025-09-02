-- Fix apply_initial_targets to always seed first-set targets from estimates
CREATE OR REPLACE FUNCTION public.apply_initial_targets(p_workout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  rec RECORD;
  v_last_set numeric;
  v_pr numeric;
  v_est numeric;
  v_final_target numeric;
BEGIN
  SELECT w.user_id INTO v_user_id
  FROM public.workouts w
  WHERE w.id = p_workout_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Workout % not found', p_workout_id;
  END IF;

  FOR rec IN
    SELECT we.id, we.exercise_id, we.target_weight_kg
    FROM public.workout_exercises we
    WHERE we.workout_id = p_workout_id
    ORDER BY COALESCE(we.order_index, 9999)
  LOOP
    -- Keep template value if present; otherwise calculate from history/estimates
    IF rec.target_weight_kg IS NULL OR rec.target_weight_kg = 0 THEN
      
      -- Try last completed set for this user & exercise (kg)
      SELECT ws.weight * CASE WHEN ws.weight_unit = 'lb' THEN 0.45359237 ELSE 1 END
      INTO v_last_set
      FROM public.workout_sets ws
      JOIN public.workout_exercises wex ON wex.id = ws.workout_exercise_id
      JOIN public.workouts w ON w.id = wex.workout_id
      WHERE w.user_id = v_user_id
        AND wex.exercise_id = rec.exercise_id
        AND ws.weight IS NOT NULL AND ws.reps IS NOT NULL
      ORDER BY w.started_at DESC, ws.set_index DESC
      LIMIT 1;

      -- Try personal records (either 1RM→75% or heaviest as-is), stored in kg
      SELECT CASE pr.kind
               WHEN '1RM' THEN pr.value * 0.75
               WHEN 'heaviest' THEN pr.value
               ELSE pr.value
             END
      INTO v_pr
      FROM public.personal_records pr
      WHERE pr.user_id = v_user_id
        AND pr.exercise_id = rec.exercise_id
        AND pr.unit = 'kg'
      ORDER BY pr.achieved_at DESC
      LIMIT 1;

      -- Try user exercise estimates (readiness data)
      SELECT estimated_weight
      INTO v_est
      FROM public.user_exercise_estimates
      WHERE user_id = v_user_id
        AND exercise_id = rec.exercise_id
        AND type = 'rm10'
      ORDER BY created_at DESC
      LIMIT 1;

      -- Calculate final target with guaranteed fallback
      v_final_target := COALESCE(v_last_set, v_pr, v_est, 60.0); -- 60kg default

      UPDATE public.workout_exercises
      SET target_weight_kg = v_final_target
      WHERE id = rec.id;
    END IF;
  END LOOP;
END
$$;