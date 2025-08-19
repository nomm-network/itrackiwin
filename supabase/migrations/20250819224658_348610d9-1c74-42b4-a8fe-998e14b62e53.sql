-- Clean up dependencies and remove name columns properly
-- First drop views that depend on the columns
DROP VIEW IF EXISTS public.v_exercises_with_translations CASCADE;
DROP VIEW IF EXISTS public.v_workout_templates_with_translations CASCADE;
DROP VIEW IF EXISTS public.v_body_parts_with_translations CASCADE;
DROP VIEW IF EXISTS public.v_equipment_with_translations CASCADE;
DROP VIEW IF EXISTS public.v_muscle_groups_with_translations CASCADE;
DROP VIEW IF EXISTS public.v_muscles_with_translations CASCADE;

-- Remove name columns from original tables
ALTER TABLE public.body_parts DROP COLUMN IF EXISTS name;
ALTER TABLE public.equipment DROP COLUMN IF EXISTS name;
ALTER TABLE public.muscle_groups DROP COLUMN IF EXISTS name;
ALTER TABLE public.muscles DROP COLUMN IF EXISTS name;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS name CASCADE;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS description;
ALTER TABLE public.workout_templates DROP COLUMN IF EXISTS name;

-- Recreate views without the name columns
CREATE VIEW public.v_body_parts_with_translations AS
SELECT 
  bp.id,
  bp.slug,
  bp.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.body_parts bp
LEFT JOIN public.body_parts_translations t ON bp.id = t.body_part_id
GROUP BY bp.id, bp.slug, bp.created_at;

CREATE VIEW public.v_equipment_with_translations AS
SELECT 
  e.id,
  e.slug,
  e.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.equipment e
LEFT JOIN public.equipment_translations t ON e.id = t.equipment_id
GROUP BY e.id, e.slug, e.created_at;

CREATE VIEW public.v_muscle_groups_with_translations AS
SELECT 
  mg.id,
  mg.slug,
  mg.body_part_id,
  mg.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.muscle_groups mg
LEFT JOIN public.muscle_groups_translations t ON mg.id = t.muscle_group_id
GROUP BY mg.id, mg.slug, mg.body_part_id, mg.created_at;

CREATE VIEW public.v_muscles_with_translations AS
SELECT 
  m.id,
  m.slug,
  m.muscle_group_id,
  m.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.muscles m
LEFT JOIN public.muscles_translations t ON m.id = t.muscle_id
GROUP BY m.id, m.slug, m.muscle_group_id, m.created_at;

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
ALTER VIEW public.v_body_parts_with_translations SET (security_invoker = true);
ALTER VIEW public.v_equipment_with_translations SET (security_invoker = true);
ALTER VIEW public.v_muscle_groups_with_translations SET (security_invoker = true);
ALTER VIEW public.v_muscles_with_translations SET (security_invoker = true);
ALTER VIEW public.v_exercises_with_translations SET (security_invoker = true);
ALTER VIEW public.v_workout_templates_with_translations SET (security_invoker = true);