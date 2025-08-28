BEGIN;

-- ── 1) Params (EDIT THESE)
WITH params AS (
  SELECT
    'barbell-bent-over-row'::text        AS ex_slug,          -- exercise slug (unique)
    'en'::text                           AS lang1,
    'ro'::text                           AS lang2,
    'Barbell Bent-Over Row'::text        AS name_en,
    'Ramat aplecat cu bară'::text        AS name_ro,
    'Classic back thickness builder. Keywords: mid-back, lats, rhomboids.'::text AS desc_en,
    'Constructor clasic de spate gros. Cuvinte cheie: mijloc spate, lats, romboizi.'::text AS desc_ro,

    -- Core settings
    'hinge'::movement_pattern            AS movement_pattern, -- e.g. push|pull|squat|hinge|carry|unilateral|rotation|anti_extension|anti_lateral|anti_rotation
    'dual_load'::load_type               AS load_type,        -- none|single_load|dual_load|stack

    -- Link by slug (EDIT to your slugs)
    'barbell'::text                      AS equipment_slug,   -- from equipment.slug
    'lats'::text                         AS primary_muscle_slug, -- from muscles.slug

    -- Secondary muscles (slugs array → we'll resolve to IDs)
    ARRAY['rhomboids','traps']::text[]   AS secondary_muscle_slugs,

    -- Default handle & grips (slugs)
    'straight-bar'::text                 AS default_handle_slug, -- from handles.slug
    ARRAY['overhand','underhand']::text[] AS default_grip_slugs   -- from grips.slug
),
-- ── 2) Resolve FKs
lookups AS (
  SELECT
    p.*,
    (SELECT id FROM equipment        e WHERE e.slug = p.equipment_slug)        AS equipment_id,
    (SELECT id FROM muscles          m WHERE m.slug = p.primary_muscle_slug)   AS primary_muscle_id,
    (SELECT id FROM handles          h WHERE h.slug = p.default_handle_slug)   AS default_handle_id,
    (SELECT array_agg(g.id ORDER BY g.slug)
       FROM grips g
      WHERE g.slug = ANY(p.default_grip_slugs))                                AS default_grip_ids,
    (SELECT array_agg(m2.id ORDER BY m2.slug)
       FROM muscles m2
      WHERE m2.slug = ANY(p.secondary_muscle_slugs))                           AS secondary_muscle_ids
  FROM params p
),
-- ── 3) Insert/Upsert exercise (owner_user_id = NULL for system)
upsert_exercise AS (
  INSERT INTO exercises (
    slug, owner_user_id, equipment_id, movement_pattern, load_type,
    primary_muscle_id, secondary_muscle_group_ids
  )
  SELECT
    l.ex_slug,
    NULL,                                -- system exercise
    l.equipment_id,
    l.movement_pattern,
    l.load_type,
    l.primary_muscle_id,
    l.secondary_muscle_ids
  FROM lookups l
  ON CONFLICT (slug) DO UPDATE
    SET equipment_id                = EXCLUDED.equipment_id,
        movement_pattern            = EXCLUDED.movement_pattern,
        load_type                   = EXCLUDED.load_type,
        primary_muscle_id           = EXCLUDED.primary_muscle_id,
        secondary_muscle_group_ids  = EXCLUDED.secondary_muscle_group_ids
  RETURNING id, slug
),
ex AS (
  SELECT id AS exercise_id FROM upsert_exercise
),
-- ── 4) Translations (idempotent)
upsert_tr_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.exercise_id, l.lang1, l.name_en, l.desc_en
  FROM ex JOIN lookups l ON TRUE
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description
),
upsert_tr_ro AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.exercise_id, l.lang2, l.name_ro, l.desc_ro
  FROM ex JOIN lookups l ON TRUE
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description
),
-- ── 5) Default handle (idempotent)
ins_handle AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.exercise_id, l.default_handle_id, TRUE
  FROM ex JOIN lookups l ON TRUE
  ON CONFLICT DO NOTHING
),
-- ── 6) Default grips (idempotent; order_index starts at 1)
del_old_default_grips AS (
  DELETE FROM exercise_default_grips
  USING ex
  WHERE exercise_default_grips.exercise_id = ex.exercise_id
  RETURNING 1
),
ins_default_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT
    ex.exercise_id,
    gid,
    ROW_NUMBER() OVER (ORDER BY idx)
  FROM (
    SELECT ex.exercise_id, unnest(l.default_grip_ids) WITH ORDINALITY AS t(gid, idx)
    FROM ex JOIN lookups l ON TRUE
  ) s
  ON CONFLICT DO NOTHING
)
SELECT 'Exercise created successfully' as result;

COMMIT;