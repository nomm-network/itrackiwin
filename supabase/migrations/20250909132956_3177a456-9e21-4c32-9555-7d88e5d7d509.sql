-- Add 5 new exercises with proper constraints and translations

-- Data preparation CTEs
WITH muscle_lookups AS (
  SELECT id, slug FROM muscles
), equipment_lookups AS (
  SELECT id, slug FROM equipment  
), muscle_group_lookups AS (
  SELECT id, slug FROM muscle_groups
), body_part_lookups AS (
  SELECT id, slug FROM body_parts
),

-- Define the new exercises data
params AS (
  SELECT * FROM (VALUES
    ('middle-chest-press-machine', 'Middle Chest Press Machine', 'Machine chest press targeting the middle pectorals', 'machine', 'pectoralis-major', 'upper_body', ARRAY['shoulders']),
    ('barbell-shoulder-press', 'Barbell Shoulder Press', 'Standing or seated barbell press for shoulder development', 'barbell', 'anterior-deltoid', 'upper_body', ARRAY['arms', 'core']),
    ('chest-front-dumbbell-raises', 'Chest Front Dumbbell Raises', 'Front raises targeting the upper chest and anterior deltoids', 'dumbbell', 'anterior-deltoid', 'upper_body', ARRAY['chest']),
    ('dips-machine-stack', 'Dips Machine', 'Stack loaded dips machine for triceps development', 'machine', 'triceps-brachii', 'upper_body', ARRAY['chest']),
    ('cable-rope-triceps-extensions', 'Cable Rope Triceps Extensions', 'Cable triceps extensions using rope attachment', 'cable-machine', 'triceps-brachii', 'upper_body', ARRAY['shoulders'])
  ) AS t(slug, name, description, equipment_slug, muscle_slug, body_part_slug, secondary_groups)
),

-- Resolve IDs from slugs
resolved AS (
  SELECT 
    p.slug,
    p.name,
    p.description,
    eq.id as equipment_id,
    m.id as primary_muscle_id,
    bp.id as body_part_id,
    p.secondary_groups
  FROM params p
  LEFT JOIN equipment_lookups eq ON eq.slug = p.equipment_slug
  LEFT JOIN muscle_lookups m ON m.slug = p.muscle_slug
  LEFT JOIN body_part_lookups bp ON bp.slug = p.body_part_slug
),

-- Insert exercises
inserted_exercises AS (
  INSERT INTO exercises (
    slug,
    equipment_id,
    primary_muscle_id,
    body_part_id,
    is_public,
    owner_user_id,
    secondary_muscle_group_ids,
    configured
  )
  SELECT 
    r.slug,
    r.equipment_id,
    r.primary_muscle_id,
    r.body_part_id,
    true,
    NULL,
    ARRAY(
      SELECT mg.id 
      FROM muscle_group_lookups mg 
      WHERE mg.slug = ANY(r.secondary_groups)
    ),
    true
  FROM resolved r
  WHERE r.equipment_id IS NOT NULL 
    AND r.primary_muscle_id IS NOT NULL 
    AND r.body_part_id IS NOT NULL
  ON CONFLICT (slug) DO UPDATE SET
    popularity_rank = EXCLUDED.popularity_rank,
    configured = EXCLUDED.configured
  RETURNING id, slug
)

-- Insert translations
INSERT INTO exercises_translations (
  exercise_id,
  language_code,
  name,
  description
)
SELECT 
  ie.id,
  'en',
  r.name,
  r.description
FROM inserted_exercises ie
JOIN resolved r ON r.slug = ie.slug
ON CONFLICT (exercise_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Verification: Show added exercises
SELECT 
  e.slug,
  et.name,
  m.slug as primary_muscle,
  eq.slug as equipment,
  bp.slug as body_part,
  array_agg(mg.slug) as secondary_muscle_groups
FROM exercises e
JOIN exercises_translations et ON et.exercise_id = e.id AND et.language_code = 'en'
LEFT JOIN muscles m ON m.id = e.primary_muscle_id
LEFT JOIN equipment eq ON eq.id = e.equipment_id
LEFT JOIN body_parts bp ON bp.id = e.body_part_id
LEFT JOIN muscle_groups mg ON mg.id = ANY(e.secondary_muscle_group_ids)
WHERE e.slug IN (
  'middle-chest-press-machine',
  'barbell-shoulder-press', 
  'chest-front-dumbbell-raises',
  'dips-machine-stack',
  'cable-rope-triceps-extensions'
)
GROUP BY e.slug, et.name, m.slug, eq.slug, bp.slug
ORDER BY e.slug;