-- SEED CORE MUSCLES WITH CLEAN NAMES AND TRANSLATIONS
-- Removes overkill muscles and adds 5 core muscles with EN/RO translations

BEGIN;

-- 0) Resolve Core muscle-group IDs (by slug)
WITH core_groups AS (
  SELECT mg.id, mg.slug
  FROM muscle_groups mg
  JOIN body_parts bp ON bp.id = mg.body_part_id
  WHERE bp.slug = 'core'
    AND mg.slug IN ('abs','lower_back','obliques')
),

-- 1) Remove any overkill/old entries if they exist
del AS (
  DELETE FROM muscles m
  USING core_groups cg
  WHERE m.muscle_group_id = cg.id
    AND m.slug IN ('quadratus_lumborum','multifidus')
  RETURNING 1
),

-- 2) Upsert the five final Core muscles (short, clear slugs)
ins AS (
  INSERT INTO muscles (id, muscle_group_id, slug)
  SELECT gen_random_uuid(), (SELECT id FROM core_groups WHERE slug='abs'), 'upper_abs'
  UNION ALL
  SELECT gen_random_uuid(), (SELECT id FROM core_groups WHERE slug='abs'), 'lower_abs'
  UNION ALL
  SELECT gen_random_uuid(), (SELECT id FROM core_groups WHERE slug='abs'), 'transverse_abdominis'
  UNION ALL
  SELECT gen_random_uuid(), (SELECT id FROM core_groups WHERE slug='obliques'), 'obliques'
  UNION ALL
  SELECT gen_random_uuid(), (SELECT id FROM core_groups WHERE slug='lower_back'), 'erector_spinae'
  ON CONFLICT (slug) DO NOTHING
  RETURNING id, slug
)

-- 3) Ensure translations (EN + RO) exist / are updated for each muscle
-- Upper Abs
INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT m.id, 'en', 'Upper Abs',
       'Rectus abdominis (upper fibers). Commonly trained with crunches and incline crunch variations. Stabilizes trunk flexion.'
FROM muscles m WHERE m.slug = 'upper_abs'
ON CONFLICT (muscle_id, language_code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT m.id, 'ro', 'Abdomen sus',
       'Rectus abdominis – porțiunea superioară. Lucrat des cu abdomene clasice și ridicări pe plan înclinat. Stabilizează flexia trunchiului.'
FROM muscles m WHERE m.slug = 'upper_abs'
ON CONFLICT (muscle_id, language_code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Lower Abs
INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT m.id, 'en', 'Lower Abs',
       'Rectus abdominis (lower fibers). Hit with knee/leg raises and reverse crunches. Assists pelvic tilt control.'
FROM muscles m WHERE m.slug = 'lower_abs'
ON CONFLICT (muscle_id, language_code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT m.id, 'ro', 'Abdomen jos',
       'Rectus abdominis – porțiunea inferioară. Activat în ridicări de genunchi/picioare și reverse crunch. Ajută controlul înclinării bazinului.'
FROM muscles m WHERE m.slug = 'lower_abs'
ON CONFLICT (muscle_id, language_code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- TVA (Transverse Abdominis) under Abs
INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT m.id, 'en', 'TVA (Deep core)',
       'Transverse abdominis. Deep core stabilizer; braces spine and abdomen. Trained via bracing, vacuums, and anti-extension work.'
FROM muscles m WHERE m.slug = 'transverse_abdominis'
ON CONFLICT (muscle_id, language_code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT m.id, 'ro', 'TVA (Core profund)',
       'Transversul abdomenului. Stabilizator profund al trunchiului; susține bracing-ul și stabilitatea coloanei. Lucrat cu bracing, vacuums, anti-extensie.'
FROM muscles m WHERE m.slug = 'transverse_abdominis'
ON CONFLICT (muscle_id, language_code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Obliques (kept unified for simplicity)
INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT m.id, 'en', 'Obliques',
       'Oblique muscles (internal & external). Rotation and anti-rotation; trained with side planks, woodchops, cable rotations.'
FROM muscles m WHERE m.slug = 'obliques'
ON CONFLICT (muscle_id, language_code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT m.id, 'ro', 'Oblici',
       'Mușchii oblici (interni & externi). Responsabili de rotație și anti-rotație; lucrați cu plank lateral, woodchops, rotații la cabluri.'
FROM muscles m WHERE m.slug = 'obliques'
ON CONFLICT (muscle_id, language_code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Lower Back (Erectors)
INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT m.id, 'en', 'Erectors (Lower back)',
       'Erector spinae group. Spinal extension and posture; trained with back extensions, RDLs, and hip hinges.'
FROM muscles m WHERE m.slug = 'erector_spinae'
ON CONFLICT (muscle_id, language_code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO muscles_translations (muscle_id, language_code, name, description)
SELECT m.id, 'ro', 'Erectori (Lombari)',
       'Grupul erectorilor spinali. Extensia coloanei și postură; lucrați cu extensii lombare, RDL și mișcări de tip hip hinge.'
FROM muscles m WHERE m.slug = 'erector_spinae'
ON CONFLICT (muscle_id, language_code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

COMMIT;