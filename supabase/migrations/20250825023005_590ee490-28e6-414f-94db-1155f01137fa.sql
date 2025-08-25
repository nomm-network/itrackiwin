-- Drop and recreate views that depend on name/description columns
-- First drop the views
DROP VIEW IF EXISTS v_available_exercises CASCADE;
DROP VIEW IF EXISTS v_exercises_with_translations CASCADE;
DROP VIEW IF EXISTS v_exercises_for_coach CASCADE;
DROP VIEW IF EXISTS v_safe_exercises_for_user CASCADE;

-- Recreate v_exercises_with_translations (this one is good as is, just select different columns)
CREATE VIEW v_exercises_with_translations AS
SELECT 
  e.id,
  e.owner_user_id,
  e.slug,
  e.is_public,
  e.created_at,
  e.image_url,
  e.thumbnail_url,
  e.source_url,
  e.popularity_rank,
  e.body_part,
  e.body_part_id,
  e.primary_muscle_id,
  e.equipment_id,
  e.secondary_muscle_group_ids,
  COALESCE(
    json_agg(
      json_build_object(
        'language_code', et.language_code, 
        'name', et.name, 
        'description', et.description
      )
    ) FILTER (WHERE et.exercise_id IS NOT NULL), 
    '[]'::json
  ) AS translations
FROM exercises e
LEFT JOIN exercises_translations et ON e.id = et.exercise_id
GROUP BY e.id, e.slug, e.body_part, e.body_part_id, e.primary_muscle_id, 
         e.secondary_muscle_group_ids, e.equipment_id, e.image_url, 
         e.thumbnail_url, e.is_public, e.owner_user_id, e.source_url, 
         e.popularity_rank, e.created_at;

-- Recreate v_exercises_for_coach using translations
CREATE VIEW v_exercises_for_coach AS
SELECT 
  e.id,
  et.name,
  e.slug,
  e.movement_pattern,
  e.exercise_skill_level,
  e.complexity_score,
  e.primary_muscle_id,
  e.secondary_muscle_group_ids,
  e.equipment_id,
  eq.slug AS equipment_slug,
  mg.slug AS primary_muscle_slug,
  bp.slug AS body_part_slug,
  e.is_public,
  e.popularity_rank
FROM exercises e
LEFT JOIN exercises_translations et ON e.id = et.exercise_id AND et.language_code = 'en'
LEFT JOIN equipment eq ON eq.id = e.equipment_id
LEFT JOIN muscle_groups mg ON mg.id = e.primary_muscle_id
LEFT JOIN body_parts bp ON bp.id = e.body_part_id
WHERE (e.is_public = true OR e.owner_user_id = auth.uid())
ORDER BY e.popularity_rank, et.name;

-- Recreate v_safe_exercises_for_user using translations
CREATE VIEW v_safe_exercises_for_user AS
SELECT 
  e.id,
  et.name,
  e.slug,
  e.movement_pattern,
  e.exercise_skill_level,
  e.complexity_score,
  e.contraindications,
  CASE
    WHEN auth.uid() IS NULL THEN true
    WHEN NOT EXISTS (
      SELECT 1 FROM user_injuries ui 
      WHERE ui.user_id = auth.uid() AND ui.is_active = true
    ) THEN true
    ELSE (
      SELECT is_safe 
      FROM filter_exercises_by_injuries(auth.uid(), ARRAY[e.id]) 
      WHERE exercise_id = e.id
    )
  END AS is_safe_for_user
FROM exercises e
LEFT JOIN exercises_translations et ON e.id = et.exercise_id AND et.language_code = 'en'
WHERE (e.is_public = true OR e.owner_user_id = auth.uid());

-- Recreate v_available_exercises
CREATE VIEW v_available_exercises AS
WITH ex_all AS (
  SELECT 
    ex.id,
    ex.body_part_id,
    ex.equipment_id
  FROM exercises ex
)
SELECT DISTINCT 
  u.user_id,
  ex.id AS exercise_id
FROM v_user_gym_equipment u
JOIN ex_all ex ON (
  ex.equipment_id = u.equipment_id OR 
  EXISTS (
    SELECT 1 
    FROM exercise_equipment_variants v
    WHERE v.exercise_id = ex.id AND v.equipment_id = u.equipment_id
  )
);