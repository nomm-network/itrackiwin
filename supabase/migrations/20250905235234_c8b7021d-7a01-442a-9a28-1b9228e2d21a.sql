-- Drop existing function to allow parameter changes
DROP FUNCTION IF EXISTS public.start_workout(uuid);

-- Harden readiness calculation with null-safe defaults and both sleep fields
CREATE OR REPLACE FUNCTION public.compute_readiness_for_user(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rec RECORD;
  v_energy numeric;
  v_sleep_quality numeric;
  v_sleep_hours numeric;
  v_sleep_hours_score numeric;
  v_score numeric;
BEGIN
  -- Get latest readiness data
  SELECT * INTO rec
  FROM public.readiness_logs
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF rec IS NULL THEN
    RETURN 65; -- Default when no data
  END IF;

  -- Null-safe field extraction with defaults
  v_energy := COALESCE(rec.energy, 50);
  v_sleep_quality := COALESCE(rec.sleep_quality, 50);
  v_sleep_hours := COALESCE(rec.sleep_hours, 7);

  -- Map sleep hours to 0-100 scale
  v_sleep_hours_score := CASE
    WHEN v_sleep_hours <= 5 THEN 40
    WHEN v_sleep_hours = 6 THEN 60
    WHEN v_sleep_hours = 7 THEN 80
    ELSE 100
  END;

  -- Calculate weighted score
  v_score := 0
    + v_energy * 0.20
    + v_sleep_quality * 0.20
    + v_sleep_hours_score * 0.20
    + (100 - COALESCE(rec.soreness, 50)) * 0.20  -- Inverted
    + (100 - COALESCE(rec.stress, 50)) * 0.10    -- Inverted
    + CASE WHEN COALESCE(rec.supplements_taken, false) THEN 10 ELSE 0 END
    - CASE WHEN COALESCE(rec.illness, false) THEN 20 ELSE 0 END
    - CASE WHEN COALESCE(rec.alcohol, false) THEN 10 ELSE 0 END;

  -- Clamp to 0-100 range
  v_score := GREATEST(0, LEAST(100, v_score));
  
  RETURN v_score;
END;
$function$;

-- Recreate start_workout with both UUID pointer and JSON metadata
CREATE FUNCTION public.start_workout(p_template_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_workout_id uuid;
  v_we_id uuid;
  v_te RECORD;
  v_base_weight numeric;
  v_base_source text;
  v_base_we_id uuid; -- UUID pointer to source workout_exercise
  v_score numeric;
  v_mult numeric;
  v_target_kg numeric;
  v_warmup_steps jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create workout
  INSERT INTO public.workouts (user_id, template_id, started_at)
  VALUES (auth.uid(), p_template_id, now())
  RETURNING id INTO v_workout_id;

  -- Get readiness score
  v_score := public.compute_readiness_for_user(auth.uid());

  -- Calculate readiness multiplier
  v_mult := public.readiness_multiplier(v_score);

  -- Copy exercises from template
  FOR v_te IN
    SELECT te.*
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index
  LOOP
    INSERT INTO public.workout_exercises (
      workout_id, exercise_id, order_index, planned_sets, target_reps, weight_unit
    ) VALUES (
      v_workout_id, v_te.exercise_id, v_te.order_index, 
      v_te.default_sets, v_te.target_reps, v_te.weight_unit
    ) RETURNING id INTO v_we_id;

    -- Determine base weight and source
    v_base_weight := NULL;
    v_base_source := 'estimate';
    v_base_we_id := NULL;

    -- Try to get base load from recent high-readiness workout
    SELECT we.id, we.target_weight_kg INTO v_base_we_id, v_base_weight
    FROM public.pick_base_load(v_te.exercise_id, auth.uid()) pbl
    JOIN public.workout_exercises we ON we.id = pbl.workout_exercise_id
    WHERE pbl.target_weight_kg IS NOT NULL;

    IF v_base_weight IS NOT NULL THEN
      v_base_source := 'recent_high_readiness';
    ELSE
      -- Fall back to template target
      IF v_te.target_weight_kg IS NOT NULL THEN
        v_base_weight := v_te.target_weight_kg;
        v_base_source := 'template';
        v_base_we_id := NULL; -- No specific workout_exercise source
      ELSE
        -- Last resort: user's historical estimates
        SELECT target_weight_kg INTO v_base_weight
        FROM public.workout_exercises we2
        JOIN public.workouts w2 ON w2.id = we2.workout_id
        WHERE w2.user_id = auth.uid()
          AND we2.exercise_id = v_te.exercise_id
          AND we2.target_weight_kg IS NOT NULL
        ORDER BY w2.started_at DESC
        LIMIT 1;
        
        IF v_base_weight IS NULL THEN
          v_base_weight := 40; -- Default starting weight
        END IF;
      END IF;
    END IF;

    -- Apply readiness adjustment
    v_target_kg := v_base_weight * v_mult;

    -- Generate warmup steps
    v_warmup_steps := public.generate_warmup_steps(v_target_kg);

    -- Update with target and metadata
    UPDATE public.workout_exercises
    SET
      target_weight_kg = v_target_kg,
      readiness_adjusted_from = v_base_we_id, -- UUID pointer (nullable)
      attribute_values_json = jsonb_set(
        COALESCE(attribute_values_json, '{}'::jsonb),
        '{smart_load}',
        jsonb_build_object(
          'base_weight_kg', v_base_weight,
          'multiplier', v_mult,
          'readiness_score', v_score,
          'source', v_base_source
        ),
        true
      ) || jsonb_build_object('warmup', v_warmup_steps)
    WHERE id = v_we_id;
  END LOOP;

  -- Store readiness score in workout
  UPDATE public.workouts
  SET readiness_score = v_score
  WHERE id = v_workout_id;

  RETURN v_workout_id;
END;
$function$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_active
  ON public.workouts(user_id) WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_we_workout_order
  ON public.workout_exercises(workout_id, order_index);

CREATE INDEX IF NOT EXISTS idx_readiness_logs_user_recent
  ON public.readiness_logs(user_id, created_at DESC);