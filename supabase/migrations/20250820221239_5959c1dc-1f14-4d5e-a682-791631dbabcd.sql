-- PHASE 6: Equipment seed + Metric mappings + Unique indexes
-- Ensure standard equipment exists (seed if missing)
INSERT INTO public.equipment (slug)
VALUES 
  ('treadmill'),
  ('bike'),
  ('spin-bike'),
  ('rower'),
  ('elliptical'),
  ('stair-climber')
ON CONFLICT DO NOTHING;

-- Map metrics to equipment
-- Treadmill -> incline, speed
INSERT INTO public.exercise_metric_defs (equipment_id, metric_id, is_required, order_index)
SELECT e.id, md.id, false, 
  CASE md.key 
    WHEN 'incline' THEN 1
    WHEN 'speed' THEN 2
    ELSE 3
  END
FROM public.equipment e
JOIN public.metric_defs md ON md.key IN ('incline','speed')
WHERE e.slug = 'treadmill'
ON CONFLICT DO NOTHING;

-- Bike/Spin-bike -> resistance_level, cadence, power, speed
INSERT INTO public.exercise_metric_defs (equipment_id, metric_id, is_required, order_index)
SELECT e.id, md.id, false,
  CASE md.key 
    WHEN 'resistance_level' THEN 1
    WHEN 'cadence' THEN 2
    WHEN 'power' THEN 3
    WHEN 'speed' THEN 4
    ELSE 5
  END
FROM public.equipment e
JOIN public.metric_defs md ON md.key IN ('resistance_level','cadence','power','speed')
WHERE e.slug IN ('bike', 'spin-bike')
ON CONFLICT DO NOTHING;

-- Rower -> resistance_level, stroke_rate, power
INSERT INTO public.exercise_metric_defs (equipment_id, metric_id, is_required, order_index)
SELECT e.id, md.id, false,
  CASE md.key 
    WHEN 'resistance_level' THEN 1
    WHEN 'stroke_rate' THEN 2
    WHEN 'power' THEN 3
    ELSE 4
  END
FROM public.equipment e
JOIN public.metric_defs md ON md.key IN ('resistance_level','stroke_rate','power')
WHERE e.slug = 'rower'
ON CONFLICT DO NOTHING;

-- Elliptical -> resistance_level, cadence
INSERT INTO public.exercise_metric_defs (equipment_id, metric_id, is_required, order_index)
SELECT e.id, md.id, false,
  CASE md.key 
    WHEN 'resistance_level' THEN 1
    WHEN 'cadence' THEN 2
    ELSE 3
  END
FROM public.equipment e
JOIN public.metric_defs md ON md.key IN ('resistance_level','cadence')
WHERE e.slug = 'elliptical'
ON CONFLICT DO NOTHING;

-- Stair-climber -> resistance_level, pace
INSERT INTO public.exercise_metric_defs (equipment_id, metric_id, is_required, order_index)
SELECT e.id, md.id, false,
  CASE md.key 
    WHEN 'resistance_level' THEN 1
    WHEN 'pace' THEN 2
    ELSE 3
  END
FROM public.equipment e
JOIN public.metric_defs md ON md.key IN ('resistance_level','pace')
WHERE e.slug = 'stair-climber'
ON CONFLICT DO NOTHING;

-- Unique indexes for slugs
CREATE UNIQUE INDEX IF NOT EXISTS uq_grips_slug ON public.grips(slug);
CREATE UNIQUE INDEX IF NOT EXISTS uq_equipment_slug ON public.equipment(slug);

-- Performance indexes for frequent filtering
CREATE INDEX IF NOT EXISTS idx_workouts_user_started_at 
ON public.workouts(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_exercises_public_popularity 
ON public.exercises(is_public, popularity_rank DESC) 
WHERE is_public = true;