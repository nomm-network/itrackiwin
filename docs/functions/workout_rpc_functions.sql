# Workout-Related RPC Functions

## 1. get_workout_detail_optimized

**Purpose**: Optimized single-call function to get complete workout details with exercises and sets

**Function Signature**:
```sql
get_workout_detail_optimized(p_workout_id uuid, p_user_id uuid) RETURNS jsonb
```

**Security**: `SECURITY DEFINER` with `search_path` set to `public`

**Complete Function Code**:
```sql
CREATE OR REPLACE FUNCTION public.get_workout_detail_optimized(p_workout_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Get exercises with sets - INCLUDING effort_mode and load_mode
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
      'exercise', jsonb_build_object(
        'id', e.id,
        'effort_mode', e.effort_mode,
        'load_mode', e.load_mode,
        'slug', e.slug,
        'display_name', e.display_name,
        'equipment_id', e.equipment_id,
        'primary_muscle_id', e.primary_muscle_id,
        'is_unilateral', e.is_unilateral,
        'allows_grips', e.allows_grips,
        'load_type', e.load_type
      ),
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
          'weight', COALESCE(weight_kg, weight),
          'weight_unit', weight_unit,
          'reps', reps,
          'duration_seconds', duration_seconds,
          'distance', distance,
          'rpe', rpe,
          'notes', notes,
          'is_completed', is_completed,
          'completed_at', completed_at
        )
        ORDER BY set_index
      ) as sets_data
    FROM workout_sets
    GROUP BY workout_exercise_id
  ) sets ON sets.workout_exercise_id = we.id
  WHERE we.workout_id = p_workout_id;
  
  -- Build final result
  result := jsonb_build_object(
    'workout', workout_data,
    'exercises', COALESCE(exercises_data, '[]'::jsonb)
  );
  
  RETURN result;
END;
$function$;
```

**Usage Example**:
```sql
SELECT get_workout_detail_optimized('789b9dc8-e057-49fc-8002-12057af9ca3e', 'f3024241-c467-4d6a-8315-44928316cfa9');
```

**Response Structure**:
```json
{
  "workout": {
    "id": "uuid",
    "user_id": "uuid", 
    "started_at": "timestamp",
    "ended_at": "timestamp",
    "title": "string",
    "notes": "string",
    "perceived_exertion": "number"
  },
  "exercises": [
    {
      "id": "uuid",
      "exercise_id": "uuid",
      "order_index": "number",
      "notes": "string",
      "exercise_name": "string",
      "exercise_slug": "string",
      "exercise": {
        "id": "uuid",
        "effort_mode": "reps|time|distance|calories",
        "load_mode": "bodyweight_plus_optional|external_added|external_assist|machine_level|free_weight|none|band_level",
        "slug": "string",
        "display_name": "string",
        "equipment_id": "uuid",
        "primary_muscle_id": "uuid",
        "is_unilateral": "boolean",
        "allows_grips": "boolean",
        "load_type": "single_load|dual_load|stack|none"
      },
      "sets": [
        {
          "id": "uuid",
          "set_index": "number",
          "set_kind": "working|warmup|failure",
          "weight": "number",
          "weight_unit": "kg|lbs",
          "reps": "number",
          "duration_seconds": "number",
          "distance": "number",
          "rpe": "number",
          "notes": "string",
          "is_completed": "boolean",
          "completed_at": "timestamp"
        }
      ]
    }
  ]
}
```

## 2. next_weight_step_kg

**Purpose**: Calculate next weight increment based on load type and equipment configuration

**Function Signature**:
```sql
next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric) RETURNS numeric
```

**Complete Function Code**:
```sql
CREATE OR REPLACE FUNCTION public.next_weight_step_kg(
  p_load_type load_type, 
  p_side_min_plate_kg numeric, 
  p_single_min_increment_kg numeric
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT CASE
    WHEN p_load_type = 'dual_load' THEN 2 * COALESCE(p_side_min_plate_kg, 1.25)
    WHEN p_load_type IN ('single_load','stack') THEN COALESCE(p_single_min_increment_kg, 2.5)
    ELSE 0
  END;
$function$;
```

**Usage Examples**:
```sql
-- For barbell (dual_load) with 1.25kg plates
SELECT next_weight_step_kg('dual_load', 1.25, NULL); -- Returns: 2.5

-- For dumbbell (single_load) with 2.5kg increments  
SELECT next_weight_step_kg('single_load', NULL, 2.5); -- Returns: 2.5

-- For machine stack
SELECT next_weight_step_kg('stack', NULL, 5.0); -- Returns: 5.0
```

## 3. refresh_materialized_views_secure

**Purpose**: Securely refresh workout-related materialized views

**Function Signature**:
```sql
refresh_materialized_views_secure() RETURNS void
```

**Complete Function Code**:
```sql
CREATE OR REPLACE FUNCTION public.refresh_materialized_views_secure()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow authenticated users to refresh views
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to refresh materialized views';
  END IF;
  
  -- Refresh the materialized views
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_last_set_per_user_exercise;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_pr_weight_per_user_exercise;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_user_exercise_1rm;
END;
$function$;
```

## 4. advance_program_progress

**Purpose**: Track user progress through workout programs

**Function Signature**:
```sql
advance_program_progress(p_program_id uuid, p_user_id uuid, p_position integer, p_workout_id uuid) RETURNS void
```

**Complete Function Code**:
```sql
CREATE OR REPLACE FUNCTION public.advance_program_progress(
  p_program_id uuid, 
  p_user_id uuid, 
  p_position integer, 
  p_workout_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_program_progress (user_id, program_id, last_position, last_workout_id, updated_at)
  VALUES (p_user_id, p_program_id, p_position, p_workout_id, now())
  ON CONFLICT (user_id, program_id)
  DO UPDATE SET
    last_position = EXCLUDED.last_position,
    last_workout_id = EXCLUDED.last_workout_id,
    updated_at = EXCLUDED.updated_at;
END;
$function$;
```

## 5. refresh_exercise_views

**Purpose**: Refresh materialized views for specific user and exercise

**Function Signature**:
```sql
refresh_exercise_views(p_user_id uuid, p_exercise_id uuid) RETURNS void
```

**Complete Function Code**:
```sql
CREATE OR REPLACE FUNCTION public.refresh_exercise_views(p_user_id uuid, p_exercise_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Refresh last set view for specific user+exercise
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_last_set_per_user_exercise;
  
  -- Refresh PR view for specific user+exercise  
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_pr_weight_per_user_exercise;
END;
$function$;
```