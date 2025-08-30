-- Clear existing exercises and insert properly with new movement structure
DELETE FROM exercises;

-- Insert exercises with correct movement pattern and movement references
WITH equipment_lookup AS (
  SELECT id, slug FROM equipment
),
muscle_lookup AS (
  SELECT id, slug FROM muscles  -- Using muscles table, not muscle_groups
),
muscle_groups_lookup AS (
  SELECT id, slug FROM muscle_groups
),
body_lookup AS (
  SELECT id, slug FROM body_parts
),
movement_pattern_lookup AS (
  SELECT id, slug FROM movement_patterns
),
movement_lookup AS (
  SELECT id, slug FROM movements
),
exercise_inserts AS (
  INSERT INTO exercises (
    slug,
    display_name,
    custom_display_name,
    movement_pattern_id,
    movement_id,
    load_type,
    exercise_skill_level,
    equipment_id,
    primary_muscle_id,
    body_part_id,
    complexity_score,
    is_bar_loaded,
    default_bar_weight,
    loading_hint,
    popularity_rank,
    is_public,
    owner_user_id,
    tags,
    secondary_muscle_group_ids
  )
  SELECT 
    ed.slug,
    ed.display_name,
    ed.display_name,
    mp.id,
    mv.id,
    ed.load_type::load_type_enum,
    ed.exercise_skill_level::exercise_skill_level,
    eq.id,
    mg.id,
    bp.id,
    ed.complexity_score,
    ed.is_bar_loaded,
    ed.default_bar_weight,
    ed.loading_hint,
    ed.popularity_rank,
    true,
    NULL,
    ed.tags::text[],
    ed.secondary_groups::uuid[]
  FROM (VALUES 
    ('barbell-bench-press', 'Barbell Bench Press', 'horizontal_push', 'press', 'dual_load', 'medium', 'olympic-barbell', 'mid_chest', 'chest', 4, true, 20, 'per_side', 100, ARRAY['compound', 'strength'], ARRAY[(SELECT id FROM muscle_groups_lookup WHERE slug = 'shoulders'), (SELECT id FROM muscle_groups_lookup WHERE slug = 'triceps')]),
    ('overhead-press', 'Overhead Press', 'vertical_push', 'press', 'dual_load', 'medium', 'olympic-barbell', 'front_delts', 'arms', 5, true, 20, 'per_side', 90, ARRAY['compound', 'strength'], ARRAY[(SELECT id FROM muscle_groups_lookup WHERE slug = 'triceps'), (SELECT id FROM muscle_groups_lookup WHERE slug = 'traps')]),
    ('triceps-pushdown', 'Triceps Pushdown', 'isolation', 'pull', 'stack', 'low', 'cable-machine', 'triceps_lateral_head', 'arms', 2, false, NULL, 'total', 80, ARRAY['isolation', 'accessories'], ARRAY[]::uuid[]),
    ('squat', 'Squat', 'squat', 'squat', 'dual_load', 'high', 'olympic-barbell', 'rectus_femoris', 'legs', 6, true, 20, 'per_side', 95, ARRAY['compound', 'strength'], ARRAY[(SELECT id FROM muscle_groups_lookup WHERE slug = 'glutes'), (SELECT id FROM muscle_groups_lookup WHERE slug = 'hamstrings'), (SELECT id FROM muscle_groups_lookup WHERE slug = 'calves')]),
    ('deadlift', 'Deadlift', 'hinge', 'hinge', 'dual_load', 'high', 'olympic-barbell', 'erector_spinae', 'legs', 7, true, 20, 'per_side', 98, ARRAY['compound', 'strength'], ARRAY[(SELECT id FROM muscle_groups_lookup WHERE slug = 'glutes'), (SELECT id FROM muscle_groups_lookup WHERE slug = 'hamstrings'), (SELECT id FROM muscle_groups_lookup WHERE slug = 'traps'), (SELECT id FROM muscle_groups_lookup WHERE slug = 'forearms')])
  ) AS ed(slug, display_name, movement_pattern_slug, movement_slug, load_type, exercise_skill_level, equipment_slug, muscle_slug, body_slug, complexity_score, is_bar_loaded, default_bar_weight, loading_hint, popularity_rank, tags, secondary_groups)
  LEFT JOIN equipment_lookup eq ON eq.slug = ed.equipment_slug
  LEFT JOIN muscle_lookup mg ON mg.slug = ed.muscle_slug  
  LEFT JOIN body_lookup bp ON bp.slug = ed.body_slug
  LEFT JOIN movement_pattern_lookup mp ON mp.slug = ed.movement_pattern_slug
  LEFT JOIN movement_lookup mv ON mv.slug = ed.movement_slug
  WHERE eq.id IS NOT NULL AND mg.id IS NOT NULL AND bp.id IS NOT NULL AND mp.id IS NOT NULL AND mv.id IS NOT NULL
  RETURNING id, slug
)
-- Insert translations
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