-- Drop existing view and recreate with correct structure
DROP VIEW IF EXISTS v_exercises_with_translations CASCADE;

-- Create the v_exercises_with_translations view with correct structure
CREATE VIEW v_exercises_with_translations AS
SELECT 
  e.id,
  e.created_at,
  e.is_public,
  e.movement_pattern,
  e.body_part,
  e.source_url,
  e.thumbnail_url,
  e.image_url,
  e.exercise_skill_level,
  e.primary_muscle_id,
  e.body_part_id,
  e.secondary_muscle_group_ids,
  e.default_grip_ids,
  e.popularity_rank,
  e.contraindications,
  e.complexity_score,
  e.equipment_id,
  e.capability_schema,
  e.owner_user_id,
  -- Create slug from first available translation name (fallback to id if no translations)
  COALESCE(
    LOWER(REGEXP_REPLACE(
      COALESCE(
        (SELECT et.name FROM exercises_translations et WHERE et.exercise_id = e.id AND et.language_code = 'en' LIMIT 1),
        (SELECT et.name FROM exercises_translations et WHERE et.exercise_id = e.id LIMIT 1)
      ), 
      '[^a-zA-Z0-9]+', '-', 'g'
    )),
    'exercise-' || SUBSTRING(e.id::text, 1, 8)
  ) as slug,
  -- Aggregate all translations into a JSON object
  COALESCE(
    (SELECT jsonb_object_agg(
      et.language_code, 
      jsonb_build_object(
        'name', et.name, 
        'description', et.description
      )
    ) 
    FROM exercises_translations et 
    WHERE et.exercise_id = e.id
    ), '{}'::jsonb
  ) as translations
FROM exercises e;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercises_translations_exercise_id ON exercises_translations(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercises_translations_language_code ON exercises_translations(language_code);