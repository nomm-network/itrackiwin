-- Seed exercise-handle mappings for common exercises
-- First get some common exercises and map them to appropriate handles

-- Cable exercises
INSERT INTO public.exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, true
FROM public.exercises e
CROSS JOIN public.handles h
WHERE e.slug LIKE '%cable%row%' AND h.slug = 'row-triangle'
ON CONFLICT (exercise_id, handle_id) DO NOTHING;

INSERT INTO public.exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, false
FROM public.exercises e
CROSS JOIN public.handles h
WHERE e.slug LIKE '%cable%row%' AND h.slug IN ('row-v-bar', 'straight-bar', 'single-d-handle')
ON CONFLICT (exercise_id, handle_id) DO NOTHING;

-- Lat pulldown exercises
INSERT INTO public.exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, true
FROM public.exercises e
CROSS JOIN public.handles h
WHERE (e.slug LIKE '%lat%pulldown%' OR e.slug LIKE '%pulldown%') AND h.slug = 'lat-bar-wide'
ON CONFLICT (exercise_id, handle_id) DO NOTHING;

INSERT INTO public.exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, false
FROM public.exercises e
CROSS JOIN public.handles h
WHERE (e.slug LIKE '%lat%pulldown%' OR e.slug LIKE '%pulldown%') AND h.slug IN ('lat-bar-standard', 'row-v-bar')
ON CONFLICT (exercise_id, handle_id) DO NOTHING;

-- Triceps exercises
INSERT INTO public.exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, true
FROM public.exercises e
CROSS JOIN public.handles h
WHERE e.slug LIKE '%tricep%' AND h.slug = 'rope'
ON CONFLICT (exercise_id, handle_id) DO NOTHING;

INSERT INTO public.exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, false
FROM public.exercises e
CROSS JOIN public.handles h
WHERE e.slug LIKE '%tricep%' AND h.slug IN ('straight-bar', 'row-v-bar')
ON CONFLICT (exercise_id, handle_id) DO NOTHING;

-- Deadlifts get straight bar by default
INSERT INTO public.exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, true
FROM public.exercises e
CROSS JOIN public.handles h
WHERE e.slug LIKE '%deadlift%' AND h.slug = 'straight-bar'
ON CONFLICT (exercise_id, handle_id) DO NOTHING;

-- EZ bar exercises
INSERT INTO public.exercise_handles (exercise_id, handle_id, is_default)
SELECT e.id, h.id, true
FROM public.exercises e
CROSS JOIN public.handles h
WHERE (e.slug LIKE '%curl%' OR e.slug LIKE '%ez%') AND h.slug = 'ez-curl-bar'
ON CONFLICT (exercise_id, handle_id) DO NOTHING;