-- Exercise seeding with correct enum types
-- Uses system UUID, proper CTEs for lookups, and upserts

BEGIN;

-- Temporarily disable RLS for seeding
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercises_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_handles DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_default_grips DISABLE ROW LEVEL SECURITY;

-- 1) Bench Press (Barbell)
WITH params AS (
  SELECT
    'bench-press-barbell'::text         AS ex_slug,
    'chest'::text                       AS body_part_slug,
    'barbell'::text                     AS equipment_slug,
    ARRAY['straight-bar']::text[]       AS handle_slugs,
    ARRAY['overhand-wide','overhand']::text[] AS grip_slugs,
    'Bench Press (Barbell)'::text       AS name_en,
    'Împins cu haltera la bancă'::text  AS name_ro,
    'Barbell flat bench press'::text    AS desc_en,
    'Împins clasic cu haltera'::text    AS desc_ro,
    'horizontal_push'::movement_pattern AS movement_pattern,
    'barbell'::load_type_enum           AS load_type,
    '00000000-0000-0000-0000-000000000000'::uuid AS system_user
),
bp AS (
  SELECT id FROM body_parts b
  JOIN params p ON p.body_part_slug = b.slug
),
eq AS (
  SELECT id FROM equipment e
  JOIN params p ON p.equipment_slug = e.slug
),
handles AS (
  SELECT h.id
  FROM params p
  JOIN handles h ON h.slug = ANY(p.handle_slugs)
),
grips AS (
  SELECT g.id
  FROM params p
  JOIN grips g ON g.slug = ANY(p.grip_slugs)
),
ins_ex AS (
  INSERT INTO exercises (
    slug, owner_user_id, body_part_id, equipment_id,
    movement_pattern, load_type, is_bar_loaded, is_public
  )
  SELECT
    p.ex_slug, p.system_user, bp.id, eq.id,
    p.movement_pattern, p.load_type, true, true
  FROM params p, bp, eq
  ON CONFLICT (slug) DO UPDATE
    SET body_part_id = EXCLUDED.body_part_id,
        equipment_id = EXCLUDED.equipment_id,
        movement_pattern = EXCLUDED.movement_pattern,
        load_type = EXCLUDED.load_type
  RETURNING id
),
up_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'en', p.name_en, p.desc_en
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description
),
up_ro AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'ro', p.name_ro, p.desc_ro
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description
),
ins_handles AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.id, h.id, (ROW_NUMBER() OVER () = 1)
  FROM ins_ex ex, handles h
  ON CONFLICT (exercise_id, handle_id) DO NOTHING
),
ins_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT ex.id, g.id, ROW_NUMBER() OVER (ORDER BY g.id)
  FROM ins_ex ex, grips g
  ON CONFLICT (exercise_id, grip_id) DO NOTHING
)
SELECT 'bench_press_barbell_ok';

-- 2) Overhead Press (Barbell)
WITH params AS (
  SELECT
    'overhead-press-barbell'::text      AS ex_slug,
    'shoulders'::text                   AS body_part_slug,
    'barbell'::text                     AS equipment_slug,
    ARRAY['straight-bar']::text[]       AS handle_slugs,
    ARRAY['overhand']::text[]           AS grip_slugs,
    'Overhead Press (Barbell)'::text    AS name_en,
    'Împins deasupra capului cu haltera'::text AS name_ro,
    'Standing barbell overhead press'::text AS desc_en,
    'Împins vertical cu haltera în picioare'::text AS desc_ro,
    'vertical_push'::movement_pattern   AS movement_pattern,
    'barbell'::load_type_enum           AS load_type,
    '00000000-0000-0000-0000-000000000000'::uuid AS system_user
),
bp AS (
  SELECT id FROM body_parts b
  JOIN params p ON p.body_part_slug = b.slug
),
eq AS (
  SELECT id FROM equipment e
  JOIN params p ON p.equipment_slug = e.slug
),
handles AS (
  SELECT h.id
  FROM params p
  JOIN handles h ON h.slug = ANY(p.handle_slugs)
),
grips AS (
  SELECT g.id
  FROM params p
  JOIN grips g ON g.slug = ANY(p.grip_slugs)
),
ins_ex AS (
  INSERT INTO exercises (
    slug, owner_user_id, body_part_id, equipment_id,
    movement_pattern, load_type, is_bar_loaded, is_public
  )
  SELECT
    p.ex_slug, p.system_user, bp.id, eq.id,
    p.movement_pattern, p.load_type, true, true
  FROM params p, bp, eq
  ON CONFLICT (slug) DO UPDATE
    SET body_part_id = EXCLUDED.body_part_id,
        equipment_id = EXCLUDED.equipment_id,
        movement_pattern = EXCLUDED.movement_pattern,
        load_type = EXCLUDED.load_type
  RETURNING id
),
up_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'en', p.name_en, p.desc_en
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description
),
up_ro AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'ro', p.name_ro, p.desc_ro
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description
),
ins_handles AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.id, h.id, (ROW_NUMBER() OVER () = 1)
  FROM ins_ex ex, handles h
  ON CONFLICT (exercise_id, handle_id) DO NOTHING
),
ins_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT ex.id, g.id, ROW_NUMBER() OVER (ORDER BY g.id)
  FROM ins_ex ex, grips g
  ON CONFLICT (exercise_id, grip_id) DO NOTHING
)
SELECT 'overhead_press_barbell_ok';

