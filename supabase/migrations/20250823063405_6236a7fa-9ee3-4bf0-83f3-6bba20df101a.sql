-- Create comprehensive recalibration RPC function (fixed syntax)
CREATE OR REPLACE FUNCTION public.plan_next_prescription(
  p_user_id uuid,
  p_exercise_id uuid,
  p_lookback_sessions integer DEFAULT 3
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_feels text[];
  v_rpes numeric[];
  v_warmup_feedback public.warmup_quality;
  v_experience_config RECORD;
  v_muscle_priority smallint;
  v_suggested_weight numeric;
  v_suggested_reps integer;
  v_progression_factor numeric := 1.0;
  v_warmup_text text;
  v_notes text[] := ARRAY[]::text[];
  v_last_top_weight numeric;
  v_consistency_score numeric;
  v_result jsonb;
  v_easy_count integer := 0;
  v_hard_count integer := 0;
  v_feel text;
  v_avg_rpe numeric;
BEGIN
  -- Get user's experience level configuration
  SELECT 
    elc.start_intensity_low,
    elc.start_intensity_high,
    elc.weekly_progress_pct,
    elc.warmup_set_count_min,
    elc.warmup_set_count_max
  INTO v_experience_config
  FROM public.user_profile_fitness upf
  JOIN public.experience_level_configs elc ON elc.experience_level = upf.experience_level
  WHERE upf.user_id = p_user_id;

  -- Get muscle priority for this exercise
  SELECT COALESCE(ump.priority_level, 3) INTO v_muscle_priority
  FROM public.exercises e
  LEFT JOIN public.user_muscle_priorities ump 
    ON ump.user_id = p_user_id AND ump.muscle_id = e.primary_muscle_id
  WHERE e.id = p_exercise_id;

  -- Analyze last few sessions for feels and RPE
  WITH recent_sessions AS (
    SELECT 
      ws.settings->>'feel' as feel_token,
      ws.rpe,
      ws.weight,
      ws.reps,
      we.warmup_quality,
      w.started_at,
      ROW_NUMBER() OVER (ORDER BY w.started_at DESC) as session_rank
    FROM public.workout_sets ws
    JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN public.workouts w ON w.id = we.workout_id
    WHERE w.user_id = p_user_id 
      AND we.exercise_id = p_exercise_id
      AND ws.is_completed = true
      AND ws.set_kind IN ('normal', 'top_set')
      AND w.ended_at IS NOT NULL
    ORDER BY w.started_at DESC
    LIMIT p_lookback_sessions * 3
  )
  SELECT 
    array_agg(rs.feel_token ORDER BY rs.session_rank) FILTER (WHERE rs.feel_token IS NOT NULL),
    array_agg(rs.rpe ORDER BY rs.session_rank) FILTER (WHERE rs.rpe IS NOT NULL),
    MAX(rs.weight) FILTER (WHERE rs.session_rank = 1),
    (SELECT rs2.warmup_quality FROM recent_sessions rs2 WHERE rs2.session_rank = 1 LIMIT 1)
  INTO v_feels, v_rpes, v_last_top_weight, v_warmup_feedback
  FROM recent_sessions rs;

  -- Calculate consistency score and average RPE
  IF array_length(v_rpes, 1) >= 2 THEN
    SELECT AVG(rpe_val), AVG(rpe_val) - STDDEV(rpe_val)
    INTO v_avg_rpe, v_consistency_score
    FROM unnest(v_rpes) AS rpe_val;
  ELSE
    v_consistency_score := 7.0;
    v_avg_rpe := 7.0;
  END IF;

  -- Count easy vs hard feels in recent sessions
  IF array_length(v_feels, 1) >= 2 THEN
    FOR i IN 1..LEAST(3, array_length(v_feels, 1)) LOOP
      v_feel := v_feels[i];
      CASE v_feel
        WHEN '++', '+' THEN v_easy_count := v_easy_count + 1;
        WHEN '--', '-' THEN v_hard_count := v_hard_count + 1;
        ELSE NULL;
      END CASE;
    END LOOP;

    -- Progression logic
    IF v_easy_count >= 2 AND v_hard_count = 0 THEN
      v_progression_factor := 1.025 + (v_muscle_priority * 0.005); -- 2.5-5% increase
      v_notes := array_append(v_notes, 'Progressing load due to easy recent sessions');
    ELSIF v_hard_count >= 2 OR v_avg_rpe > 8.5 THEN
      v_progression_factor := 0.95 - (v_hard_count * 0.025); -- 5-10% deload
      v_notes := array_append(v_notes, 'Reducing load due to high effort/RPE');
    ELSIF v_consistency_score < 6.0 THEN
      v_progression_factor := 1.0; -- Hold weight for consistency
      v_notes := array_append(v_notes, 'Maintaining load to build consistency');
    ELSE
      v_progression_factor := 1.01; -- Small progressive increase
      v_notes := array_append(v_notes, 'Standard progression');
    END IF;
  END IF;

  -- Calculate suggested weight
  IF v_last_top_weight IS NOT NULL THEN
    v_suggested_weight := ROUND((v_last_top_weight * v_progression_factor) / 2.5) * 2.5;
  ELSE
    v_suggested_weight := 40 + (v_muscle_priority * 10);
    v_notes := array_append(v_notes, 'No history - using conservative starting weight');
  END IF;

  -- Determine rep range based on muscle priority
  v_suggested_reps := CASE 
    WHEN v_muscle_priority >= 4 THEN 8
    WHEN v_muscle_priority <= 2 THEN 12
    ELSE 10
  END;

  -- Generate warmup prescription based on feedback
  CASE v_warmup_feedback
    WHEN 'not_enough' THEN
      v_warmup_text := format('W1: %skg x 12, W2: %skg x 8, W3: %skg x 5, W4: %skg x 3', 
        ROUND(v_suggested_weight * 0.4 / 2.5) * 2.5,
        ROUND(v_suggested_weight * 0.55 / 2.5) * 2.5,
        ROUND(v_suggested_weight * 0.7 / 2.5) * 2.5,
        ROUND(v_suggested_weight * 0.85 / 2.5) * 2.5
      );
      v_notes := array_append(v_notes, 'Added extra warmup step due to previous feedback');
    WHEN 'too_much' THEN
      v_warmup_text := format('W1: %skg x 8, W2: %skg x 5', 
        ROUND(v_suggested_weight * 0.6 / 2.5) * 2.5,
        ROUND(v_suggested_weight * 0.8 / 2.5) * 2.5
      );
      v_notes := array_append(v_notes, 'Reduced warmup due to previous feedback');
    ELSE
      v_warmup_text := format('W1: %skg x 10, W2: %skg x 6, W3: %skg x 3', 
        ROUND(v_suggested_weight * 0.5 / 2.5) * 2.5,
        ROUND(v_suggested_weight * 0.7 / 2.5) * 2.5,
        ROUND(v_suggested_weight * 0.85 / 2.5) * 2.5
      );
  END CASE;

  -- Build result JSON
  v_result := jsonb_build_object(
    'exercise_id', p_exercise_id,
    'warmup_text', v_warmup_text,
    'top_set', jsonb_build_object(
      'weight', v_suggested_weight,
      'reps', v_suggested_reps,
      'weight_unit', 'kg',
      'set_kind', 'top_set'
    ),
    'backoff', jsonb_build_object(
      'weight', ROUND((v_suggested_weight * 0.85) / 2.5) * 2.5,
      'reps', v_suggested_reps + 2,
      'sets', 2,
      'weight_unit', 'kg',
      'set_kind', 'backoff'
    ),
    'progression_factor', v_progression_factor,
    'muscle_priority', v_muscle_priority,
    'consistency_score', v_consistency_score,
    'analysis', jsonb_build_object(
      'recent_feels', v_feels,
      'recent_rpes', v_rpes,
      'last_top_weight', v_last_top_weight,
      'warmup_feedback', v_warmup_feedback,
      'avg_rpe', v_avg_rpe
    ),
    'notes', v_notes,
    'generated_at', now()
  );

  RETURN v_result;
END;
$$;

-- Create function to get recalibration recommendations for multiple exercises
CREATE OR REPLACE FUNCTION public.get_workout_recalibration(
  p_user_id uuid,
  p_exercise_ids uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_exercise_id uuid;
  v_prescription jsonb;
  v_recommendations jsonb := '[]'::jsonb;
BEGIN
  FOREACH v_exercise_id IN ARRAY p_exercise_ids LOOP
    SELECT public.plan_next_prescription(p_user_id, v_exercise_id) INTO v_prescription;
    v_recommendations := v_recommendations || jsonb_build_array(v_prescription);
  END LOOP;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'recommendations', v_recommendations,
    'generated_at', now()
  );
END;
$$;