-- Drop the existing view and recreate it with proper column definitions
DROP VIEW IF EXISTS public.v_exercises_with_translations;

-- Create the view with all required columns including muscle information
CREATE VIEW public.v_exercises_with_translations AS
SELECT 
  e.id,
  e.owner_user_id,
  e.primary_muscle_id,
  e.image_url,
  e.equipment_id,
  e.contraindications,
  e.complexity_score,
  e.exercise_skill_level,
  e.capability_schema,
  e.movement_pattern,
  e.thumbnail_url,
  e.source_url,
  e.secondary_muscle_group_ids,
  e.default_grip_ids,
  e.body_part_id,
  e.popularity_rank,
  e.is_public,
  e.created_at,
  
  -- Include slug from exercise translations
  COALESCE(et_en.name, et_default.name) as slug,
  
  -- Include muscle information
  m.slug as muscle_slug,
  mg.slug as muscle_group_slug,
  
  -- Equipment information  
  eq.slug as equipment_slug,
  eq.equipment_type,
  
  -- Body part information
  bp.slug as body_part_slug,
  
  -- Aggregated translations as JSONB
  COALESCE(
    jsonb_object_agg(
      et.language_code, 
      jsonb_build_object(
        'name', et.name,
        'description', et.description
      )
    ) FILTER (WHERE et.name IS NOT NULL),
    '{}'::jsonb
  ) as translations,
  
  -- Muscle names from translations
  COALESCE(mt_en.name, mt_default.name) as muscle_name,
  COALESCE(mgt_en.name, mgt_default.name) as muscle_group_name

FROM public.exercises e

-- Join with exercise translations
LEFT JOIN public.exercises_translations et ON et.exercise_id = e.id
LEFT JOIN public.exercises_translations et_en ON et_en.exercise_id = e.id AND et_en.language_code = 'en'
LEFT JOIN public.exercises_translations et_default ON et_default.exercise_id = e.id AND et_default.language_code = 'en'

-- Join with muscle information
LEFT JOIN public.muscles m ON m.id = e.primary_muscle_id
LEFT JOIN public.muscle_groups mg ON mg.id = m.muscle_group_id

-- Join with muscle translations
LEFT JOIN public.muscles_translations mt_en ON mt_en.muscle_id = m.id AND mt_en.language_code = 'en'
LEFT JOIN public.muscles_translations mt_default ON mt_default.muscle_id = m.id AND mt_default.language_code = 'en'
LEFT JOIN public.muscle_groups_translations mgt_en ON mgt_en.muscle_group_id = mg.id AND mgt_en.language_code = 'en'
LEFT JOIN public.muscle_groups_translations mgt_default ON mgt_default.muscle_group_id = mg.id AND mgt_default.language_code = 'en'

-- Join with equipment
LEFT JOIN public.equipment eq ON eq.id = e.equipment_id

-- Join with body part
LEFT JOIN public.body_parts bp ON bp.id = e.body_part_id

GROUP BY 
  e.id, e.owner_user_id, e.primary_muscle_id, e.image_url, e.equipment_id, 
  e.contraindications, e.complexity_score, e.exercise_skill_level, 
  e.capability_schema, e.movement_pattern, e.thumbnail_url, e.source_url, 
  e.secondary_muscle_group_ids, e.default_grip_ids, e.body_part_id, 
  e.popularity_rank, e.is_public, e.created_at,
  et_en.name, et_default.name,
  m.slug, mg.slug, eq.slug, eq.equipment_type, bp.slug,
  mt_en.name, mt_default.name, mgt_en.name, mgt_default.name;