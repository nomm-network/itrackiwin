-- Drop and recreate the function with correct parameter names
DROP FUNCTION IF EXISTS public.generate_exercise_name(uuid,uuid,text,jsonb,text,text,text);

CREATE OR REPLACE FUNCTION public.generate_exercise_name(
  p_movement_id uuid,
  p_equipment_id uuid,
  p_primary_muscle_name text,
  p_attribute_values_json jsonb,
  p_handle_key text,
  p_grip_type_key text,
  p_name_locale text
) RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  movement_name TEXT := '';
  equipment_name TEXT := '';
  final_name TEXT;
BEGIN
  -- Get movement slug
  IF p_movement_id IS NOT NULL THEN
    SELECT slug INTO movement_name FROM public.movements WHERE id = p_movement_id;
    movement_name := COALESCE(movement_name, '');
  END IF;

  -- Get equipment slug  
  IF p_equipment_id IS NOT NULL THEN
    SELECT slug INTO equipment_name FROM public.equipment WHERE id = p_equipment_id;
    equipment_name := COALESCE(equipment_name, '');
  END IF;

  -- Simple concatenation
  final_name := TRIM(CONCAT(equipment_name, ' ', movement_name));
  
  -- Return a default if empty
  IF final_name = '' OR final_name IS NULL THEN
    final_name := 'Exercise';
  END IF;

  RETURN final_name;
END;
$function$;

-- Now insert the exercises
WITH exercise_data AS (
  SELECT * FROM (VALUES
    -- QUADRICEPS EXERCISES (4)
    ('barbell-back-squat', 'Barbell Back Squat'),
    ('leg-press', 'Leg Press'),  
    ('bulgarian-split-squat', 'Bulgarian Split Squat'),
    ('front-squat', 'Front Squat'),
    
    -- CHEST EXERCISES (4) 
    ('barbell-bench-press', 'Barbell Bench Press'),
    ('dumbbell-bench-press', 'Dumbbell Bench Press'),
    ('incline-barbell-press', 'Incline Barbell Press'),
    ('dips', 'Dips'),
    
    -- SHOULDERS EXERCISES (4)
    ('overhead-press', 'Overhead Press'),
    ('dumbbell-shoulder-press', 'Dumbbell Shoulder Press'),
    ('lateral-raises', 'Lateral Raises'),
    ('face-pulls', 'Face Pulls'),
    
    -- TRICEPS EXERCISES (4)
    ('triceps-pushdown', 'Triceps Pushdown'),
    ('close-grip-bench-press', 'Close Grip Bench Press'),
    ('skull-crushers', 'Skull Crushers'),
    ('overhead-tricep-extension', 'Overhead Tricep Extension')
  ) AS t(slug, display_name)
)
INSERT INTO exercises (
  slug,
  display_name,
  is_public,
  owner_user_id,
  popularity_rank,
  exercise_skill_level,
  created_at
)
SELECT 
  ed.slug,
  ed.display_name,
  true,
  NULL,
  (50 + (ROW_NUMBER() OVER (ORDER BY ed.slug))),
  'medium'::exercise_skill_level,
  now()
FROM exercise_data ed
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  popularity_rank = EXCLUDED.popularity_rank;