-- 3) Squat (Barbell)
WITH params AS (
  SELECT
    'squat-barbell'::text               AS ex_slug,
    'legs'::text                        AS body_part_slug,
    'barbell'::text                     AS equipment_slug,
    ARRAY['straight-bar']::text[]       AS handle_slugs,
    ARRAY['overhand']::text[]           AS grip_slugs,
    'Squat (Barbell)'::text             AS name_en,
    'Genuflexiuni cu haltera'::text     AS name_ro,
    'Back squat with barbell'::text     AS desc_en,
    'Genuflexiuni cu haltera pe spate'::text AS desc_ro,
    'squat'::movement_pattern           AS movement_pattern,
    'barbell'::load_type_enum           AS load_type,
    '00000000-0000-0000-0000-000000000000'::uuid AS system_user
),
bp AS (
  SELECT id FROM body_parts b
  JOIN params p ON p.body_part_slug = b.slug
),
eq AS (
  SELECT id FROM equipment e
  JOIN params p ON p.equipment_slug = e.slug
),
handles AS (
  SELECT h.id
  FROM params p
  JOIN handles h ON h.slug = ANY(p.handle_slugs)
),
grips AS (
  SELECT g.id
  FROM params p
  JOIN grips g ON g.slug = ANY(p.grip_slugs)
),
ins_ex AS (
  INSERT INTO exercises (
    slug, owner_user_id, body_part_id, equipment_id,
    movement_pattern, load_type, is_bar_loaded, is_public
  )
  SELECT
    p.ex_slug, p.system_user, bp.id, eq.id,
    p.movement_pattern, p.load_type, true, true
  FROM params p, bp, eq
  ON CONFLICT (slug) DO UPDATE
    SET body_part_id = EXCLUDED.body_part_id,
        equipment_id = EXCLUDED.equipment_id,
        movement_pattern = EXCLUDED.movement_pattern,
        load_type = EXCLUDED.load_type
  RETURNING id
),
up_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'en', p.name_en, p.desc_en
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description
),
up_ro AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'ro', p.name_ro, p.desc_ro
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description
),
ins_handles AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.id, h.id, (ROW_NUMBER() OVER () = 1)
  FROM ins_ex ex, handles h
  ON CONFLICT (exercise_id, handle_id) DO NOTHING
),
ins_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT ex.id, g.id, ROW_NUMBER() OVER (ORDER BY g.id)
  FROM ins_ex ex, grips g
  ON CONFLICT (exercise_id, grip_id) DO NOTHING
)
SELECT 'squat_barbell_ok';

