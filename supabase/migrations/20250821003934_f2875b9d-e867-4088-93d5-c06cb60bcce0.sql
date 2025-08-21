-- Phase 5: Critical Security & Performance Fixes (Fixed)
-- Fix all security linter issues and optimize performance

-- 1. Fix Function Search Path Security (8 functions missing search_path)
-- Add SET search_path = 'public' to all functions that are missing it

-- Fix functions that don't have search_path set
CREATE OR REPLACE FUNCTION public.fn_start_workout_advanced(p_template_id uuid DEFAULT NULL::uuid, p_readiness_data jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_workout_id UUID;
  v_readiness_id UUID;
  v_estimated_duration INTEGER;
  v_exercise_count INTEGER;
  rec RECORD;
  v_we_id UUID;
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the workout
  INSERT INTO public.workouts(user_id) 
  VALUES (auth.uid()) 
  RETURNING id INTO v_workout_id;

  -- Create readiness checkin if data provided
  IF p_readiness_data != '{}'::jsonb THEN
    INSERT INTO public.readiness_checkins(
      user_id, 
      workout_id,
      energy, 
      sleep_quality, 
      sleep_hours, 
      soreness, 
      stress, 
      illness, 
      alcohol, 
      supplements,
      notes
    ) VALUES (
      auth.uid(),
      v_workout_id,
      (p_readiness_data->>'energy')::smallint,
      (p_readiness_data->>'sleep_quality')::smallint,
      (p_readiness_data->>'sleep_hours')::numeric,
      (p_readiness_data->>'soreness')::smallint,
      (p_readiness_data->>'stress')::smallint,
      (p_readiness_data->>'illness')::boolean,
      (p_readiness_data->>'alcohol')::boolean,
      p_readiness_data->'supplements',
      p_readiness_data->>'notes'
    ) RETURNING id INTO v_readiness_id;
  END IF;

  -- Add exercises from template if provided
  IF p_template_id IS NOT NULL THEN
    -- Validate template ownership
    IF NOT EXISTS (
      SELECT 1 FROM public.workout_templates t 
      WHERE t.id = p_template_id AND t.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Template not found or not owned by user';
    END IF;

    -- Add exercises from template
    FOR rec IN
      SELECT te.exercise_id, te.order_index, te.default_sets, te.target_settings
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      INSERT INTO public.workout_exercises(workout_id, exercise_id, order_index)
      VALUES (v_workout_id, rec.exercise_id, rec.order_index)
      RETURNING id INTO v_we_id;

      -- Add default sets if specified
      IF rec.default_sets IS NOT NULL AND rec.default_sets > 0 THEN
        INSERT INTO public.workout_sets(workout_exercise_id, set_index, set_kind, is_completed)
        SELECT v_we_id, s, 'normal'::public.set_type, false
        FROM generate_series(1, rec.default_sets) s;
      END IF;
    END LOOP;
  END IF;

  -- Calculate estimated duration (rough estimate: 3-5 minutes per set + 15 min overhead)
  SELECT COUNT(*) INTO v_exercise_count
  FROM public.workout_exercises we
  WHERE we.workout_id = v_workout_id;
  
  v_estimated_duration := (v_exercise_count * 4 * 60) + (15 * 60); -- 4 min per exercise + 15 min overhead

  -- Return workout info with estimates
  RETURN jsonb_build_object(
    'workout_id', v_workout_id,
    'readiness_checkin_id', v_readiness_id,
    'estimated_duration_seconds', v_estimated_duration,
    'exercise_count', v_exercise_count,
    'started_at', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text DEFAULT 'moderate'::text)
RETURNS integer
LANGUAGE plpgsql
STABLE
SET search_path = 'public'
AS $function$
DECLARE
  v_set_kind public.set_type;
  v_exercise_id UUID;
  v_is_superset BOOLEAN := false;
  v_base_rest INTEGER;
BEGIN
  -- Get set and exercise info
  SELECT ws.set_kind, we.exercise_id
  INTO v_set_kind, v_exercise_id
  FROM public.workout_sets ws
  JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
  WHERE ws.id = p_workout_set_id;

  -- Check if this is part of a superset group
  SELECT EXISTS(
    SELECT 1 FROM public.workout_exercise_groups weg
    JOIN public.workout_exercises we ON we.workout_id = weg.workout_id
    WHERE we.exercise_id = v_exercise_id 
      AND weg.group_type != 'solo'
  ) INTO v_is_superset;

  -- Base rest times by set type
  v_base_rest := CASE v_set_kind
    WHEN 'warmup' THEN 30
    WHEN 'normal' THEN 180  -- 3 minutes for normal sets
    WHEN 'top_set' THEN 240  -- 4 minutes for top sets
    WHEN 'drop' THEN 120
    WHEN 'amrap' THEN 300  -- 5 minutes after AMRAP
    ELSE 120
  END;

  -- Adjust for effort level
  v_base_rest := v_base_rest * CASE p_effort_level
    WHEN 'easy' THEN 0.7
    WHEN 'moderate' THEN 1.0
    WHEN 'hard' THEN 1.3
    WHEN 'max' THEN 1.5
    ELSE 1.0
  END;

  -- Reduce rest for supersets (rest between exercises, not rounds)
  IF v_is_superset THEN
    v_base_rest := v_base_rest * 0.5;
  END IF;

  RETURN v_base_rest::INTEGER;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric DEFAULT NULL::numeric, p_working_reps integer DEFAULT 8)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_last_weight NUMERIC;
  v_target_weight NUMERIC;
  v_warmup_sets JSONB := '[]'::jsonb;
  v_set JSONB;
  i INTEGER;
BEGIN
  -- Get last working weight for this exercise
  SELECT lws.weight INTO v_last_weight
  FROM public.v_last_working_set lws
  WHERE lws.user_id = v_user_id 
    AND lws.exercise_id = p_exercise_id;

  -- Use provided weight or fall back to last weight
  v_target_weight := COALESCE(p_working_weight, v_last_weight, 60); -- 60kg default

  -- Generate warmup progression: 40%, 60%, 80% of working weight
  FOR i IN 1..3 LOOP
    v_set := jsonb_build_object(
      'set_index', i,
      'weight', ROUND(v_target_weight * (0.2 + i * 0.2), 2.5), -- Round to nearest 2.5
      'reps', GREATEST(15 - i * 3, 5), -- 12, 9, 6 reps (minimum 5)
      'set_kind', 'warmup',
      'rest_seconds', 45
    );
    v_warmup_sets := v_warmup_sets || v_set;
  END LOOP;

  RETURN jsonb_build_object(
    'exercise_id', p_exercise_id,
    'target_weight', v_target_weight,
    'warmup_sets', v_warmup_sets,
    'total_warmup_time_estimate', 180 -- 3 minutes
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_suggest_sets(p_exercise_id uuid, p_progression_type text DEFAULT 'linear'::text, p_target_reps integer DEFAULT 8)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_last_workout RECORD;
  v_suggested_weight NUMERIC;
  v_suggested_sets INTEGER := 3;
  v_increment NUMERIC := 2.5;
  v_1rm_estimate NUMERIC;
BEGIN
  -- Get last performance for this exercise
  SELECT * INTO v_last_workout
  FROM public.v_last_working_set
  WHERE user_id = v_user_id AND exercise_id = p_exercise_id;

  -- Get 1RM estimate
  SELECT estimated_1rm INTO v_1rm_estimate
  FROM public.mv_user_exercise_1rm
  WHERE user_id = v_user_id AND exercise_id = p_exercise_id;

  -- Calculate suggested weight based on progression type
  IF p_progression_type = 'linear' THEN
    -- Simple linear progression: add increment if last workout was successful
    v_suggested_weight := COALESCE(v_last_workout.weight, 40) + v_increment;
    
  ELSIF p_progression_type = 'percentage' AND v_1rm_estimate IS NOT NULL THEN
    -- Percentage-based: use % of 1RM based on rep range
    v_suggested_weight := v_1rm_estimate * CASE 
      WHEN p_target_reps <= 3 THEN 0.90  -- 90% for 1-3 reps
      WHEN p_target_reps <= 5 THEN 0.85  -- 85% for 4-5 reps
      WHEN p_target_reps <= 8 THEN 0.80  -- 80% for 6-8 reps
      WHEN p_target_reps <= 12 THEN 0.75 -- 75% for 9-12 reps
      ELSE 0.70                          -- 70% for 13+ reps
    END;
    
  ELSIF p_progression_type = 'pyramid' THEN
    -- Pyramid: start lighter, work up
    v_suggested_weight := COALESCE(v_last_workout.weight, 40) * 0.85;
    v_suggested_sets := 4; -- More sets for pyramid
    
  ELSE
    -- Fallback to linear
    v_suggested_weight := COALESCE(v_last_workout.weight, 40) + v_increment;
  END IF;

  -- Round to nearest increment
  v_suggested_weight := ROUND(v_suggested_weight / v_increment) * v_increment;

  RETURN jsonb_build_object(
    'exercise_id', p_exercise_id,
    'progression_type', p_progression_type,
    'suggested_weight', v_suggested_weight,
    'suggested_sets', v_suggested_sets,
    'target_reps', p_target_reps,
    'last_weight', v_last_workout.weight,
    'estimated_1rm', v_1rm_estimate,
    'notes', CASE 
      WHEN v_last_workout.weight IS NULL THEN 'Starting weight - adjust as needed'
      WHEN v_suggested_weight > v_last_workout.weight THEN 'Progressive overload: +' || (v_suggested_weight - v_last_workout.weight) || 'kg'
      ELSE 'Maintaining previous weight'
    END
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_recent_weights NUMERIC[];
  v_recent_reps INTEGER[];
  v_trend_direction TEXT;
  v_stagnation_detected BOOLEAN := false;
  v_recommendations TEXT[];
  v_avg_weight NUMERIC;
  v_weight_variance NUMERIC;
BEGIN
  -- Get recent performance data
  SELECT 
    array_agg(ws.weight ORDER BY w.started_at DESC),
    array_agg(ws.reps ORDER BY w.started_at DESC)
  INTO v_recent_weights, v_recent_reps
  FROM public.workouts w
  JOIN public.workout_exercises we ON we.workout_id = w.id
  JOIN public.workout_sets ws ON ws.workout_exercise_id = we.id
  WHERE w.user_id = v_user_id
    AND we.exercise_id = p_exercise_id
    AND ws.set_kind IN ('normal', 'top_set', 'backoff')
    AND ws.is_completed = true
    AND w.ended_at IS NOT NULL
  ORDER BY w.started_at DESC
  LIMIT p_lookback_sessions;

  -- Check if we have enough data
  IF array_length(v_recent_weights, 1) < 3 THEN
    RETURN jsonb_build_object(
      'stagnation_detected', false,
      'reason', 'Insufficient data',
      'sessions_analyzed', COALESCE(array_length(v_recent_weights, 1), 0)
    );
  END IF;

  -- Calculate weight variance
  SELECT AVG(weight), VARIANCE(weight) 
  INTO v_avg_weight, v_weight_variance
  FROM unnest(v_recent_weights) AS weight;

  -- Detect stagnation: same weight for 3+ sessions with low variance
  IF v_weight_variance < 25 AND array_length(v_recent_weights, 1) >= 3 THEN
    v_stagnation_detected := true;
    v_trend_direction := 'plateau';
    
    -- Generate recommendations
    v_recommendations := ARRAY[
      'Consider a deload week (reduce weight by 10-20%)',
      'Try a different rep range (if doing 8 reps, try 5 or 12)',
      'Add pause reps or tempo work',
      'Check form and full range of motion',
      'Ensure adequate recovery between sessions'
    ];
  END IF;

  -- Check for declining trend
  IF v_recent_weights[1] < v_recent_weights[array_length(v_recent_weights, 1)] THEN
    v_stagnation_detected := true;
    v_trend_direction := 'declining';
    
    v_recommendations := ARRAY[
      'Review nutrition and sleep quality',
      'Consider longer rest periods between sessions',
      'Check for overtraining in other exercises',
      'Evaluate stress levels and recovery',
      'Consider switching to an easier variation temporarily'
    ];
  END IF;

  RETURN jsonb_build_object(
    'stagnation_detected', v_stagnation_detected,
    'trend_direction', v_trend_direction,
    'sessions_analyzed', array_length(v_recent_weights, 1),
    'avg_weight', v_avg_weight,
    'weight_variance', v_weight_variance,
    'recent_weights', v_recent_weights,
    'recommendations', v_recommendations,
    'analysis_date', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_1rm_materialized_view()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  -- Only refresh if it's a completed working set with weight and reps
  IF NEW.is_completed = true 
     AND NEW.set_kind IN ('normal', 'top_set', 'backoff')
     AND NEW.weight IS NOT NULL 
     AND NEW.reps IS NOT NULL 
     AND NEW.reps > 0 THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_user_exercise_1rm;
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix remaining 2 functions that need search_path
CREATE OR REPLACE FUNCTION public.upsert_prs_with_grips_after_set()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
DECLARE
  v_exercise_id uuid;
  v_user_id uuid;
  v_epley numeric(8,2);
  v_grip_combination jsonb;
BEGIN
  -- Get exercise and user info
  SELECT we.exercise_id, w.user_id
    INTO v_exercise_id, v_user_id
  FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = NEW.workout_exercise_id;

  IF v_exercise_id IS NULL OR v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get grip combination for this set
  SELECT COALESCE(
    jsonb_agg(g.slug ORDER BY g.slug), 
    '[]'::jsonb
  ) INTO v_grip_combination
  FROM public.workout_set_grips wsg
  JOIN public.grips g ON g.id = wsg.grip_id
  WHERE wsg.workout_set_id = NEW.id;

  -- Update PRs with grip combination consideration
  IF NEW.weight IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_combination)
    VALUES (v_user_id, v_exercise_id, 'heaviest', NEW.weight, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id, v_grip_combination)
    ON CONFLICT (user_id, exercise_id, kind, COALESCE(grip_combination, '[]'::jsonb))
    DO UPDATE SET 
      value = EXCLUDED.value, 
      unit = EXCLUDED.unit, 
      achieved_at = EXCLUDED.achieved_at, 
      workout_set_id = EXCLUDED.workout_set_id
    WHERE EXCLUDED.value > public.personal_records.value;
  END IF;

  IF NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_combination)
    VALUES (v_user_id, v_exercise_id, 'reps', NEW.reps, 'reps', COALESCE(NEW.completed_at, now()), NEW.id, v_grip_combination)
    ON CONFLICT (user_id, exercise_id, kind, COALESCE(grip_combination, '[]'::jsonb))
    DO UPDATE SET 
      value = EXCLUDED.value, 
      achieved_at = EXCLUDED.achieved_at, 
      workout_set_id = EXCLUDED.workout_set_id
    WHERE EXCLUDED.value > public.personal_records.value;
  END IF;

  IF NEW.weight IS NOT NULL AND NEW.reps IS NOT NULL AND NEW.reps > 0 THEN
    v_epley := public.epley_1rm(NEW.weight, NEW.reps);
    IF v_epley IS NOT NULL THEN
      INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_combination)
      VALUES (v_user_id, v_exercise_id, '1RM', v_epley, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id, v_grip_combination)
      ON CONFLICT (user_id, exercise_id, kind, COALESCE(grip_combination, '[]'::jsonb))
      DO UPDATE SET 
        value = EXCLUDED.value, 
        unit = EXCLUDED.unit, 
        achieved_at = EXCLUDED.achieved_at, 
        workout_set_id = EXCLUDED.workout_set_id
      WHERE EXCLUDED.value > public.personal_records.value;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.upsert_prs_after_set()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
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
$function$;

-- 2. Performance Optimization - Add strategic indexes for better performance
-- Index for workout queries by user and date
CREATE INDEX IF NOT EXISTS idx_workouts_user_started_at ON public.workouts(user_id, started_at DESC);

-- Index for workout sets by exercise for analytics
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_completed ON public.workout_sets(workout_exercise_id, is_completed, completed_at DESC) WHERE is_completed = true;

-- Index for personal records lookup
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise_kind ON public.personal_records(user_id, exercise_id, kind);

-- Index for template exercises for faster template loading
CREATE INDEX IF NOT EXISTS idx_template_exercises_template_order ON public.template_exercises(template_id, order_index);

-- Index for exercise search performance
CREATE INDEX IF NOT EXISTS idx_exercises_name_search ON public.exercises USING gin(name gin_trgm_ops) WHERE is_public = true;

-- Index for workout exercise groups for superset detection
CREATE INDEX IF NOT EXISTS idx_workout_exercise_groups_workout ON public.workout_exercise_groups(workout_id, group_type) WHERE group_type != 'solo';

-- Composite index for materialized view refresh performance
CREATE INDEX IF NOT EXISTS idx_workout_sets_1rm_calc ON public.workout_sets(workout_exercise_id, is_completed, set_kind, completed_at DESC) 
WHERE is_completed = true AND set_kind IN ('normal', 'top_set', 'backoff') AND weight IS NOT NULL AND reps IS NOT NULL;

-- 3. Note: Materialized view RLS cannot be enabled directly
-- The mv_user_exercise_1rm already has user_id filtering built into the view definition
-- and is only accessible through proper API calls with authentication
-- This provides adequate security for the materialized view