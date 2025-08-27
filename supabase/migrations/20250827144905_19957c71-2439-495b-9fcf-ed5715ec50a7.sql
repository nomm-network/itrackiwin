-- Exercise seeding using null owner_user_id for system exercises
-- Temporarily makes owner_user_id nullable for system exercises

BEGIN;

-- Make owner_user_id nullable temporarily for system exercises
ALTER TABLE exercises ALTER COLUMN owner_user_id DROP NOT NULL;

-- Temporarily disable RLS for seeding
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercises_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_handles DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_default_grips DISABLE ROW LEVEL SECURITY;

-- Bench Press (Barbell)
WITH params AS (
  SELECT
    'bench-press-barbell'::text AS ex_slug,
    'chest'::text AS body_part_slug,
    'barbell'::text AS equipment_slug,
    'Bench Press (Barbell)'::text AS name_en,
    'Barbell flat bench press'::text AS desc_en,
    'horizontal_push'::movement_pattern AS movement_pattern,
    'barbell'::load_type_enum AS load_type
),
bp AS (SELECT id FROM body_parts WHERE slug = 'chest'),
eq AS (SELECT id FROM equipment WHERE slug = 'barbell'),
handles AS (SELECT id FROM handles WHERE slug = 'straight-bar'),
grips AS (SELECT id FROM grips WHERE slug IN ('overhand-wide', 'overhand')),
ins_ex AS (
  INSERT INTO exercises (
    slug, owner_user_id, body_part_id, equipment_id,
    movement_pattern, load_type, is_bar_loaded, is_public
  )
  SELECT p.ex_slug, NULL, bp.id, eq.id, p.movement_pattern, p.load_type, true, true
  FROM params p, bp, eq
  ON CONFLICT (slug) DO UPDATE SET
    body_part_id = EXCLUDED.body_part_id,
    equipment_id = EXCLUDED.equipment_id,
    movement_pattern = EXCLUDED.movement_pattern,
    load_type = EXCLUDED.load_type
  RETURNING id
),
up_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'en', p.name_en, p.desc_en
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description
),
ins_handles AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.id, h.id, true FROM ins_ex ex, handles h
  ON CONFLICT (exercise_id, handle_id) DO NOTHING
),
ins_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT ex.id, g.id, ROW_NUMBER() OVER () FROM ins_ex ex, grips g
  ON CONFLICT (exercise_id, grip_id) DO NOTHING
)
SELECT 'bench_press_ok';

-- Squat (Barbell)
WITH params AS (
  SELECT
    'squat-barbell'::text AS ex_slug,
    'legs'::text AS body_part_slug,
    'barbell'::text AS equipment_slug,
    'Squat (Barbell)'::text AS name_en,
    'Back squat with barbell'::text AS desc_en,
    'squat'::movement_pattern AS movement_pattern,
    'barbell'::load_type_enum AS load_type
),
bp AS (SELECT id FROM body_parts WHERE slug = 'legs'),
eq AS (SELECT id FROM equipment WHERE slug = 'barbell'),
handles AS (SELECT id FROM handles WHERE slug = 'straight-bar'),
grips AS (SELECT id FROM grips WHERE slug = 'overhand'),
ins_ex AS (
  INSERT INTO exercises (
    slug, owner_user_id, body_part_id, equipment_id,
    movement_pattern, load_type, is_bar_loaded, is_public
  )
  SELECT p.ex_slug, NULL, bp.id, eq.id, p.movement_pattern, p.load_type, true, true
  FROM params p, bp, eq
  ON CONFLICT (slug) DO UPDATE SET
    body_part_id = EXCLUDED.body_part_id,
    equipment_id = EXCLUDED.equipment_id,
    movement_pattern = EXCLUDED.movement_pattern,
    load_type = EXCLUDED.load_type
  RETURNING id
),
up_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'en', p.name_en, p.desc_en
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description
),
ins_handles AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.id, h.id, true FROM ins_ex ex, handles h
  ON CONFLICT (exercise_id, handle_id) DO NOTHING
),
ins_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT ex.id, g.id, 1 FROM ins_ex ex, grips g
  ON CONFLICT (exercise_id, grip_id) DO NOTHING
)
SELECT 'squat_ok';

