-- ADAPTED EXERCISE SEED SCRIPT
-- Matches actual database schema structure

BEGIN;

-- 1) Resolve lookups once
WITH bp AS (SELECT id, slug FROM public.body_parts),
     eq AS (SELECT id, slug FROM public.equipment),
     mu AS (SELECT id, slug FROM public.muscles),
     hg AS (SELECT id, slug FROM public.handles),
     gr AS (SELECT id, slug FROM public.grips),
     mg AS (SELECT id, slug FROM public.muscle_groups),

-- 2) Define all exercises with corrected movement patterns
-- Columns: ex_slug, name_en, desc_en, body_part_slug, primary_muscle_slug,
--          equipment_slug, handle_slug (NULL for none),
--          grip_slugs[], secondary_group_slugs[], movement_pattern,
--          default_bar_weight, popularity_rank
params AS (
  VALUES
  -- ========= CHEST =========
  ('barbell-bench-press','Barbell Bench Press','Flat barbell press for chest strength.','chest','pectorals','barbell',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', 20, 10),
  ('incline-barbell-bench-press','Incline Barbell Bench Press','Targets upper chest on incline bench.','chest','pectorals','barbell',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', 20, 40),
  ('decline-barbell-bench-press','Decline Barbell Bench Press','Lower chest focus on decline.','chest','pectorals','barbell',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', 20, 70),
  ('dumbbell-bench-press','Dumbbell Bench Press','Flat dumbbell press for chest.','chest','pectorals','dumbbell',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', NULL, 20),
  ('incline-dumbbell-bench-press','Incline Dumbbell Bench Press','Upper chest with dumbbells.','chest','pectorals','dumbbell',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', NULL, 55),
  ('machine-chest-press','Machine Chest Press','Guided press machine for chest.','chest','pectorals','machine',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', NULL, 35),
  ('cable-fly-high-to-low','Cable Fly (High→Low)','Cable fly descending angle.','chest','pectorals','cable','single_d_handle', ARRAY['neutral'], ARRAY['deltoids'], 'horizontal_push', NULL, 65),
  ('cable-fly-low-to-high','Cable Fly (Low→High)','Cable fly ascending angle.','chest','pectorals','cable','single_d_handle', ARRAY['neutral'], ARRAY['deltoids'], 'horizontal_push', NULL, 75),
  ('push-up','Push-Up','Bodyweight pressing movement.','chest','pectorals','bodyweight',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', NULL, 5),
  ('chest-dip','Chest Dip','Forward-lean dip emphasizing chest.','chest','pectorals','bodyweight',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', NULL, 60),

  -- ========= BACK =========
  ('lat-pulldown','Lat Pulldown','Vertical pulling on cable stack.','back','lats','cable','lat_pulldown_bar', ARRAY['overhand','overhand_wide'], ARRAY['biceps','rhomboids'], 'vertical_pull', NULL, 12),
  ('pull-up','Pull-Up','Bodyweight overhand vertical pull.','back','lats','bodyweight',NULL, ARRAY['overhand'], ARRAY['rhomboids','biceps'], 'vertical_pull', NULL, 18),
  ('chin-up','Chin-Up','Underhand vertical pull.','back','lats','bodyweight',NULL, ARRAY['underhand'], ARRAY['biceps','rhomboids'], 'vertical_pull', NULL, 52),
  ('seated-cable-row-neutral','Seated Cable Row (Neutral)','Neutral-grip row with triangle handle.','back','lats','cable','triangle_row', ARRAY['neutral'], ARRAY['rhomboids','biceps'], 'horizontal_pull', NULL, 22),
  ('seated-cable-row-wide','Seated Cable Row (Wide Overhand)','Wide overhand row with long bar.','back','lats','cable','straight_bar', ARRAY['overhand_wide'], ARRAY['rhomboids','biceps'], 'horizontal_pull', NULL, 58),
  ('barbell-bent-over-row','Barbell Bent-Over Row','Hip-hinged horizontal pull.','back','lats','barbell',NULL, ARRAY['overhand'], ARRAY['rhomboids','biceps','lower_back'], 'horizontal_pull', 20, 26),
  ('t-bar-row','T-Bar Row','Chest-supported or landmine row.','back','lats','barbell',NULL, ARRAY['overhand'], ARRAY['rhomboids','biceps'], 'horizontal_pull', 20, 68),
  ('one-arm-dumbbell-row','One-Arm Dumbbell Row','Unilateral horizontal pull.','back','lats','dumbbell',NULL, ARRAY['neutral'], ARRAY['rhomboids','biceps'], 'horizontal_pull', NULL, 32),
  ('straight-arm-pulldown','Straight-Arm Pulldown','Lat isolation on cable.','back','lats','cable','straight_bar', ARRAY['overhand'], ARRAY['rhomboids'], 'vertical_pull', NULL, 72),
  ('face-pull','Face Pull','Rear-delt/trap/scap retraction.','back','deltoids','cable','rope', ARRAY['rope_neutral'], ARRAY['rhomboids','trapezius'], 'horizontal_pull', NULL, 76),

  -- ========= SHOULDERS =========
  ('overhead-press-barbell','Overhead Press (Barbell)','Standing barbell press.','shoulders','deltoids','barbell',NULL, ARRAY['overhand'], ARRAY['triceps','trapezius'], 'vertical_push', 20, 28),
  ('overhead-press-dumbbell','Overhead Press (Dumbbell)','Seated/standing dumbbell press.','shoulders','deltoids','dumbbell',NULL, ARRAY['overhand'], ARRAY['triceps','trapezius'], 'vertical_push', NULL, 48),
  ('lateral-raise-dumbbell','Lateral Raise (DB)','Side raise for lateral delts.','shoulders','deltoids','dumbbell',NULL, ARRAY['neutral'], ARRAY['trapezius'], 'vertical_push', NULL, 34),
  ('rear-delt-fly-cable','Rear Delt Fly (Cable)','Cross-cable or single arm.','shoulders','deltoids','cable','single_d_handle', ARRAY['neutral'], ARRAY['rhomboids','trapezius'], 'horizontal_pull', NULL, 74),
  ('upright-row-ez','Upright Row (EZ-Bar)','EZ-bar vertical pull to chest.','shoulders','deltoids','barbell',NULL, ARRAY['overhand'], ARRAY['trapezius','biceps'], 'vertical_pull', 20, 80),
  ('arnold-press','Arnold Press','Rotational dumbbell press.','shoulders','deltoids','dumbbell',NULL, ARRAY['overhand'], ARRAY['triceps'], 'rotation', NULL, 78),
  ('front-raise-dumbbell','Front Raise (DB)','Anterior delt raise.','shoulders','deltoids','dumbbell',NULL, ARRAY['neutral'], ARRAY['trapezius'], 'vertical_push', NULL, 81),

  -- ========= ARMS =========
  ('barbell-curl','Barbell Curl','Straight bar curl for biceps.','arms','biceps','barbell',NULL, ARRAY['underhand'], ARRAY['forearms'], 'vertical_pull', 20, 24),
  ('ez-bar-curl','EZ-Bar Curl','EZ bar curl, wrist-friendly.','arms','biceps','barbell',NULL, ARRAY['underhand'], ARRAY['forearms'], 'vertical_pull', 20, 36),
  ('dumbbell-hammer-curl','Hammer Curl (DB)','Neutral-grip curl.','arms','biceps','dumbbell',NULL, ARRAY['neutral'], ARRAY['forearms'], 'vertical_pull', NULL, 42),
  ('cable-curl-rope','Cable Curl (Rope)','Rope neutral/supinated curl.','arms','biceps','cable','rope', ARRAY['rope_neutral'], ARRAY['forearms'], 'vertical_pull', NULL, 64),
  ('triceps-pushdown-rope','Triceps Pushdown (Rope)','Cable extension with rope.','arms','triceps','cable','rope', ARRAY['rope_neutral'], ARRAY['forearms'], 'vertical_push', NULL, 30),
  ('triceps-pushdown-straight','Triceps Pushdown (Bar)','Cable extension with straight bar.','arms','triceps','cable','straight_bar', ARRAY['overhand'], ARRAY['forearms'], 'vertical_push', NULL, 62),
  ('overhead-triceps-extension-rope','Overhead Triceps Ext (Rope)','Cable OH extension.','arms','triceps','cable','rope', ARRAY['rope_neutral'], ARRAY['forearms'], 'vertical_push', NULL, 66),
  ('skull-crusher-ez','Skull Crusher (EZ-Bar)','Lying triceps extension.','arms','triceps','barbell',NULL, ARRAY['overhand'], ARRAY['forearms'], 'horizontal_push', 20, 79),
  ('close-grip-bench-press','Close-Grip Bench Press','Triceps-focused press.','arms','triceps','barbell',NULL, ARRAY['overhand','close'], ARRAY['pectorals','deltoids'], 'horizontal_push', 20, 54),

  -- ========= LEGS / GLUTES / CALVES =========
  ('back-squat','Back Squat','High/low bar squat.','legs','quadriceps','barbell',NULL, ARRAY['overhand'], ARRAY['glutes','hamstrings'], 'squat', 20, 14),
  ('front-squat','Front Squat','Front-racked squat.','legs','quadriceps','barbell',NULL, ARRAY['overhand'], ARRAY['glutes'], 'squat', 20, 46),
  ('romanian-deadlift','Romanian Deadlift','Hip hinge hamstring focus.','legs','hamstrings','barbell',NULL, ARRAY['overhand','mixed'], ARRAY['glutes','erector_spinae'], 'hinge', 20, 38),
  ('deadlift-conventional','Deadlift (Conventional)','Full-body hinge pull.','legs','erector_spinae','barbell',NULL, ARRAY['overhand','mixed'], ARRAY['glutes','hamstrings'], 'hinge', 20, 16),
  ('deadlift-sumo','Deadlift (Sumo)','Wide stance hinge.','legs','glutes','barbell',NULL, ARRAY['overhand','mixed'], ARRAY['hamstrings','quadriceps'], 'hinge', 20, 61),
  ('leg-press','Leg Press','Machine compound press.','legs','quadriceps','machine',NULL, ARRAY['overhand'], ARRAY['glutes','hamstrings'], 'squat', NULL, 31),
  ('walking-lunge-dumbbell','Walking Lunge (DB)','Dynamic unilateral lunge.','legs','quadriceps','dumbbell',NULL, ARRAY['neutral'], ARRAY['glutes','hamstrings'], 'lunge', NULL, 69),
  ('bulgarian-split-squat','Bulgarian Split Squat','Rear-foot elevated split squat.','legs','quadriceps','dumbbell',NULL, ARRAY['neutral'], ARRAY['glutes','hamstrings'], 'lunge', NULL, 44),
  ('leg-extension','Leg Extension','Quad isolation machine.','legs','quadriceps','machine',NULL, ARRAY['overhand'], ARRAY[''], 'squat', NULL, 71),
  ('seated-leg-curl','Seated Leg Curl','Hamstring curl machine.','legs','hamstrings','machine',NULL, ARRAY['overhand'], ARRAY['glutes'], 'hinge', NULL, 77),
  ('lying-leg-curl','Lying Leg Curl','Prone hamstring curl.','legs','hamstrings','machine',NULL, ARRAY['overhand'], ARRAY['glutes'], 'hinge', NULL, 82),
  ('hip-thrust-barbell','Hip Thrust (Barbell)','Glute-focused hip extension.','glutes','glutes','barbell',NULL, ARRAY['overhand'], ARRAY['hamstrings'], 'hinge', 20, 29),
  ('glute-bridge-barbell','Glute Bridge (Barbell)','Short-ROM hip extension.','glutes','glutes','barbell',NULL, ARRAY['overhand'], ARRAY['hamstrings'], 'hinge', 20, 67),
  ('cable-kickback','Cable Kickback','Glute isolation with cable.','glutes','glutes','cable','single_d_handle', ARRAY['neutral'], ARRAY['hamstrings'], 'hinge', NULL, 83),
  ('calf-raise-standing','Standing Calf Raise','Gastrocnemius dominant.','calves','calves','machine',NULL, ARRAY['overhand'], ARRAY[''], 'vertical_push', NULL, 45),
  ('calf-raise-seated','Seated Calf Raise','Soleus-biased seated raise.','calves','calves','machine',NULL, ARRAY['overhand'], ARRAY[''], 'vertical_push', NULL, 73),
  ('hip-abduction-machine','Hip Abduction','Lateral glute machine.','glutes','glutes','machine',NULL, ARRAY['neutral'], ARRAY[''], 'lunge', NULL, 84),
  ('hip-adduction-machine','Hip Adduction','Inner thigh machine.','legs','adductors','machine',NULL, ARRAY['neutral'], ARRAY[''], 'lunge', NULL, 85),

  -- ========= CORE =========
  ('plank','Plank','Anti-extension core hold.','core','abdominals','bodyweight',NULL, ARRAY['neutral'], ARRAY['obliques'], 'anti_extension', NULL, 41),
  ('hanging-leg-raise','Hanging Leg Raise','Hip flexion & abs.','core','abdominals','bodyweight',NULL, ARRAY['overhand'], ARRAY['obliques'], 'vertical_pull', NULL, 57),
  ('cable-crunch','Cable Crunch','Kneeling cable flexion.','core','abdominals','cable','rope', ARRAY['rope_neutral'], ARRAY['obliques'], 'vertical_pull', NULL, 63),
  ('ab-wheel-rollout','Ab Wheel Rollout','Advanced anti-extension.','core','abdominals','bodyweight',NULL, ARRAY['neutral'], ARRAY[''], 'anti_extension', NULL, 86),
  ('pallof-press','Pallof Press','Anti-rotation press-out.','core','obliques','cable','single_d_handle', ARRAY['neutral'], ARRAY['abdominals'], 'rotation', NULL, 87),
  ('russian-twist-plate','Russian Twist (Plate)','Rotational abs w/ load.','core','obliques','dumbbell',NULL, ARRAY['neutral'], ARRAY['abdominals'], 'rotation', NULL, 88)
),

-- 3) Resolve FK IDs for each row
resolved AS (
  SELECT
    p.column1  AS ex_slug,
    p.column2  AS name_en,
    p.column3  AS desc_en,
    p.column4  AS body_part_slug,
    p.column5  AS primary_muscle_slug,
    p.column6  AS equipment_slug,
    p.column7  AS handle_slug,
    p.column8  AS grip_slugs,
    p.column9  AS secondary_group_slugs,
    p.column10 AS movement_pattern,
    p.column11 AS default_bar_weight,
    p.column12 AS popularity_rank,
    bp.id      AS body_part_id,
    m.id       AS primary_muscle_id,
    e.id       AS equipment_id,
    h.id       AS handle_id,
    (SELECT array_agg(g.id) FROM gr g WHERE g.slug = ANY(p.column8))  AS default_grip_ids,
    (SELECT array_agg(mg2.id) FROM mg mg2 WHERE mg2.slug = ANY(p.column9)) AS secondary_mg_ids
  FROM params p
  JOIN bp  ON bp.slug = p.column4
  JOIN mu  ON mu.slug = p.column5
  JOIN eq  ON eq.slug = p.column6
  LEFT JOIN hg h ON h.slug = p.column7
),

-- 4) Upsert into exercises (REMOVED name/description columns)
upsert_ex AS (
  INSERT INTO public.exercises
    (slug, owner_user_id, is_public, body_part_id, primary_muscle_id, equipment_id,
     default_grip_ids, default_handle_ids, movement_pattern, default_bar_weight, popularity_rank,
     secondary_muscle_group_ids)
  SELECT
    r.ex_slug,
    NULL, -- system exercises
    TRUE,
    r.body_part_id,
    r.primary_muscle_id,
    r.equipment_id,
    COALESCE(r.default_grip_ids, '{}')::uuid[],
    CASE WHEN r.handle_id IS NULL THEN NULL ELSE ARRAY[r.handle_id]::uuid[] END,
    NULLIF(r.movement_pattern,'')::movement_pattern,
    r.default_bar_weight,
    r.popularity_rank,
    COALESCE(r.secondary_mg_ids, '{}')::uuid[]
  FROM resolved r
  ON CONFLICT (slug) DO UPDATE SET
    body_part_id         = EXCLUDED.body_part_id,
    primary_muscle_id    = EXCLUDED.primary_muscle_id,
    equipment_id         = EXCLUDED.equipment_id,
    default_grip_ids     = EXCLUDED.default_grip_ids,
    default_handle_ids   = EXCLUDED.default_handle_ids,
    movement_pattern     = EXCLUDED.movement_pattern,
    default_bar_weight   = EXCLUDED.default_bar_weight,
    popularity_rank      = EXCLUDED.popularity_rank,
    secondary_muscle_group_ids = EXCLUDED.secondary_muscle_group_ids
  RETURNING id, slug, default_grip_ids
),

-- 5) Upsert EN translations separately (CORRECT approach)
upsert_tr AS (
  INSERT INTO public.exercises_translations (exercise_id, language_code, name, description)
  SELECT u.id, 'en', r.name_en, r.desc_en
  FROM upsert_ex u
  JOIN resolved r ON r.ex_slug = u.slug
  ON CONFLICT (exercise_id, language_code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description
  RETURNING exercise_id
)

-- 6) Seed exercise_default_grips (ordered), skipping existing pairs
INSERT INTO public.exercise_default_grips (exercise_id, grip_id, order_index)
SELECT
  u.id,
  g_id,
  ord
FROM upsert_ex u
JOIN LATERAL unnest(u.default_grip_ids) WITH ORDINALITY AS t(g_id, ord) ON TRUE
LEFT JOIN public.exercise_default_grips d
  ON d.exercise_id = u.id AND d.grip_id = t.g_id
WHERE d.exercise_id IS NULL;

COMMIT;