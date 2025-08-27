-- Add bar-loaded flag to exercises
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS is_bar_loaded boolean NOT NULL DEFAULT false;

-- Add weight and kind to equipment
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS weight_kg numeric(6,2),
ADD COLUMN IF NOT EXISTS kind text;

-- Seed common bars
INSERT INTO equipment (id, slug, kind, weight_kg)
VALUES
  (gen_random_uuid(), 'bar_olympic_20', 'bar', 20.00),
  (gen_random_uuid(), 'bar_olympic_15', 'bar', 15.00),
  (gen_random_uuid(), 'bar_ez_10', 'bar', 10.00),
  (gen_random_uuid(), 'bar_trap_25', 'bar', 25.00)
ON CONFLICT (slug) DO NOTHING;

-- Add equipment translations for bars
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT 
  e.id,
  'en',
  CASE e.slug
    WHEN 'bar_olympic_20' THEN 'Olympic Barbell 20 kg'
    WHEN 'bar_olympic_15' THEN 'Women''s Olympic Bar 15 kg'
    WHEN 'bar_ez_10' THEN 'EZ Curl Bar 10 kg'
    WHEN 'bar_trap_25' THEN 'Trap/Hex Bar 25 kg'
  END,
  'Standard barbell for weight training'
FROM equipment e
WHERE e.kind = 'bar'
ON CONFLICT DO NOTHING;

-- Add bar selection to workout exercises
ALTER TABLE workout_exercises
ADD COLUMN IF NOT EXISTS selected_bar_id uuid REFERENCES equipment(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS weight_input_mode text CHECK (weight_input_mode IN ('per_side','total')) DEFAULT 'per_side';

-- Add per-side tracking to workout sets
ALTER TABLE workout_sets
ADD COLUMN IF NOT EXISTS weight_per_side numeric(6,2),
ADD COLUMN IF NOT EXISTS bar_id uuid REFERENCES equipment(id) ON DELETE SET NULL;

-- Mark common barbell exercises as bar-loaded using exercise names
UPDATE exercises 
SET is_bar_loaded = true 
WHERE id IN (
  SELECT e.id 
  FROM exercises e 
  JOIN exercises_translations et ON et.exercise_id = e.id 
  WHERE et.language_code = 'en' 
  AND LOWER(et.name) IN (
    'barbell bench press',
    'back squat', 
    'deadlift',
    'overhead press',
    'barbell row',
    'incline barbell bench press',
    'decline barbell bench press'
  )
  AND e.owner_user_id IS NULL
);

-- Enhanced set_log RPC function
CREATE OR REPLACE FUNCTION set_log(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_workout_exercise_id uuid := (p_payload->>'workout_exercise_id')::uuid;
  v_reps                 int  := NULLIF(p_payload->>'reps','')::int;
  v_rpe                  numeric := NULLIF(p_payload->>'rpe','')::numeric;
  v_notes                text := p_payload->>'notes';
  v_is_completed         boolean := COALESCE((p_payload->>'is_completed')::boolean, true);
  v_set_index           int := COALESCE((p_payload->>'set_index')::int, 0);

  v_bar_id uuid := NULLIF(p_payload->>'bar_id','')::uuid;
  v_weight_per_side numeric := NULLIF(p_payload->>'weight_per_side','')::numeric;
  v_weight_total numeric := NULLIF(p_payload->>'weight_total','')::numeric;
  v_bar_weight numeric;
  v_final_total numeric;
  v_set_id uuid;
  v_next_index int;
BEGIN
  -- Validate user can mutate this workout exercise
  IF NOT can_mutate_workout_set(v_workout_exercise_id) THEN
    RAISE EXCEPTION 'Unauthorized to modify this workout exercise';
  END IF;

  -- Get next set index if not provided
  IF v_set_index = 0 THEN
    SELECT get_next_set_index(v_workout_exercise_id) INTO v_next_index;
    v_set_index := v_next_index;
  END IF;

  -- Compute total if per-side provided
  IF v_weight_total IS NULL AND v_weight_per_side IS NOT NULL THEN
    IF v_bar_id IS NULL THEN
      -- fallback to exercise's selected bar
      SELECT selected_bar_id INTO v_bar_id
      FROM workout_exercises WHERE id = v_workout_exercise_id;
    END IF;

    IF v_bar_id IS NOT NULL THEN
      SELECT weight_kg INTO v_bar_weight FROM equipment WHERE id = v_bar_id;
    ELSE
      v_bar_weight := 0;
    END IF;

    v_final_total := COALESCE(v_bar_weight,0) + COALESCE(v_weight_per_side,0)*2;
  ELSE
    v_final_total := v_weight_total;
  END IF;

  -- Insert the set
  INSERT INTO workout_sets (
    id, workout_exercise_id, set_index, weight, reps, rpe, notes,
    is_completed, completed_at, bar_id, weight_per_side, weight_unit
  )
  VALUES (
    gen_random_uuid(),
    v_workout_exercise_id,
    v_set_index,
    COALESCE(v_final_total,0),
    v_reps, v_rpe, v_notes,
    v_is_completed, 
    CASE WHEN v_is_completed THEN NOW() ELSE NULL END, 
    v_bar_id, v_weight_per_side, 'kg'
  )
  RETURNING id INTO v_set_id;

  -- Return the created set data
  RETURN jsonb_build_object(
    'id', v_set_id,
    'set_index', v_set_index,
    'weight', COALESCE(v_final_total,0),
    'reps', v_reps,
    'bar_id', v_bar_id,
    'weight_per_side', v_weight_per_side,
    'success', true
  );
END
$$;