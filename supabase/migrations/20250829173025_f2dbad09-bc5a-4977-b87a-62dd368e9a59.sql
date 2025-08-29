-- Seed default grips for top 20 core lifts
-- This ensures every exercise has sensible grip defaults for the UI

-- Bench Press family (overhand grip)
INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'overhand'
  AND e.slug IN ('flat-bench-press', 'incline-bench-press', 'decline-bench-press', 'dumbbell-bench-press', 'dumbbell-incline-press')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

-- Pull-ups/Chin-ups (overhand primary, underhand secondary)
INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'overhand'
  AND e.slug IN ('pull-up', 'lat-pulldown', 'wide-grip-pull-up')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 2
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'underhand'
  AND e.slug IN ('chin-up', 'lat-pulldown')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

-- Bicep curls (underhand grip)
INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'underhand'
  AND e.slug IN ('barbell-curl', 'ez-bar-curl', 'preacher-curl', 'dumbbell-curl', 'hammer-curl')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

-- Hammer curls get neutral grip as primary
INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'neutral'
  AND e.slug = 'hammer-curl'
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

-- Rows (overhand grip)
INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'overhand'
  AND e.slug IN ('barbell-row', 'dumbbell-row', 't-bar-row', 'seated-cable-row', 'bent-over-row')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

-- Shoulder presses (overhand grip)
INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'overhand'
  AND e.slug IN ('overhead-press', 'military-press', 'arnold-press', 'shoulder-press', 'dumbbell-shoulder-press')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

-- Deadlifts (overhand primary, mixed secondary)
INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'overhand'
  AND e.slug IN ('deadlift', 'romanian-deadlift', 'stiff-leg-deadlift', 'sumo-deadlift')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 2
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'mixed'
  AND e.slug IN ('deadlift', 'sumo-deadlift')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

-- Squats (overhand grip for barbell positioning)
INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'overhand'
  AND e.slug IN ('squat', 'front-squat', 'back-squat', 'goblet-squat')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

-- Tricep exercises (overhand/neutral)
INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'overhand'
  AND e.slug IN ('tricep-pushdown', 'close-grip-bench-press')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM exercises e
CROSS JOIN grips g 
WHERE g.slug = 'neutral'
  AND e.slug IN ('tricep-dips', 'overhead-tricep-extension')
ON CONFLICT (exercise_id, grip_id) DO NOTHING;

