-- =====================================================
-- WORKOUT CATALOG CLEANUP: SEED SHOULDERS & ARMS EXERCISES (Step 4.1 continued)
-- SHOULDERS (8 exercises) + ARMS (8 exercises)
-- =====================================================

-- =====================================================
-- SHOULDERS EXERCISES (8 exercises)
-- =====================================================

-- 1. Seated DB Shoulder Press
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'seated-dumbbell-shoulder-press', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='shoulders' AND m.slug='deltoids' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Seated DB Shoulder Press','Seated overhead dumbbell press for shoulder development'),
  ('ro','Împins deasupra capului cu gantere','Împins gantere pentru dezvoltarea umerilor')
) v(lang,name,description);

-- 2. Lateral Raises
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'lateral-raises', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='shoulders' AND m.slug='deltoids' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Lateral Raises','Side lateral raises for shoulder width'),
  ('ro','Ridicări laterale','Ridicări laterale pentru lățimea umerilor')
) v(lang,name,description);

-- 3. Rear Delt Flyes
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'rear-delt-flyes', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='shoulders' AND m.slug='deltoids' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Rear Delt Flyes','Rear deltoid flyes for posterior shoulder'),
  ('ro','Deschideri pentru deltoizi posteriori','Deschideri pentru partea posterioară a umerilor')
) v(lang,name,description);

-- 4. Military Press
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'military-press', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='shoulders' AND m.slug='deltoids' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Military Press','Standing barbell overhead press'),
  ('ro','Presă militară','Presă cu bară deasupra capului în picioare')
) v(lang,name,description);

-- 5. Arnold Press
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'arnold-press', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='shoulders' AND m.slug='deltoids' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Arnold Press','Rotating dumbbell press named after Arnold Schwarzenegger'),
  ('ro','Presă Arnold','Presă cu gantere cu rotație, numită după Arnold Schwarzenegger')
) v(lang,name,description);

-- 6. Cable Lateral Raises
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'cable-lateral-raises', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='shoulders' AND m.slug='deltoids' AND eq.slug='cable-machine'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Cable Lateral Raises','Cable lateral raises for constant tension'),
  ('ro','Ridicări laterale la cablu','Ridicări laterale la cablu pentru tensiune constantă')
) v(lang,name,description);

-- 7. Upright Rows
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'upright-rows', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='shoulders' AND m.slug='deltoids' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Upright Rows','Barbell upright rows for shoulders and traps'),
  ('ro','Ramat vertical','Ramat vertical cu bară pentru umeri și trapez')
) v(lang,name,description);

-- 8. Front Raises
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'front-raises', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='shoulders' AND m.slug='deltoids' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Front Raises','Front dumbbell raises for anterior deltoids'),
  ('ro','Ridicări frontale','Ridicări frontale cu gantere pentru deltoizi anteriori')
) v(lang,name,description);

-- =====================================================
-- ARMS EXERCISES (8 exercises)
-- =====================================================

-- 1. Cable Triceps Pushdown
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'cable-triceps-pushdown', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='arms' AND m.slug='triceps' AND eq.slug='cable-machine'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Cable Triceps Pushdown','Pushdown with straight bar or rope attachment'),
  ('ro','Împins triceps la scripete','Extensii triceps la cablu cu bară sau frânghie')
) v(lang,name,description);

-- 2. Bicep Curls
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'bicep-curls', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='arms' AND m.slug='biceps' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Bicep Curls','Standing dumbbell bicep curls'),
  ('ro','Flexii de biceps','Flexii de biceps cu gantere în picioare')
) v(lang,name,description);

-- 3. Hammer Curls
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'hammer-curls', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='arms' AND m.slug='biceps' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Hammer Curls','Neutral grip dumbbell curls for biceps and forearms'),
  ('ro','Flexii ciocănel','Flexii cu gantere în priză neutră pentru biceps și antebrațe')
) v(lang,name,description);

-- 4. Tricep Dips
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'tricep-dips', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='arms' AND m.slug='triceps' AND eq.slug='bodyweight'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Tricep Dips','Bodyweight tricep dips on parallel bars or bench'),
  ('ro','Paralele pentru triceps','Paralele cu greutatea corpului pentru triceps')
) v(lang,name,description);

-- 5. Overhead Tricep Extension
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'overhead-tricep-extension', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='arms' AND m.slug='triceps' AND eq.slug='dumbbells'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Overhead Tricep Extension','Overhead dumbbell tricep extension'),
  ('ro','Extensii triceps deasupra capului','Extensii triceps cu ganteră deasupra capului')
) v(lang,name,description);

-- 6. Preacher Curls
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'preacher-curls', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='arms' AND m.slug='biceps' AND eq.slug='preacher-bench'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Preacher Curls','Isolated bicep curls on preacher bench'),
  ('ro','Flexii pe bancă Scott','Flexii de biceps izolate pe bancă Scott')
) v(lang,name,description);

-- 7. Close Grip Bench Press
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'close-grip-bench-press', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='arms' AND m.slug='triceps' AND eq.slug='barbell'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Close Grip Bench Press','Narrow grip bench press for triceps emphasis'),
  ('ro','Presă cu priză îngustă','Presă la bancă cu priză îngustă pentru accent pe triceps')
) v(lang,name,description);

-- 8. Cable Bicep Curls
WITH x AS (
  INSERT INTO exercises (slug, body_part_id, primary_muscle_id, equipment_id, owner_user_id)
  SELECT 'cable-bicep-curls', bp.id, m.id, eq.id, '00000000-0000-0000-0000-000000000000'::uuid
  FROM body_parts bp
  CROSS JOIN muscles m
  CROSS JOIN equipment eq
  WHERE bp.slug='arms' AND m.slug='biceps' AND eq.slug='cable-machine'
  RETURNING id
)
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT x.id, v.lang, v.name, v.description
FROM x, (VALUES
  ('en','Cable Bicep Curls','Cable bicep curls for constant tension'),
  ('ro','Flexii biceps la cablu','Flexii biceps la cablu pentru tensiune constantă')
) v(lang,name,description);