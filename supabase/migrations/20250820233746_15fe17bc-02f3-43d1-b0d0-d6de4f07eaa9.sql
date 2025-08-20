-- Phase 2: Business Logic Functions for Workout Assistant (Fixed)

-- ============================================================================
-- PERFORMANCE VIEWS
-- ============================================================================

-- View to get the last working set for each user/exercise combination
CREATE OR REPLACE VIEW public.v_last_working_set AS
SELECT DISTINCT ON (w.user_id, we.exercise_id)
  w.user_id,
  we.exercise_id,
  ws.id as workout_set_id,
  ws.weight,
  ws.weight_unit,
  ws.reps,
  ws.distance,
  ws.duration_seconds,
  ws.rpe,
  ws.completed_at,
  w.id as workout_id,
  w.started_at as workout_started_at
FROM public.workouts w
JOIN public.workout_exercises we ON we.workout_id = w.id
JOIN public.workout_sets ws ON ws.workout_exercise_id = we.id
WHERE ws.is_completed = true
  AND ws.set_kind IN ('normal', 'top_set', 'backoff')  -- Working set types
  AND w.ended_at IS NOT NULL
ORDER BY w.user_id, we.exercise_id, w.started_at DESC, ws.set_index DESC;

-- Materialized view for 1RM estimates (refreshed automatically via trigger)
CREATE MATERIALIZED VIEW public.mv_user_exercise_1rm AS
SELECT 
  w.user_id,
  we.exercise_id,
  MAX(public.epley_1rm(ws.weight, ws.reps)) as estimated_1rm,
  MAX(ws.weight) as max_weight,
  MAX(ws.reps) as max_reps,
  COUNT(*) as total_working_sets,
  MAX(ws.completed_at) as last_updated
FROM public.workouts w
JOIN public.workout_exercises we ON we.workout_id = w.id
JOIN public.workout_sets ws ON ws.workout_exercise_id = we.id
WHERE ws.is_completed = true
  AND ws.set_kind IN ('normal', 'top_set', 'backoff')  -- Working set types
  AND ws.weight IS NOT NULL
  AND ws.reps IS NOT NULL
  AND ws.reps > 0
  AND w.ended_at IS NOT NULL
GROUP BY w.user_id, we.exercise_id;

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_mv_user_exercise_1rm_unique 
ON public.mv_user_exercise_1rm (user_id, exercise_id);

-- ============================================================================
-- BUSINESS LOGIC FUNCTIONS
-- ============================================================================

-- Function to start an advanced workout with readiness check and duration estimation
CREATE OR REPLACE FUNCTION public.fn_start_workout_advanced(
  p_template_id UUID DEFAULT NULL,
  p_readiness_data JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suggest rest seconds based on context
CREATE OR REPLACE FUNCTION public.fn_suggest_rest_seconds(
  p_workout_set_id UUID,
  p_effort_level TEXT DEFAULT 'moderate'
) RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- Function to suggest warmup sets
CREATE OR REPLACE FUNCTION public.fn_suggest_warmup(
  p_exercise_id UUID,
  p_working_weight NUMERIC DEFAULT NULL,
  p_working_reps INTEGER DEFAULT 8
) RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to suggest working sets with progression
CREATE OR REPLACE FUNCTION public.fn_suggest_sets(
  p_exercise_id UUID,
  p_progression_type TEXT DEFAULT 'linear',
  p_target_reps INTEGER DEFAULT 8
) RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to detect stagnation and suggest interventions
CREATE OR REPLACE FUNCTION public.fn_detect_stagnation(
  p_exercise_id UUID,
  p_lookback_sessions INTEGER DEFAULT 5
) RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS AND AUTOMATION
-- ============================================================================

-- Function to refresh 1RM materialized view when workout sets are updated
CREATE OR REPLACE FUNCTION public.refresh_1rm_materialized_view()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to refresh 1RM view when workout sets are inserted/updated
CREATE OR REPLACE TRIGGER trigger_refresh_1rm_on_set_complete
  AFTER INSERT OR UPDATE OF is_completed, weight, reps
  ON public.workout_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_1rm_materialized_view();

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Indexes for frequently queried patterns
CREATE INDEX IF NOT EXISTS idx_workout_sets_performance_lookup 
ON public.workout_sets (workout_exercise_id, set_kind, is_completed, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_workouts_user_started_ended 
ON public.workouts (user_id, started_at DESC, ended_at) 
WHERE ended_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_lookup 
ON public.workout_exercises (exercise_id, workout_id);

-- Composite index for v_last_working_set view
CREATE INDEX IF NOT EXISTS idx_composite_last_working_set 
ON public.workout_sets (workout_exercise_id, is_completed, set_kind, completed_at DESC) 
WHERE is_completed = true AND set_kind IN ('normal', 'top_set', 'backoff');

-- ============================================================================
-- INITIAL DATA REFRESH
-- ============================================================================

-- Populate the materialized view with existing data
REFRESH MATERIALIZED VIEW public.mv_user_exercise_1rm;