-- 4) Deadlift (Barbell)
WITH params AS (
  SELECT
    'deadlift-barbell'::text            AS ex_slug,
    'back'::text                        AS body_part_slug,
    'barbell'::text                     AS equipment_slug,
    ARRAY['straight-bar']::text[]       AS handle_slugs,
    ARRAY['overhand','mixed']::text[]   AS grip_slugs,
    'Deadlift (Barbell)'::text          AS name_en,
    'Îndreptări cu haltera'::text       AS name_ro,
    'Conventional barbell deadlift'::text AS desc_en,
    'Îndreptări clasice cu haltera'::text AS desc_ro,
    'hinge'::movement_pattern           AS movement_pattern,
    'barbell'::load_type_enum           AS load_type,
    '00000000-0000-0000-0000-000000000000'::uuid AS system_user
),
bp AS (
  SELECT id FROM body_parts b
  JOIN params p ON p.body_part_slug = b.slug
),
eq AS (
  SELECT id FROM equipment e
  JOIN params p ON p.equipment_slug = e.slug
),
handles AS (
  SELECT h.id
  FROM params p
  JOIN handles h ON h.slug = ANY(p.handle_slugs)
),
grips AS (
  SELECT g.id
  FROM params p
  JOIN grips g ON g.slug = ANY(p.grip_slugs)
),
ins_ex AS (
  INSERT INTO exercises (
    slug, owner_user_id, body_part_id, equipment_id,
    movement_pattern, load_type, is_bar_loaded, is_public
  )
  SELECT
    p.ex_slug, p.system_user, bp.id, eq.id,
    p.movement_pattern, p.load_type, true, true
  FROM params p, bp, eq
  ON CONFLICT (slug) DO UPDATE
    SET body_part_id = EXCLUDED.body_part_id,
        equipment_id = EXCLUDED.equipment_id,
        movement_pattern = EXCLUDED.movement_pattern,
        load_type = EXCLUDED.load_type
  RETURNING id
),
up_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'en', p.name_en, p.desc_en
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description
),
up_ro AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'ro', p.name_ro, p.desc_ro
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description
),
ins_handles AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.id, h.id, (ROW_NUMBER() OVER () = 1)
  FROM ins_ex ex, handles h
  ON CONFLICT (exercise_id, handle_id) DO NOTHING
),
ins_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT ex.id, g.id, ROW_NUMBER() OVER (ORDER BY g.id)
  FROM ins_ex ex, grips g
  ON CONFLICT (exercise_id, grip_id) DO NOTHING
)
SELECT 'deadlift_barbell_ok';

-- 5) Lat Pulldown (Cable Machine)
WITH params AS (
  SELECT
    'lat-pulldown'::text                AS ex_slug,
    'back'::text                        AS body_part_slug,
    'cable-machine'::text               AS equipment_slug,
    ARRAY['lat-pulldown-bar']::text[]   AS handle_slugs,
    ARRAY['overhand-wide','overhand']::text[] AS grip_slugs,
    'Lat Pulldown'::text                AS name_en,
    'Trageri la piept la cablu'::text   AS name_ro,
    'Cable lat pulldown'::text          AS desc_en,
    'Trageri la piept cu cablu'::text   AS desc_ro,
    'vertical_pull'::movement_pattern   AS movement_pattern,
    'stack'::load_type_enum             AS load_type,
    '00000000-0000-0000-0000-000000000000'::uuid AS system_user
),
bp AS (
  SELECT id FROM body_parts b
  JOIN params p ON p.body_part_slug = b.slug
),
eq AS (
  SELECT id FROM equipment e
  JOIN params p ON p.equipment_slug = e.slug
),
handles AS (
  SELECT h.id
  FROM params p
  JOIN handles h ON h.slug = ANY(p.handle_slugs)
),
grips AS (
  SELECT g.id
  FROM params p
  JOIN grips g ON g.slug = ANY(p.grip_slugs)
),
ins_ex AS (
  INSERT INTO exercises (
    slug, owner_user_id, body_part_id, equipment_id,
    movement_pattern, load_type, is_bar_loaded, is_public
  )
  SELECT
    p.ex_slug, p.system_user, bp.id, eq.id,
    p.movement_pattern, p.load_type, false, true
  FROM params p, bp, eq
  ON CONFLICT (slug) DO UPDATE
    SET body_part_id = EXCLUDED.body_part_id,
        equipment_id = EXCLUDED.equipment_id,
        movement_pattern = EXCLUDED.movement_pattern,
        load_type = EXCLUDED.load_type
  RETURNING id
),
up_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'en', p.name_en, p.desc_en
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description
),
up_ro AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'ro', p.name_ro, p.desc_ro
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description
),
ins_handles AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.id, h.id, (ROW_NUMBER() OVER () = 1)
  FROM ins_ex ex, handles h
  ON CONFLICT (exercise_id, handle_id) DO NOTHING
),
ins_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT ex.id, g.id, ROW_NUMBER() OVER (ORDER BY g.id)
  FROM ins_ex ex, grips g
  ON CONFLICT (exercise_id, grip_id) DO NOTHING
)
SELECT 'lat_pulldown_ok';

-- Re-enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_default_grips ENABLE ROW LEVEL SECURITY;

COMMIT;