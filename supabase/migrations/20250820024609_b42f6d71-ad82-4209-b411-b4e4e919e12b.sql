-- Drop the view first, then update the column, then recreate the view
DROP VIEW IF EXISTS public.v_exercises_with_translations;

-- Update exercises table to use secondary muscle groups instead of muscles
ALTER TABLE public.exercises 
DROP COLUMN IF EXISTS secondary_muscle_ids;

ALTER TABLE public.exercises 
ADD COLUMN secondary_muscle_group_ids uuid[] DEFAULT NULL;

-- Recreate the view with the new column
CREATE OR REPLACE VIEW public.v_exercises_with_translations AS
SELECT 
  e.*,
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
FROM public.exercises e
LEFT JOIN public.exercises_translations et ON e.id = et.exercise_id
GROUP BY e.id, e.name, e.slug, e.description, e.body_part, e.body_part_id, 
         e.primary_muscle_id, e.secondary_muscle_group_ids, e.equipment_id, 
         e.image_url, e.thumbnail_url, e.is_public, e.owner_user_id, 
         e.source_url, e.popularity_rank, e.created_at;