-- Now seed exercise aliases for better searchability
-- Bench Press family
INSERT INTO exercise_aliases (exercise_id, alias)
SELECT e.id, alias_name
FROM exercises e
CROSS JOIN (VALUES 
    ('flat-bench-press', 'bench press'),
    ('flat-bench-press', 'flat bench'),
    ('flat-bench-press', 'barbell bench press'),
    ('incline-bench-press', 'inclined bench'),
    ('incline-bench-press', 'incline press'),
    ('incline-bench-press', 'incline bench press'),
    ('decline-bench-press', 'decline bench'),
    ('decline-bench-press', 'negative bench'),
    ('decline-bench-press', 'decline press')
) AS aliases(exercise_slug, alias_name)
WHERE e.slug = aliases.exercise_slug
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Pull-ups and chin-ups
INSERT INTO exercise_aliases (exercise_id, alias)
SELECT e.id, alias_name
FROM exercises e
CROSS JOIN (VALUES 
    ('pull-up', 'pullups'),
    ('pull-up', 'wide grip pull up'),
    ('pull-up', 'wide grip pullup'),
    ('chin-up', 'chinups'),
    ('chin-up', 'chin ups'),
    ('lat-pulldown', 'lat pull down'),
    ('lat-pulldown', 'lat pulls'),
    ('lat-pulldown', 'pulldown')
) AS aliases(exercise_slug, alias_name)
WHERE e.slug = aliases.exercise_slug
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Bicep curls
INSERT INTO exercise_aliases (exercise_id, alias)
SELECT e.id, alias_name
FROM exercises e
CROSS JOIN (VALUES 
    ('barbell-curl', 'barbell curls'),
    ('barbell-curl', 'straight bar curls'),
    ('barbell-curl', 'bb curls'),
    ('ez-bar-curl', 'ez curls'),
    ('ez-bar-curl', 'ez bar curls'),
    ('dumbbell-curl', 'db curls'),
    ('dumbbell-curl', 'dumbbell curls'),
    ('hammer-curl', 'hammer curls'),
    ('hammer-curl', 'neutral grip curls'),
    ('preacher-curl', 'preacher curls'),
    ('preacher-curl', 'preacher bench curls')
) AS aliases(exercise_slug, alias_name)
WHERE e.slug = aliases.exercise_slug
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Rows
INSERT INTO exercise_aliases (exercise_id, alias)
SELECT e.id, alias_name
FROM exercises e
CROSS JOIN (VALUES 
    ('barbell-row', 'barbell rows'),
    ('barbell-row', 'bent over row'),
    ('barbell-row', 'bent-over rows'),
    ('dumbbell-row', 'db rows'),
    ('dumbbell-row', 'single arm row'),
    ('t-bar-row', 'tbar row'),
    ('t-bar-row', 'landmine row'),
    ('t-bar-row', 't bar row'),
    ('seated-cable-row', 'seated row'),
    ('seated-cable-row', 'cable rows')
) AS aliases(exercise_slug, alias_name)
WHERE e.slug = aliases.exercise_slug
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Shoulder presses
INSERT INTO exercise_aliases (exercise_id, alias)
SELECT e.id, alias_name
FROM exercises e
CROSS JOIN (VALUES 
    ('overhead-press', 'ohp'),
    ('overhead-press', 'standing press'),
    ('overhead-press', 'strict press'),
    ('military-press', 'military press'),
    ('military-press', 'standing military'),
    ('shoulder-press', 'shoulder presses'),
    ('shoulder-press', 'seated press'),
    ('arnold-press', 'arnold presses'),
    ('arnold-press', 'arnold shoulder press')
) AS aliases(exercise_slug, alias_name)
WHERE e.slug = aliases.exercise_slug
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Deadlifts
INSERT INTO exercise_aliases (exercise_id, alias)
SELECT e.id, alias_name
FROM exercises e
CROSS JOIN (VALUES 
    ('deadlift', 'conventional deadlift'),
    ('deadlift', 'classic deadlift'),
    ('deadlift', 'deadlifts'),
    ('romanian-deadlift', 'rdl'),
    ('romanian-deadlift', 'romanian deadlifts'),
    ('romanian-deadlift', 'stiff leg deadlift'),
    ('sumo-deadlift', 'sumo deadlifts'),
    ('sumo-deadlift', 'sumo dl'),
    ('stiff-leg-deadlift', 'sldl'),
    ('stiff-leg-deadlift', 'stiff leg dl')
) AS aliases(exercise_slug, alias_name)
WHERE e.slug = aliases.exercise_slug
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Squats
INSERT INTO exercise_aliases (exercise_id, alias)
SELECT e.id, alias_name
FROM exercises e
CROSS JOIN (VALUES 
    ('squat', 'back squat'),
    ('squat', 'squats'),
    ('squat', 'barbell squat'),
    ('front-squat', 'front squats'),
    ('front-squat', 'fs'),
    ('goblet-squat', 'goblet squats'),
    ('goblet-squat', 'kb squat'),
    ('leg-press', 'leg presses'),
    ('leg-press', 'machine leg press')
) AS aliases(exercise_slug, alias_name)
WHERE e.slug = aliases.exercise_slug
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Tricep exercises
INSERT INTO exercise_aliases (exercise_id, alias)
SELECT e.id, alias_name
FROM exercises e
CROSS JOIN (VALUES 
    ('tricep-pushdown', 'tricep pushdowns'),
    ('tricep-pushdown', 'cable pushdowns'),
    ('tricep-pushdown', 'pushdowns'),
    ('close-grip-bench-press', 'cgbp'),
    ('close-grip-bench-press', 'close grip bench'),
    ('close-grip-bench-press', 'narrow grip bench'),
    ('tricep-dips', 'dips'),
    ('tricep-dips', 'parallel bar dips'),
    ('overhead-tricep-extension', 'skull crushers'),
    ('overhead-tricep-extension', 'lying tricep extension')
) AS aliases(exercise_slug, alias_name)
WHERE e.slug = aliases.exercise_slug
ON CONFLICT (exercise_id, alias) DO NOTHING;