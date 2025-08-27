-- FINAL CORRECTED EXERCISE SEED SCRIPT
-- Using actual anatomical muscle slugs and valid movement patterns

BEGIN;

-- 1) Resolve lookups once  
WITH bp AS (SELECT id, slug FROM public.body_parts),
     eq AS (SELECT id, slug FROM public.equipment),
     mu AS (SELECT id, slug FROM public.muscles),
     hg AS (SELECT id, slug FROM public.handles),
     gr AS (SELECT id, slug FROM public.grips),
     mg AS (SELECT id, slug FROM public.muscle_groups),

-- 2) Define exercises with CORRECT muscle slugs and movement patterns
params AS (
  VALUES
  -- ========= CHEST =========
  ('barbell-bench-press','Barbell Bench Press','Flat barbell press for chest strength.','chest','pectoralis_major_sternal','barbell',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', 20, 10),
  ('incline-barbell-bench-press','Incline Barbell Bench Press','Targets upper chest on incline bench.','chest','pectoralis_major_clavicular','barbell',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', 20, 40),
  ('decline-barbell-bench-press','Decline Barbell Bench Press','Lower chest focus on decline.','chest','pectoralis_major_costal','barbell',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', 20, 70),
  ('dumbbell-bench-press','Dumbbell Bench Press','Flat dumbbell press for chest.','chest','pectoralis_major_sternal','dumbbell',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', NULL, 20),
  ('incline-dumbbell-bench-press','Incline Dumbbell Bench Press','Upper chest with dumbbells.','chest','pectoralis_major_clavicular','dumbbell',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', NULL, 55),
  ('machine-chest-press','Machine Chest Press','Guided press machine for chest.','chest','pectoralis_major_sternal','machine',NULL, ARRAY['overhand'], ARRAY['triceps','deltoids'], 'horizontal_push', NULL, 35),

  -- ========= BACK =========
  ('lat-pulldown','Lat Pulldown','Vertical pulling on cable stack.','back','latissimus_dorsi','cable','lat-bar-standard', ARRAY['overhand','overhand_wide'], ARRAY['biceps','rhomboids'], 'vertical_pull', NULL, 12),
  ('pull-up','Pull-Up','Bodyweight overhand vertical pull.','back','latissimus_dorsi','bodyweight',NULL, ARRAY['overhand'], ARRAY['rhomboids','biceps'], 'vertical_pull', NULL, 18),
  ('chin-up','Chin-Up','Underhand vertical pull.','back','latissimus_dorsi','bodyweight',NULL, ARRAY['underhand'], ARRAY['biceps','rhomboids'], 'vertical_pull', NULL, 52),
  ('seated-cable-row-neutral','Seated Cable Row (Neutral)','Neutral-grip row with triangle handle.','back','latissimus_dorsi','cable','row-triangle', ARRAY['neutral'], ARRAY['rhomboids','biceps'], 'horizontal_pull', NULL, 22),
  ('barbell-bent-over-row','Barbell Bent-Over Row','Hip-hinged horizontal pull.','back','latissimus_dorsi','barbell',NULL, ARRAY['overhand'], ARRAY['rhomboids','biceps'], 'horizontal_pull', 20, 26),

  -- ========= SHOULDERS =========
  ('overhead-press-barbell','Overhead Press (Barbell)','Standing barbell press.','shoulders','anterior_deltoid','barbell',NULL, ARRAY['overhand'], ARRAY['triceps','trapezius'], 'vertical_push', 20, 28),
  ('overhead-press-dumbbell','Overhead Press (Dumbbell)','Seated/standing dumbbell press.','shoulders','anterior_deltoid','dumbbell',NULL, ARRAY['overhand'], ARRAY['triceps','trapezius'], 'vertical_push', NULL, 48),
  ('lateral-raise-dumbbell','Lateral Raise (DB)','Side raise for lateral delts.','shoulders','lateral_deltoid','dumbbell',NULL, ARRAY['neutral'], ARRAY['trapezius'], 'isolation', NULL, 34),
  ('rear-delt-fly-cable','Rear Delt Fly (Cable)','Cross-cable or single arm.','shoulders','posterior_deltoid','cable','single-d-handle', ARRAY['neutral'], ARRAY['rhomboids','trapezius'], 'horizontal_pull', NULL, 74),

  -- ========= ARMS =========
  ('barbell-curl','Barbell Curl','Straight bar curl for biceps.','arms','biceps_brachii_long_head','barbell',NULL, ARRAY['underhand'], ARRAY['forearms'], 'isolation', 20, 24),
  ('ez-bar-curl','EZ-Bar Curl','EZ bar curl, wrist-friendly.','arms','biceps_brachii_long_head','barbell',NULL, ARRAY['underhand'], ARRAY['forearms'], 'isolation', 20, 36),
  ('dumbbell-hammer-curl','Hammer Curl (DB)','Neutral-grip curl.','arms','brachialis','dumbbell',NULL, ARRAY['neutral'], ARRAY['forearms'], 'isolation', NULL, 42),
  ('triceps-pushdown-rope','Triceps Pushdown (Rope)','Cable extension with rope.','arms','triceps_long_head','cable','rope', ARRAY['rope_neutral'], ARRAY['forearms'], 'vertical_push', NULL, 30),
  ('triceps-pushdown-straight','Triceps Pushdown (Bar)','Cable extension with straight bar.','arms','triceps_long_head','cable','straight-bar', ARRAY['overhand'], ARRAY['forearms'], 'vertical_push', NULL, 62),
  ('close-grip-bench-press','Close-Grip Bench Press','Triceps-focused press.','arms','triceps_long_head','barbell',NULL, ARRAY['close'], ARRAY['pectorals','deltoids'], 'horizontal_push', 20, 54),

  -- ========= LEGS =========
  ('back-squat','Back Squat','High/low bar squat.','legs','rectus_femoris','barbell',NULL, ARRAY['overhand'], ARRAY['glutes','hamstrings'], 'squat', 20, 14),
  ('front-squat','Front Squat','Front-racked squat.','legs','rectus_femoris','barbell',NULL, ARRAY['overhand'], ARRAY['glutes'], 'squat', 20, 46),
  ('romanian-deadlift','Romanian Deadlift','Hip hinge hamstring focus.','legs','biceps_femoris','barbell',NULL, ARRAY['overhand','mixed'], ARRAY['glutes'], 'hinge', 20, 38),
  ('deadlift-conventional','Deadlift (Conventional)','Full-body hinge pull.','legs','biceps_femoris','barbell',NULL, ARRAY['overhand','mixed'], ARRAY['glutes','hamstrings'], 'hinge', 20, 16),
  ('leg-press','Leg Press','Machine compound press.','legs','rectus_femoris','machine',NULL, ARRAY['overhand'], ARRAY['glutes','hamstrings'], 'squat', NULL, 31),
  ('leg-extension','Leg Extension','Quad isolation machine.','legs','rectus_femoris','machine',NULL, ARRAY['overhand'], ARRAY[''], 'isolation', NULL, 71),
  ('seated-leg-curl','Seated Leg Curl','Hamstring curl machine.','legs','biceps_femoris','machine',NULL, ARRAY['overhand'], ARRAY['glutes'], 'isolation', NULL, 77),

  -- ========= GLUTES =========
  ('hip-thrust-barbell','Hip Thrust (Barbell)','Glute-focused hip extension.','glutes','gluteus_maximus','barbell',NULL, ARRAY['overhand'], ARRAY['hamstrings'], 'hinge', 20, 29),
  ('glute-bridge-barbell','Glute Bridge (Barbell)','Short-ROM hip extension.','glutes','gluteus_maximus','barbell',NULL, ARRAY['overhand'], ARRAY['hamstrings'], 'hinge', 20, 67),

  -- ========= CALVES =========
  ('calf-raise-standing','Standing Calf Raise','Gastrocnemius dominant.','calves','gastrocnemius_medial','machine',NULL, ARRAY['overhand'], ARRAY[''], 'isolation', NULL, 45),
  ('calf-raise-seated','Seated Calf Raise','Soleus-biased seated raise.','calves','soleus','machine',NULL, ARRAY['overhand'], ARRAY[''], 'isolation', NULL, 73),

  -- ========= CORE =========
  ('plank','Plank','Anti-extension core hold.','core','rectus_abdominis','bodyweight',NULL, ARRAY['neutral'], ARRAY['obliques'], 'isolation', NULL, 41),
  ('hanging-leg-raise','Hanging Leg Raise','Hip flexion & abs.','core','rectus_abdominis','bodyweight',NULL, ARRAY['overhand'], ARRAY['obliques'], 'vertical_pull', NULL, 57),
  ('cable-crunch','Cable Crunch','Kneeling cable flexion.','core','rectus_abdominis','cable','rope', ARRAY['rope_neutral'], ARRAY['obliques'], 'isolation', NULL, 63)
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
    mu.id      AS primary_muscle_id,
    eq.id      AS equipment_id,
    hg.id      AS handle_id,
    (SELECT array_agg(gr.id) FROM gr WHERE gr.slug = ANY(p.column8))  AS default_grip_ids,
    (SELECT array_agg(mg2.id) FROM mg mg2 WHERE mg2.slug = ANY(p.column9)) AS secondary_mg_ids
  FROM params p
  JOIN bp  ON bp.slug = p.column4
  JOIN mu  ON mu.slug = p.column5
  JOIN eq  ON eq.slug = p.column6
  LEFT JOIN hg ON hg.slug = p.column7
),

-- 4) Upsert into exercises
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

-- 5) Upsert EN translations
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

-- 6) Seed exercise_default_grips
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