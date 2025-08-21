-- Remove SECURITY DEFINER from remaining functions that don't need elevated privileges
-- These functions already have RLS in place and don't need SECURITY DEFINER

-- Functions that use auth.uid() already work correctly with SECURITY INVOKER
-- because the auth context is preserved

-- Remove SECURITY DEFINER from exercise_search - RLS already handles access control
CREATE OR REPLACE FUNCTION public.exercise_search(p_query text DEFAULT ''::text, p_equipment_id uuid DEFAULT NULL::uuid, p_body_part_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, name text, slug text, equipment_id uuid, body_part_id uuid, is_public boolean, similarity_score real)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.slug,
    e.equipment_id,
    e.body_part_id,
    e.is_public,
    CASE 
      WHEN p_query = '' THEN 1.0
      ELSE public.similarity(e.name, p_query)
    END as similarity_score
  FROM public.exercises e
  WHERE 
    (e.is_public = true OR e.owner_user_id = auth.uid())
    AND (p_equipment_id IS NULL OR e.equipment_id = p_equipment_id)
    AND (p_body_part_id IS NULL OR e.body_part_id = p_body_part_id)
    AND (
      p_query = '' OR 
      e.name % p_query OR
      e.name ILIKE ('%' || p_query || '%')
    )
  ORDER BY 
    (CASE WHEN p_query = '' THEN COALESCE(e.popularity_rank, 999999) ELSE 0 END),
    (CASE WHEN p_query != '' THEN public.similarity(e.name, p_query) ELSE 0 END) DESC
  LIMIT p_limit 
  OFFSET p_offset;
END;
$function$;

-- Remove SECURITY DEFINER from fn_detect_stagnation - works with user's own data
CREATE OR REPLACE FUNCTION public.fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer DEFAULT 5)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
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