-- Clean up exercises with NULL slugs and their translations

-- First, delete translations for exercises with NULL slugs
DELETE FROM public.exercises_translations
WHERE exercise_id IN (
  SELECT id FROM public.exercises WHERE slug IS NULL
);

-- Delete exercise aliases for exercises with NULL slugs
DELETE FROM public.exercise_aliases
WHERE exercise_id IN (
  SELECT id FROM public.exercises WHERE slug IS NULL
);

-- Delete exercise images for exercises with NULL slugs
DELETE FROM public.exercise_images
WHERE exercise_id IN (
  SELECT id FROM public.exercises WHERE slug IS NULL
);

-- Delete exercise default grips for exercises with NULL slugs
DELETE FROM public.exercise_default_grips
WHERE exercise_id IN (
  SELECT id FROM public.exercises WHERE slug IS NULL
);

-- Delete exercise grips for exercises with NULL slugs
DELETE FROM public.exercise_grips
WHERE exercise_id IN (
  SELECT id FROM public.exercises WHERE slug IS NULL
);

-- Delete exercise grip effects for exercises with NULL slugs
DELETE FROM public.exercise_grip_effects
WHERE exercise_id IN (
  SELECT id FROM public.exercises WHERE slug IS NULL
);

-- Delete exercise equipment variants for exercises with NULL slugs
DELETE FROM public.exercise_equipment_variants
WHERE exercise_id IN (
  SELECT id FROM public.exercises WHERE slug IS NULL
);

-- Delete exercise equipment profiles for exercises with NULL slugs
DELETE FROM public.exercise_equipment_profiles
WHERE exercise_id IN (
  SELECT id FROM public.exercises WHERE slug IS NULL
);

-- Delete exercise handle orientations for exercises with NULL slugs
DELETE FROM public.exercise_handle_orientations
WHERE exercise_id IN (
  SELECT id FROM public.exercises WHERE slug IS NULL
);

-- Finally, delete the exercises themselves
DELETE FROM public.exercises WHERE slug IS NULL;