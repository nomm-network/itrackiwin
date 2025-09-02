-- Create a normalized admin exercises view with proper column names
CREATE OR REPLACE VIEW public.v_admin_exercises AS
SELECT 
  e.id                          AS id,
  e.slug                        AS slug,
  COALESCE(et.name, e.display_name, e.custom_display_name, e.slug) AS name,
  e.popularity_rank             AS popularity_rank,
  e.is_public                   AS is_public,
  e.configured                  AS configured,
  e.owner_user_id               AS owner_user_id,
  eq.slug                       AS equipment_slug,
  COALESCE(eqt.name, eq.slug)   AS equipment_name,
  bp.slug                       AS body_part_slug,
  COALESCE(bpt.name, bp.slug)   AS body_part_name,
  mg.slug                       AS muscle_group_slug,
  COALESCE(mgt.name, mg.slug)   AS muscle_group_name,
  mp.slug                       AS movement_pattern_slug,
  COALESCE(mpt.name, mp.slug)   AS movement_pattern_name,
  e.primary_muscle_id           AS primary_muscle_id,
  e.equipment_id                AS equipment_id,
  e.body_part_id                AS body_part_id,
  e.movement_pattern_id         AS movement_pattern_id,
  e.created_at                  AS created_at,
  e.load_type                   AS load_type
FROM public.exercises e
LEFT JOIN public.exercises_translations et 
  ON et.exercise_id = e.id AND et.language_code = 'en'
LEFT JOIN public.equipment eq        ON eq.id = e.equipment_id
LEFT JOIN public.equipment_translations eqt 
  ON eqt.equipment_id = eq.id AND eqt.language_code = 'en'
LEFT JOIN public.body_parts bp       ON bp.id = e.body_part_id
LEFT JOIN public.body_parts_translations bpt 
  ON bpt.body_part_id = bp.id AND bpt.language_code = 'en'
LEFT JOIN public.muscle_groups mg    ON mg.id = e.primary_muscle_id
LEFT JOIN public.muscle_groups_translations mgt 
  ON mgt.muscle_group_id = mg.id AND mgt.language_code = 'en'
LEFT JOIN public.movement_patterns mp ON mp.id = e.movement_pattern_id
LEFT JOIN public.movement_patterns_translations mpt 
  ON mpt.movement_pattern_id = mp.id AND mpt.language_code = 'en'
ORDER BY e.popularity_rank DESC NULLS LAST;