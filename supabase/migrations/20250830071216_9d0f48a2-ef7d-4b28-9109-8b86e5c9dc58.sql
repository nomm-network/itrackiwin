-- Insert exercises with correct field names and enum values
WITH equipment_lookup AS (
  SELECT id, slug FROM equipment
),
muscle_lookup AS (
  SELECT id, slug FROM muscle_groups
),
exercise_data AS (
  VALUES 
    ('barbell-bench-press', 'Barbell Bench Press', 'horizontal_push'::movement_pattern, 'dual_load'::load_type, 'medium'::exercise_skill_level, 'olympic-barbell', 'chest', 100),
    ('overhead-press', 'Overhead Press', 'vertical_push'::movement_pattern, 'dual_load'::load_type, 'medium'::exercise_skill_level, 'olympic-barbell', 'shoulders', 90),
    ('triceps-pushdown', 'Triceps Pushdown', 'isolation'::movement_pattern, 'stack'::load_type, 'low'::exercise_skill_level, 'cable-machine', 'triceps', 80),
    ('squat', 'Squat', 'squat'::movement_pattern, 'dual_load'::load_type, 'high'::exercise_skill_level, 'olympic-barbell', 'quadriceps', 95),
    ('deadlift', 'Deadlift', 'hinge'::movement_pattern, 'dual_load'::load_type, 'high'::exercise_skill_level, 'olympic-barbell', 'hamstrings', 98)
),
exercise_inserts AS (
  INSERT INTO exercises (
    slug,
    display_name,
    custom_display_name,
    movement_pattern,
    load_type,
    exercise_skill_level,
    equipment_id,
    primary_muscle_id,
    popularity_rank,
    is_public,
    owner_user_id
  )
  SELECT 
    ed.slug,
    ed.display_name,
    ed.display_name,
    ed.movement_pattern,
    ed.load_type,
    ed.exercise_skill_level,
    eq.id,
    mg.id,
    ed.popularity_rank,
    true,
    NULL
  FROM (VALUES 
    ('barbell-bench-press', 'Barbell Bench Press', 'horizontal_push'::movement_pattern, 'dual_load'::load_type, 'medium'::exercise_skill_level, 'olympic-barbell', 'chest', 100),
    ('overhead-press', 'Overhead Press', 'vertical_push'::movement_pattern, 'dual_load'::load_type, 'medium'::exercise_skill_level, 'olympic-barbell', 'shoulders', 90),
    ('triceps-pushdown', 'Triceps Pushdown', 'isolation'::movement_pattern, 'stack'::load_type, 'low'::exercise_skill_level, 'cable-machine', 'triceps', 80),
    ('squat', 'Squat', 'squat'::movement_pattern, 'dual_load'::load_type, 'high'::exercise_skill_level, 'olympic-barbell', 'quadriceps', 95),
    ('deadlift', 'Deadlift', 'hinge'::movement_pattern, 'dual_load'::load_type, 'high'::exercise_skill_level, 'olympic-barbell', 'hamstrings', 98)
  ) AS ed(slug, display_name, movement_pattern, load_type, exercise_skill_level, equipment_slug, muscle_slug, popularity_rank)
  LEFT JOIN equipment_lookup eq ON eq.slug = ed.equipment_slug
  LEFT JOIN muscle_lookup mg ON mg.slug = ed.muscle_slug
  ON CONFLICT (slug) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    custom_display_name = EXCLUDED.custom_display_name,
    movement_pattern = EXCLUDED.movement_pattern,
    load_type = EXCLUDED.load_type,
    exercise_skill_level = EXCLUDED.exercise_skill_level
  RETURNING id, slug
)
-- Insert translations for the exercises
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT 
  ei.id,
  'en',
  CASE ei.slug
    WHEN 'barbell-bench-press' THEN 'Barbell Bench Press'
    WHEN 'overhead-press' THEN 'Overhead Press'
    WHEN 'triceps-pushdown' THEN 'Triceps Pushdown'
    WHEN 'squat' THEN 'Squat'
    WHEN 'deadlift' THEN 'Deadlift'
  END,
  CASE ei.slug
    WHEN 'barbell-bench-press' THEN 'A horizontal pushing exercise targeting the chest muscles'
    WHEN 'overhead-press' THEN 'A vertical pushing exercise targeting the shoulders'
    WHEN 'triceps-pushdown' THEN 'An isolation exercise for the triceps muscles'
    WHEN 'squat' THEN 'A fundamental lower body exercise targeting the quadriceps'
    WHEN 'deadlift' THEN 'A hip hinge movement targeting the posterior chain'
  END
FROM exercise_inserts ei
ON CONFLICT (exercise_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;