-- WORKOUT-RELATED MATERIALIZED VIEWS

-- Materialized View: mv_last_set_per_user_exercise
-- Purpose: Track the last set performed by each user for each exercise
CREATE MATERIALIZED VIEW public.mv_last_set_per_user_exercise AS
SELECT DISTINCT ON (w.user_id, we.exercise_id)
    w.user_id,
    we.exercise_id,
    ws.weight_kg,
    ws.weight,
    ws.reps,
    ws.completed_at,
    ws.rpe,
    ws.notes
FROM public.workout_sets ws
JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
JOIN public.workouts w ON w.id = we.workout_id
WHERE ws.is_completed = true
    AND ws.completed_at IS NOT NULL
ORDER BY w.user_id, we.exercise_id, ws.completed_at DESC;

-- Create unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX mv_last_set_per_user_exercise_unique_idx 
ON public.mv_last_set_per_user_exercise (user_id, exercise_id);

-- Materialized View: mv_pr_weight_per_user_exercise  
-- Purpose: Track personal records (max weight) for each user per exercise
CREATE MATERIALIZED VIEW public.mv_pr_weight_per_user_exercise AS
SELECT 
    w.user_id,
    we.exercise_id,
    MAX(COALESCE(ws.weight_kg, ws.weight)) as max_weight_kg,
    MAX(ws.reps) as max_reps,
    MAX(ws.completed_at) as pr_date
FROM public.workout_sets ws
JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id  
JOIN public.workouts w ON w.id = we.workout_id
WHERE ws.is_completed = true
    AND ws.completed_at IS NOT NULL
    AND COALESCE(ws.weight_kg, ws.weight) > 0
GROUP BY w.user_id, we.exercise_id;

-- Create unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX mv_pr_weight_per_user_exercise_unique_idx
ON public.mv_pr_weight_per_user_exercise (user_id, exercise_id);

-- Materialized View: mv_user_exercise_1rm
-- Purpose: Calculate estimated 1RM for users per exercise
CREATE MATERIALIZED VIEW public.mv_user_exercise_1rm AS
SELECT 
    w.user_id,
    we.exercise_id,
    COALESCE(ws.weight_kg, ws.weight) as weight_kg,
    ws.reps,
    -- Epley formula: 1RM = weight × (1 + reps/30)
    ROUND(COALESCE(ws.weight_kg, ws.weight) * (1 + ws.reps::numeric / 30), 2) as estimated_1rm,
    ws.completed_at
FROM public.workout_sets ws
JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
JOIN public.workouts w ON w.id = we.workout_id  
WHERE ws.is_completed = true
    AND ws.completed_at IS NOT NULL
    AND COALESCE(ws.weight_kg, ws.weight) > 0
    AND ws.reps > 0
    AND ws.reps <= 15; -- Only use sets with 15 reps or less for 1RM calculation

-- Create unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX mv_user_exercise_1rm_unique_idx
ON public.mv_user_exercise_1rm (user_id, exercise_id, completed_at, weight_kg, reps);