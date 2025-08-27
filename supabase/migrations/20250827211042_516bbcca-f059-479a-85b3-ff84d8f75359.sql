-- SEED BODY PARTS + MUSCLE GROUPS WITH TRANSLATIONS
-- This seeds the core structure with EN/RO translations

-- 1) BODY PARTS (idempotent via slug)
INSERT INTO public.body_parts (slug)
VALUES ('arms'), ('back'), ('chest'), ('core'), ('legs')
ON CONFLICT (slug) DO NOTHING;

-- 2) BODY PARTS TRANSLATIONS (EN & RO)
INSERT INTO public.body_parts_translations (body_part_id, language_code, name)
SELECT bp.id, t.lang, t.name
FROM (VALUES
  ('arms','en','Arms'),
  ('arms','ro','Brațe'),
  ('back','en','Back'),
  ('back','ro','Spate'),
  ('chest','en','Chest'),
  ('chest','ro','Piept'),
  ('core','en','Core'),
  ('core','ro','Trunchi'),
  ('legs','en','Legs'),
  ('legs','ro','Picioare')
) AS t(slug, lang, name)
JOIN public.body_parts bp ON bp.slug = t.slug
ON CONFLICT (body_part_id, language_code)
DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

-- 3) MUSCLE GROUPS (your exact groupings)
WITH groups(part_slug, group_slug) AS (
  VALUES
    -- Arms
    ('arms','shoulders'), ('arms','biceps'), ('arms','triceps'), ('arms','forearms'),
    -- Back (per your spec: Back / Traps / Neck)
    ('back','back'), ('back','traps'), ('back','neck'),
    -- Chest
    ('chest','chest'),
    -- Core
    ('core','abs'), ('core','obliques'), ('core','lower_back'),
    -- Legs
    ('legs','hamstrings'), ('legs','quads'), ('legs','calves'), ('legs','glutes')
)
INSERT INTO public.muscle_groups (body_part_id, slug)
SELECT bp.id, g.group_slug
FROM groups g
JOIN public.body_parts bp ON bp.slug = g.part_slug
LEFT JOIN public.muscle_groups mg
  ON mg.body_part_id = bp.id AND mg.slug = g.group_slug
WHERE mg.id IS NULL;

-- 4) MUSCLE GROUP TRANSLATIONS (EN & RO)
INSERT INTO public.muscle_groups_translations (muscle_group_id, language_code, name)
SELECT mg.id, t.lang, t.name
FROM (
  VALUES
    -- Arms
    ('arms','shoulders','en','Shoulders'),
    ('arms','shoulders','ro','Umeri'),
    ('arms','biceps','en','Biceps'),
    ('arms','biceps','ro','Bicepși'),
    ('arms','triceps','en','Triceps'),
    ('arms','triceps','ro','Tricepși'),
    ('arms','forearms','en','Forearms'),
    ('arms','forearms','ro','Antebrațe'),
    -- Back
    ('back','back','en','Back'),
    ('back','back','ro','Spate'),
    ('back','traps','en','Traps'),
    ('back','traps','ro','Trapez'),
    ('back','neck','en','Neck'),
    ('back','neck','ro','Gât'),
    -- Chest
    ('chest','chest','en','Chest'),
    ('chest','chest','ro','Piept'),
    -- Core
    ('core','abs','en','Abs'),
    ('core','abs','ro','Abdomen'),
    ('core','obliques','en','Obliques'),
    ('core','obliques','ro','Oblici'),
    ('core','lower_back','en','Lower Back'),
    ('core','lower_back','ro','Lombari'),
    -- Legs
    ('legs','hamstrings','en','Hamstrings'),
    ('legs','hamstrings','ro','Biceps femural'),
    ('legs','quads','en','Quads'),
    ('legs','quads','ro','Cvadricepși'),
    ('legs','calves','en','Calves'),
    ('legs','calves','ro','Gambe'),
    ('legs','glutes','en','Glutes'),
    ('legs','glutes','ro','Fesieri')
) AS t(part_slug, group_slug, lang, name)
JOIN public.body_parts bp ON bp.slug = t.part_slug
JOIN public.muscle_groups mg ON mg.body_part_id = bp.id AND mg.slug = t.group_slug
ON CONFLICT (muscle_group_id, language_code)
DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

-- Verify the seeding
SELECT 
  'body_parts' as table_name, COUNT(*) as row_count FROM body_parts
UNION ALL
SELECT 'body_parts_translations', COUNT(*) FROM body_parts_translations
UNION ALL  
SELECT 'muscle_groups', COUNT(*) FROM muscle_groups
UNION ALL
SELECT 'muscle_groups_translations', COUNT(*) FROM muscle_groups_translations;