-- Recreate views properly based on actual table structure
CREATE VIEW public.v_exercises_with_translations AS
SELECT 
  e.id,
  e.slug,
  e.body_part_id,
  e.owner_user_id,
  e.is_public,
  e.popularity_rank,
  e.equipment_id,
  e.secondary_muscle_ids,
  e.primary_muscle_id,
  e.image_url,
  e.thumbnail_url,
  e.body_part,
  e.source_url,
  e.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.exercises e
LEFT JOIN public.exercises_translations t ON e.id = t.exercise_id
GROUP BY e.id, e.slug, e.body_part_id, e.owner_user_id, e.is_public, e.popularity_rank, e.equipment_id, e.secondary_muscle_ids, e.primary_muscle_id, e.image_url, e.thumbnail_url, e.body_part, e.source_url, e.created_at;

CREATE VIEW public.v_workout_templates_with_translations AS
SELECT 
  wt.id,
  wt.user_id,
  wt.notes,
  wt.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.workout_templates wt
LEFT JOIN public.workout_templates_translations t ON wt.id = t.template_id
GROUP BY wt.id, wt.user_id, wt.notes, wt.created_at;

-- Set views as security invoker
ALTER VIEW public.v_exercises_with_translations SET (security_invoker = true);
ALTER VIEW public.v_workout_templates_with_translations SET (security_invoker = true);