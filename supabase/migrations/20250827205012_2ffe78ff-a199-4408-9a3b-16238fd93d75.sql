-- 🚨 FULL DATABASE CLEANUP - Fresh Start
-- This will wipe ALL workout + lookup data for clean seeding

-- 1. Disable FK checks temporarily
SET session_replication_role = 'replica';

-- 2. Truncate workout/session-related tables first
TRUNCATE TABLE
  workout_sets,
  workout_exercises,
  workouts,
  template_exercises,
  workout_templates,
  user_exercise_estimates,
  personal_records,
  readiness_checkins,
  auto_deload_triggers
RESTART IDENTITY CASCADE;

-- 3. Truncate exercise relationship tables
TRUNCATE TABLE
  exercise_handles,
  exercise_grips,
  exercise_handle_grips,
  exercise_default_grips,
  exercise_default_handles,
  exercise_grip_effects,
  exercise_similars,
  exercise_equipment_variants,
  exercise_images
RESTART IDENTITY CASCADE;

-- 4. Truncate main lookup tables (exercises, equipment, handles, grips, muscles)
TRUNCATE TABLE
  exercises,
  exercises_translations,
  equipment,
  equipment_translations,
  handles,
  handle_translations,
  grips,
  grips_translations,
  body_parts,
  body_parts_translations,
  muscles,
  muscles_translations
RESTART IDENTITY CASCADE;

-- 5. Truncate handle-grip compatibility
TRUNCATE TABLE
  handle_grip_compatibility
RESTART IDENTITY CASCADE;

-- 6. Re-enable FK checks
SET session_replication_role = 'origin';

-- Verify cleanup
SELECT 
  'exercises' as table_name, COUNT(*) as row_count FROM exercises
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL  
SELECT 'handles', COUNT(*) FROM handles
UNION ALL
SELECT 'grips', COUNT(*) FROM grips
UNION ALL
SELECT 'muscles', COUNT(*) FROM muscles
UNION ALL
SELECT 'workouts', COUNT(*) FROM workouts;