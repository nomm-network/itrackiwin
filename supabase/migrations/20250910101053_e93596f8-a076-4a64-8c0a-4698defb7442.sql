-- Create optimized materialized view for workout details
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_workout_details AS
SELECT 
  w.id as workout_id,
  w.user_id,
  w.started_at,
  w.ended_at,
  w.title,
  w.notes,
  w.perceived_exertion,
  
  -- Exercise data
  we.id as workout_exercise_id,
  we.exercise_id,
  we.order_index,
  we.notes as exercise_notes,
  
  -- Exercise details with translations
  e.slug as exercise_slug,
  e.display_name as exercise_display_name,
  COALESCE(
    e.custom_display_name,
    jsonb_extract_path_text(e.attribute_values_json, 'translations', 'en', 'name'),
    jsonb_extract_path_text(e.attribute_values_json, 'translations', 'ro', 'name'),
    e.display_name,
    e.slug
  ) as exercise_name,
  
  -- Set data aggregated
  jsonb_agg(
    CASE WHEN ws.id IS NOT NULL THEN
      jsonb_build_object(
        'id', ws.id,
        'set_index', ws.set_index,
        'set_kind', ws.set_kind,
        'weight', ws.weight_kg,
        'weight_unit', ws.weight_unit,
        'reps', ws.reps,
        'duration_seconds', ws.duration_seconds,
        'distance', ws.distance,
        'rpe', ws.rpe,
        'effort', ws.effort,
        'completed_at', ws.completed_at,
        'is_completed', ws.is_completed,
        'notes', ws.notes
      )
    ELSE NULL END
    ORDER BY ws.set_index
  ) FILTER (WHERE ws.id IS NOT NULL) as sets_data,
  
  -- Exercise counts for the workout
  COUNT(DISTINCT we.id) OVER (PARTITION BY w.id) as total_exercises,
  COUNT(ws.id) FILTER (WHERE ws.is_completed = true) OVER (PARTITION BY w.id) as total_completed_sets

FROM workouts w
LEFT JOIN workout_exercises we ON we.workout_id = w.id
LEFT JOIN exercises e ON e.id = we.exercise_id
LEFT JOIN workout_sets ws ON ws.workout_exercise_id = we.id
WHERE w.ended_at IS NOT NULL  -- Only completed workouts for performance
GROUP BY w.id, w.user_id, w.started_at, w.ended_at, w.title, w.notes, w.perceived_exertion,
         we.id, we.exercise_id, we.order_index, we.notes,
         e.slug, e.display_name, e.custom_display_name, e.attribute_values_json
ORDER BY w.started_at DESC, we.order_index;

-- Create unique index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_workout_details_unique 
ON mv_workout_details (workout_id, workout_exercise_id);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_mv_workout_details_user_id 
ON mv_workout_details (user_id, workout_id);

-- Create optimized RPC function for single workout fetch
CREATE OR REPLACE FUNCTION get_workout_detail_optimized(p_workout_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  workout_data jsonb;
  exercises_data jsonb;
BEGIN
  -- Get workout basic info
  SELECT jsonb_build_object(
    'id', w.id,
    'user_id', w.user_id,
    'started_at', w.started_at,
    'ended_at', w.ended_at,
    'title', w.title,
    'notes', w.notes,
    'perceived_exertion', w.perceived_exertion
  )
  INTO workout_data
  FROM workouts w
  WHERE w.id = p_workout_id AND w.user_id = p_user_id;
  
  IF workout_data IS NULL THEN
    RAISE EXCEPTION 'Workout not found or access denied';
  END IF;
  
  -- Get exercises with sets in one query using materialized view
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', workout_exercise_id,
      'exercise_id', exercise_id,
      'order_index', order_index,
      'notes', exercise_notes,
      'exercise_name', exercise_name,
      'exercise_slug', exercise_slug,
      'sets', COALESCE(sets_data, '[]'::jsonb)
    )
    ORDER BY order_index
  )
  INTO exercises_data
  FROM mv_workout_details
  WHERE workout_id = p_workout_id;
  
  -- If not in materialized view (for ongoing workouts), fetch directly
  IF exercises_data IS NULL THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', we.id,
        'exercise_id', we.exercise_id,
        'order_index', we.order_index,
        'notes', we.notes,
        'exercise_name', COALESCE(
          e.custom_display_name,
          jsonb_extract_path_text(e.attribute_values_json, 'translations', 'en', 'name'),
          e.display_name,
          e.slug
        ),
        'exercise_slug', e.slug,
        'sets', COALESCE(sets.sets_data, '[]'::jsonb)
      )
      ORDER BY we.order_index
    )
    INTO exercises_data
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    LEFT JOIN (
      SELECT 
        workout_exercise_id,
        jsonb_agg(
          jsonb_build_object(
            'id', id,
            'set_index', set_index,
            'set_kind', set_kind,
            'weight', weight_kg,
            'weight_unit', weight_unit,
            'reps', reps,
            'duration_seconds', duration_seconds,
            'distance', distance,
            'rpe', rpe,
            'effort', effort,
            'completed_at', completed_at,
            'is_completed', is_completed,
            'notes', notes
          )
          ORDER BY set_index
        ) as sets_data
      FROM workout_sets
      WHERE workout_exercise_id IN (
        SELECT id FROM workout_exercises WHERE workout_id = p_workout_id
      )
      GROUP BY workout_exercise_id
    ) sets ON sets.workout_exercise_id = we.id
    WHERE we.workout_id = p_workout_id;
  END IF;
  
  -- Build final result
  result := jsonb_build_object(
    'workout', workout_data,
    'exercises', COALESCE(exercises_data, '[]'::jsonb)
  );
  
  RETURN result;
END;
$$;

-- Refresh the materialized view initially
REFRESH MATERIALIZED VIEW mv_workout_details;

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_workout_details_view()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_workout_details;
$$;

-- Create trigger to refresh view when workouts are completed
CREATE OR REPLACE FUNCTION trigger_refresh_workout_details()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only refresh when a workout is completed (ended_at changes from null to not null)
  IF OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL THEN
    PERFORM refresh_workout_details_view();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS workout_completion_refresh_trigger ON workouts;
CREATE TRIGGER workout_completion_refresh_trigger
  AFTER UPDATE OF ended_at ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_workout_details();