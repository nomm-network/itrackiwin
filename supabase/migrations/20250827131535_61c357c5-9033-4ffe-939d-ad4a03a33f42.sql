-- =====================================================
-- WORKOUT CATALOG CLEANUP: SEED CORE EXERCISES + ADMIN VIEW (Final Steps)
-- CORE exercises (4 exercises) + Admin Display View (Step 8)
-- =====================================================

-- =====================================================
-- CORE EXERCISES (4 exercises)
-- =====================================================

-- 1. Plank
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'plank', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='core' AND m.slug='abs' AND eq.slug='bodyweight'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Plank','Static plank hold for core stability'),
  ('ro','Plank','Menținere statică în poziția plank pentru stabilitatea core-ului')
) v(lang,name,description);

-- 2. Russian Twists
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'russian-twists', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='core' AND m.slug='abs' AND eq.slug='bodyweight'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Russian Twists','Rotational core exercise for obliques'),
  ('ro','Twisturi rusești','Exercițiu rotațional pentru oblici')
) v(lang,name,description);

-- 3. Cable Crunches
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'cable-crunches', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='core' AND m.slug='abs' AND eq.slug='cable-machine'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Cable Crunches','Cable crunches for weighted ab training'),
  ('ro','Abdomene la cablu','Abdomene la cablu pentru antrenament cu greutăți')
) v(lang,name,description);

-- 4. Hanging Leg Raises
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'hanging-leg-raises', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='core' AND m.slug='abs' AND eq.slug='pull-up-bar'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Hanging Leg Raises','Hanging leg raises for lower abs'),
  ('ro','Ridicări de picioare în atârnare','Ridicări de picioare în atârnare pentru abdomenul inferior')
) v(lang,name,description);

-- =====================================================
-- STEP 8: Admin Auditing View for Exercise Display
-- =====================================================

CREATE OR REPLACE VIEW public.v_exercise_display AS
SELECT
  e.id,
  e.slug,
  bpt.name  AS body_part_en,
  mt.name   AS primary_muscle_en,
  eqt.name  AS equipment_en,
  et.name   AS exercise_name_en,
  et.description AS exercise_description_en,
  array_agg(DISTINCT ht.name) FILTER (WHERE ht.name IS NOT NULL) AS handles_en,
  array_agg(DISTINCT gt.name) FILTER (WHERE gt.name IS NOT NULL) AS grips_en
FROM exercises e
LEFT JOIN body_parts_translations bpt ON bpt.body_part_id=e.body_part_id AND bpt.language_code='en'
LEFT JOIN muscles_translations mt ON mt.muscle_id=e.primary_muscle_id AND mt.language_code='en'
LEFT JOIN equipment eq ON eq.id=e.equipment_id
LEFT JOIN equipment_translations eqt ON eqt.equipment_id=eq.id AND eqt.language_code='en'
LEFT JOIN exercises_translations et ON et.exercise_id=e.id AND et.language_code='en'
LEFT JOIN exercise_handles eh ON eh.exercise_id=e.id
LEFT JOIN handle_translations ht ON ht.handle_id=eh.handle_id AND ht.language_code='en'
LEFT JOIN exercise_grips eg ON eg.exercise_id=e.id
LEFT JOIN grips_translations gt ON gt.grip_id=eg.grip_id AND gt.language_code='en'
GROUP BY e.id, e.slug, bpt.name, mt.name, eqt.name, et.name, et.description
ORDER BY e.slug;