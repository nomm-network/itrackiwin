-- Drop existing view and recreate with proper structure
DROP VIEW IF EXISTS v_exercises_with_translations;

CREATE VIEW v_exercises_with_translations AS
SELECT 
  e.*,
  bp.slug as body_part_slug,
  eq.slug as equipment_slug,
  COALESCE(
    json_agg(
      json_build_object(
        'id', et.id,
        'language_code', et.language_code,
        'name', et.name,
        'description', et.description
      )
    ) FILTER (WHERE et.id IS NOT NULL),
    '[]'::json
  ) as translations
FROM exercises e
LEFT JOIN exercises_translations et ON e.id = et.exercise_id
LEFT JOIN body_parts bp ON e.body_part_id = bp.id
LEFT JOIN equipment eq ON e.equipment_id = eq.id
GROUP BY e.id, e.slug, e.display_name, e.custom_display_name, e.name_locale, e.tags, e.owner_user_id, e.is_public, e.created_at, e.popularity_rank, e.body_part_id, e.primary_muscle_id, e.equipment_id, e.secondary_muscle_group_ids, e.default_grip_ids, e.capability_schema, e.movement_pattern_id, e.exercise_skill_level, e.complexity_score, e.contraindications, e.default_bar_weight, e.default_handle_ids, e.is_bar_loaded, e.load_type, e.default_bar_type_id, e.requires_handle, e.allows_grips, e.is_unilateral, e.attribute_values_json, e.movement_id, e.equipment_ref_id, e.name_version, e.display_name_tsv, e.image_url, e.thumbnail_url, e.source_url, e.loading_hint, bp.slug, eq.slug;