-- Fix the personal records constraint issue completely
-- The problem is that we have conflicting data and the constraint wasn't properly applied

-- Clean up any duplicate records by keeping only the most recent one
DELETE FROM personal_records 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, exercise_id, kind, COALESCE(grip_key, '')) id
  FROM personal_records 
  ORDER BY user_id, exercise_id, kind, COALESCE(grip_key, ''), created_at DESC
);

-- Now ensure the constraint exists and is properly named
ALTER TABLE public.personal_records DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_unique;
ALTER TABLE public.personal_records DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_grip_unique;

-- Add the correct constraint that handles NULL grip_key properly
ALTER TABLE public.personal_records ADD CONSTRAINT personal_records_user_ex_kind_grip_unique 
UNIQUE (user_id, exercise_id, kind, COALESCE(grip_key, ''));

-- Update the set_log function to handle the new constraint properly with UPSERT
CREATE OR REPLACE FUNCTION public.set_log(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    set_id uuid;
    set_record RECORD;
    grip_key_val text;
    estimated_1rm numeric;
BEGIN
    -- Get current user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Insert or update the workout set
    INSERT INTO workout_sets (
        workout_exercise_id,
        set_index,
        weight,
        reps,
        weight_unit,
        duration_seconds,
        distance,
        rpe,
        notes,
        set_kind,
        is_completed,
        load_meta,
        completed_at
    )
    VALUES (
        (p_payload->>'workout_exercise_id')::uuid,
        COALESCE((p_payload->>'set_index')::integer, 
                 (SELECT COALESCE(MAX(set_index), 0) + 1 
                  FROM workout_sets 
                  WHERE workout_exercise_id = (p_payload->>'workout_exercise_id')::uuid)),
        (p_payload->>'weight')::numeric,
        (p_payload->>'reps')::integer,
        COALESCE(p_payload->>'weight_unit', 'kg'),
        (p_payload->>'duration_seconds')::integer,
        (p_payload->>'distance')::numeric,
        (p_payload->>'rpe')::numeric,
        p_payload->>'notes',
        COALESCE((p_payload->>'set_kind')::set_type, 'normal'),
        COALESCE((p_payload->>'is_completed')::boolean, true),
        COALESCE(p_payload->'load_meta', '{}'::jsonb),
        COALESCE((p_payload->>'completed_at')::timestamptz, NOW())
    )
    RETURNING id INTO set_id;

    -- Handle grips if provided
    IF p_payload ? 'grip_ids' AND jsonb_array_length(p_payload->'grip_ids') > 0 THEN
        INSERT INTO workout_set_grips (workout_set_id, grip_id)
        SELECT set_id, (value->>0)::uuid
        FROM jsonb_array_elements(p_payload->'grip_ids');
    END IF;

    -- Get set details for personal records
    SELECT ws.*, we.exercise_id, w.user_id
    INTO set_record
    FROM workout_sets ws
    JOIN workout_exercises we ON ws.workout_exercise_id = we.id
    JOIN workouts w ON we.workout_id = w.id
    WHERE ws.id = set_id;

    -- Get grip key for personal records
    SELECT string_agg(g.slug, ',' ORDER BY g.slug)
    INTO grip_key_val
    FROM workout_set_grips wsg
    JOIN grips g ON wsg.grip_id = g.id
    WHERE wsg.workout_set_id = set_id;

    -- Update personal records with UPSERT to avoid conflicts
    IF set_record.weight IS NOT NULL AND set_record.reps IS NOT NULL THEN
        estimated_1rm := set_record.weight * (1 + set_record.reps / 30.0);
        
        INSERT INTO personal_records (
            user_id, exercise_id, kind, grip_key, weight, reps, achieved_at, workout_set_id
        )
        VALUES (
            set_record.user_id, set_record.exercise_id, '1rm', 
            COALESCE(grip_key_val, ''), estimated_1rm, 1, set_record.completed_at, set_id
        )
        ON CONFLICT (user_id, exercise_id, kind, COALESCE(grip_key, ''))
        DO UPDATE SET
            weight = GREATEST(personal_records.weight, EXCLUDED.weight),
            reps = EXCLUDED.reps,
            achieved_at = EXCLUDED.achieved_at,
            workout_set_id = EXCLUDED.workout_set_id
        WHERE EXCLUDED.weight > personal_records.weight;
    END IF;

    -- Return success result
    result := jsonb_build_object(
        'success', true,
        'set_id', set_id,
        'set_index', set_record.set_index
    );

    RETURN result;
END;
$$;