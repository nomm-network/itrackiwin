-- =====================================================
-- WORKOUT CATALOG CLEANUP: CLEAN SLATE (Step 3)
-- =====================================================

-- Truncate in correct order (children first, parents last)
-- Order matters: foreign key constraints require child tables first

-- 1) Clear workout data (children first)
TRUNCATE TABLE public.workout_sets RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.workout_exercises RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.workouts RESTART IDENTITY CASCADE;

-- 2) Clear template data
TRUNCATE TABLE public.template_exercises RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.workout_templates RESTART IDENTITY CASCADE;

-- 3) Clear exercise relationships (these will be rebuilt with new data)
TRUNCATE TABLE public.exercise_handle_grips RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.exercise_grips RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.exercise_handles RESTART IDENTITY CASCADE;

-- 4) Clear exercise default relationships
TRUNCATE TABLE public.exercise_default_grips RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.exercise_default_handles RESTART IDENTITY CASCADE;

-- 5) Clear user estimates (optional - start fresh)
TRUNCATE TABLE public.user_exercise_estimates RESTART IDENTITY CASCADE;

-- 6) Clear personal records (we'll rebuild these from new workouts)
TRUNCATE TABLE public.personal_records RESTART IDENTITY CASCADE;

-- Keep these foundation tables intact:
-- - body_parts, muscles, and their _translations
-- - grips, handles, equipment and their _translations  
-- - handle_grip_compatibility
-- - languages
-- - bar_types

-- Note: We do NOT truncate exercises or exercises_translations
-- We will clean those up manually and reseed properly