-- Deadlift (Barbell)
WITH params AS (
  SELECT
    'deadlift-barbell'::text AS ex_slug,
    'back'::text AS body_part_slug,
    'barbell'::text AS equipment_slug,
    'Deadlift (Barbell)'::text AS name_en,
    'Conventional barbell deadlift'::text AS desc_en,
    'hinge'::movement_pattern AS movement_pattern,
    'barbell'::load_type_enum AS load_type
),
bp AS (SELECT id FROM body_parts WHERE slug = 'back'),
eq AS (SELECT id FROM equipment WHERE slug = 'barbell'),
handles AS (SELECT id FROM handles WHERE slug = 'straight-bar'),
grips AS (SELECT id FROM grips WHERE slug IN ('overhand', 'mixed')),
ins_ex AS (
  INSERT INTO exercises (
    slug, owner_user_id, body_part_id, equipment_id,
    movement_pattern, load_type, is_bar_loaded, is_public
  )
  SELECT p.ex_slug, NULL, bp.id, eq.id, p.movement_pattern, p.load_type, true, true
  FROM params p, bp, eq
  ON CONFLICT (slug) DO UPDATE SET
    body_part_id = EXCLUDED.body_part_id,
    equipment_id = EXCLUDED.equipment_id,
    movement_pattern = EXCLUDED.movement_pattern,
    load_type = EXCLUDED.load_type
  RETURNING id
),
up_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'en', p.name_en, p.desc_en
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description
),
ins_handles AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.id, h.id, true FROM ins_ex ex, handles h
  ON CONFLICT (exercise_id, handle_id) DO NOTHING
),
ins_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT ex.id, g.id, ROW_NUMBER() OVER () FROM ins_ex ex, grips g
  ON CONFLICT (exercise_id, grip_id) DO NOTHING
)
SELECT 'deadlift_ok';

-- Overhead Press (Barbell)
WITH params AS (
  SELECT
    'overhead-press-barbell'::text AS ex_slug,
    'shoulders'::text AS body_part_slug,
    'barbell'::text AS equipment_slug,
    'Overhead Press (Barbell)'::text AS name_en,
    'Standing barbell overhead press'::text AS desc_en,
    'vertical_push'::movement_pattern AS movement_pattern,
    'barbell'::load_type_enum AS load_type
),
bp AS (SELECT id FROM body_parts WHERE slug = 'shoulders'),
eq AS (SELECT id FROM equipment WHERE slug = 'barbell'),
handles AS (SELECT id FROM handles WHERE slug = 'straight-bar'),
grips AS (SELECT id FROM grips WHERE slug = 'overhand'),
ins_ex AS (
  INSERT INTO exercises (
    slug, owner_user_id, body_part_id, equipment_id,
    movement_pattern, load_type, is_bar_loaded, is_public
  )
  SELECT p.ex_slug, NULL, bp.id, eq.id, p.movement_pattern, p.load_type, true, true
  FROM params p, bp, eq
  ON CONFLICT (slug) DO UPDATE SET
    body_part_id = EXCLUDED.body_part_id,
    equipment_id = EXCLUDED.equipment_id,
    movement_pattern = EXCLUDED.movement_pattern,
    load_type = EXCLUDED.load_type
  RETURNING id
),
up_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'en', p.name_en, p.desc_en
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description
),
ins_handles AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.id, h.id, true FROM ins_ex ex, handles h
  ON CONFLICT (exercise_id, handle_id) DO NOTHING
),
ins_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT ex.id, g.id, 1 FROM ins_ex ex, grips g
  ON CONFLICT (exercise_id, grip_id) DO NOTHING
)
SELECT 'overhead_press_ok';

-- Lat Pulldown (Cable Machine)
WITH params AS (
  SELECT
    'lat-pulldown'::text AS ex_slug,
    'back'::text AS body_part_slug,
    'cable-machine'::text AS equipment_slug,
    'Lat Pulldown'::text AS name_en,
    'Cable lat pulldown'::text AS desc_en,
    'vertical_pull'::movement_pattern AS movement_pattern,
    'stack'::load_type_enum AS load_type
),
bp AS (SELECT id FROM body_parts WHERE slug = 'back'),
eq AS (SELECT id FROM equipment WHERE slug = 'cable-machine'),
handles AS (SELECT id FROM handles WHERE slug = 'lat-pulldown-bar'),
grips AS (SELECT id FROM grips WHERE slug IN ('overhand-wide', 'overhand')),
ins_ex AS (
  INSERT INTO exercises (
    slug, owner_user_id, body_part_id, equipment_id,
    movement_pattern, load_type, is_bar_loaded, is_public
  )
  SELECT p.ex_slug, NULL, bp.id, eq.id, p.movement_pattern, p.load_type, false, true
  FROM params p, bp, eq
  ON CONFLICT (slug) DO UPDATE SET
    body_part_id = EXCLUDED.body_part_id,
    equipment_id = EXCLUDED.equipment_id,
    movement_pattern = EXCLUDED.movement_pattern,
    load_type = EXCLUDED.load_type
  RETURNING id
),
up_en AS (
  INSERT INTO exercises_translations (exercise_id, language_code, name, description)
  SELECT ex.id, 'en', p.name_en, p.desc_en
  FROM ins_ex ex, params p
  ON CONFLICT (exercise_id, language_code) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description
),
ins_handles AS (
  INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
  SELECT ex.id, h.id, true FROM ins_ex ex, handles h
  ON CONFLICT (exercise_id, handle_id) DO NOTHING
),
ins_grips AS (
  INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
  SELECT ex.id, g.id, ROW_NUMBER() OVER () FROM ins_ex ex, grips g
  ON CONFLICT (exercise_id, grip_id) DO NOTHING
)
SELECT 'lat_pulldown_ok';

-- Re-enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_default_grips ENABLE ROW LEVEL SECURITY;

COMMIT;