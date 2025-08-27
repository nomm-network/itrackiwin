-- =====================================================
-- WORKOUT CATALOG CLEANUP: SEED BACK EXERCISES (Step 4.1 continued)
-- BACK exercises (10 exercises)
-- =====================================================

-- =====================================================
-- BACK EXERCISES (10 exercises)
-- =====================================================

-- 1. Seated Cable Row
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'seated-cable-row', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='back' AND m.slug='lats' AND eq.slug='cable-machine'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Seated Cable Row','Horizontal cable row for lat development'),
  ('ro','Ramat la cablu din șezut','Ramat orizontal la cablu pentru dezvoltarea latilor')
) v(lang,name,description);

-- 2. Lat Pulldown
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'lat-pulldown', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='back' AND m.slug='lats' AND eq.slug='lat-pulldown'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Lat Pulldown','Cable lat pulldown for back width'),
  ('ro','Helcometru pentru dorsali','Tracțiuni la helcometru pentru lățimea spatelui')
) v(lang,name,description);

-- 3. Barbell Rows
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'barbell-rows', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='back' AND m.slug='lats' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Barbell Rows','Bent-over barbell rows for back thickness'),
  ('ro','Ramat cu haltera','Ramat aplecați cu bară pentru grosimea spatelui')
) v(lang,name,description);

-- 4. T-Bar Row
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 't-bar-row', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='back' AND m.slug='lats' AND eq.slug='t-bar-row'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','T-Bar Row','T-bar rows for mid-back development'),
  ('ro','Ramat la T-bar','Ramat la T-bar pentru dezvoltarea mijlocului spatelui')
) v(lang,name,description);

-- 5. Cable High Row
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'cable-high-row', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='back' AND m.slug='lats' AND eq.slug='cable-machine'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Cable High Row','High cable row for upper back'),
  ('ro','Ramat înalt la cablu','Ramat înalt la cablu pentru partea superioară a spatelui')
) v(lang,name,description);

-- 6. Wide Grip Pulldown
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'wide-grip-pulldown', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='back' AND m.slug='lats' AND eq.slug='lat-pulldown'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Wide Grip Pulldown','Wide grip lat pulldown for back width'),
  ('ro','Tracțiuni cu priză largă','Tracțiuni la helcometru cu priză largă pentru lățime')
) v(lang,name,description);

-- 7. Reverse Flyes
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'reverse-flyes', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='back' AND m.slug='rear-delts' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Reverse Flyes','Reverse flyes for rear delts and upper back'),
  ('ro','Deschideri posterioare','Deschideri posterioare pentru deltoizi și partea superioară a spatelui')
) v(lang,name,description);

-- 8. Face Pulls
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'face-pulls', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='back' AND m.slug='rear-delts' AND eq.slug='cable-machine'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Face Pulls','Cable face pulls for rear delts and posture'),
  ('ro','Tracțiuni spre față','Tracțiuni la cablu spre față pentru deltoizi posteriori și postură')
) v(lang,name,description);

-- 9. Shrugs
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'shrugs', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='back' AND m.slug='traps' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Shrugs','Shoulder shrugs for trap development'),
  ('ro','Ridicări de umeri','Ridicări de umeri pentru dezvoltarea trapezului')
) v(lang,name,description);

-- 10. Deadlift
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'deadlift', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='back' AND m.slug='lats' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Deadlift','Conventional deadlift for full posterior chain'),
  ('ro','Îndreptări','Îndreptări convenționale pentru întreaga catenă posterioară')
) v(lang,name,description);