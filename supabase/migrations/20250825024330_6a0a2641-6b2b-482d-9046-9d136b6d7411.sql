-- Create the v_exercises_with_translations view
CREATE OR REPLACE VIEW v_exercises_with_translations AS
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

-- Create a view for body parts with translations
CREATE OR REPLACE VIEW v_body_parts_with_translations AS
SELECT 
  bp.id,
  bp.created_at,
  bp.slug,
  COALESCE(
    (SELECT jsonb_object_agg(
      bpt.language_code, 
      jsonb_build_object(
        'name', bpt.name, 
        'description', bpt.description
      )
    ) 
    FROM body_parts_translations bpt 
    WHERE bpt.body_part_id = bp.id
    ), '{}'::jsonb
  ) as translations
FROM body_parts bp;

-- Create a view for muscle groups with translations
CREATE OR REPLACE VIEW v_muscle_groups_with_translations AS
SELECT 
  mg.id,
  mg.created_at,
  mg.slug,
  mg.body_part_id,
  COALESCE(
    (SELECT jsonb_object_agg(
      mgt.language_code, 
      jsonb_build_object(
        'name', mgt.name, 
        'description', mgt.description
      )
    ) 
    FROM muscle_groups_translations mgt 
    WHERE mgt.muscle_group_id = mg.id
    ), '{}'::jsonb
  ) as translations
FROM muscle_groups mg;

-- Create a view for muscles with translations
CREATE OR REPLACE VIEW v_muscles_with_translations AS
SELECT 
  m.id,
  m.created_at,
  m.slug,
  m.muscle_group_id,
  COALESCE(
    (SELECT jsonb_object_agg(
      mt.language_code, 
      jsonb_build_object(
        'name', mt.name, 
        'description', mt.description
      )
    ) 
    FROM muscles_translations mt 
    WHERE mt.muscle_id = m.id
    ), '{}'::jsonb
  ) as translations
FROM muscles m;

-- Create a view for equipment with translations
CREATE OR REPLACE VIEW v_equipment_with_translations AS
SELECT 
  eq.id,
  eq.created_at,
  eq.slug,
  eq.equipment_type,
  eq.default_stack,
  COALESCE(
    (SELECT jsonb_object_agg(
      eqt.language_code, 
      jsonb_build_object(
        'name', eqt.name, 
        'description', eqt.description
      )
    ) 
    FROM equipment_translations eqt 
    WHERE eqt.equipment_id = eq.id
    ), '{}'::jsonb
  ) as translations
FROM equipment eq;

-- Create a view for grips with translations
CREATE OR REPLACE VIEW v_grips_with_translations AS
SELECT 
  g.id,
  g.created_at,
  g.slug,
  g.category,
  g.is_compatible_with,
  COALESCE(
    (SELECT jsonb_object_agg(
      gt.language_code, 
      jsonb_build_object(
        'name', gt.name, 
        'description', gt.description
      )
    ) 
    FROM grips_translations gt 
    WHERE gt.grip_id = g.id
    ), '{}'::jsonb
  ) as translations
FROM grips g;