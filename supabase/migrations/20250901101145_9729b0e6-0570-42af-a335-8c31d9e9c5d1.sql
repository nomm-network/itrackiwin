-- 1. Delete stray grip translation entries that don't have valid grip_ids
DELETE FROM public.grips_translations 
WHERE grip_id NOT IN (SELECT id FROM public.grips);

-- 2. Drop all tables with bak_ prefix (old backups)
DROP TABLE IF EXISTS public.bak_exercise_grips CASCADE;
DROP TABLE IF EXISTS public.bak_exercise_handle_grips CASCADE;
DROP TABLE IF EXISTS public.bak_exercise_handles CASCADE;
DROP TABLE IF EXISTS public.bak_exercises CASCADE;
DROP TABLE IF EXISTS public.bak_exercises_translations CASCADE;
DROP TABLE IF EXISTS public.bak_template_exercises CASCADE;
DROP TABLE IF EXISTS public.bak_workout_exercises CASCADE;
DROP TABLE IF EXISTS public.bak_workout_sets CASCADE;
DROP TABLE IF EXISTS public.bak_workout_templates CASCADE;
DROP TABLE IF EXISTS public.bak_workouts CASCADE;

-- 3. Drop and recreate the v_exercises_with_translations view to fix the build errors
DROP VIEW IF EXISTS public.v_exercises_with_translations CASCADE;

CREATE VIEW public.v_exercises_with_translations AS
SELECT 
  e.*,
  COALESCE(
    jsonb_object_agg(
      et.language_code, 
      jsonb_build_object('name', et.name, 'description', et.description)
    ) FILTER (WHERE et.language_code IS NOT NULL),
    '{}'::jsonb
  ) as translations
FROM public.exercises e
LEFT JOIN public.exercises_translations et ON et.exercise_id = e.id
GROUP BY e.id, e.owner_user_id, e.is_public, e.created_at, e.popularity_rank, 
         e.body_part_id, e.primary_muscle_id, e.equipment_id, e.secondary_muscle_group_ids,
         e.default_grip_ids, e.capability_schema, e.exercise_skill_level, e.complexity_score,
         e.contraindications, e.default_bar_weight, e.is_bar_loaded, e.load_type,
         e.default_bar_type_id, e.allows_grips, e.is_unilateral, e.attribute_values_json,
         e.movement_id, e.equipment_ref_id, e.name_version, e.display_name_tsv,
         e.movement_pattern_id, e.configured, e.source_url, e.display_name,
         e.custom_display_name, e.image_url, e.name_locale, e.tags, e.slug,
         e.loading_hint, e.thumbnail_url;