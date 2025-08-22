-- Drop the problematic materialized view
DROP MATERIALIZED VIEW IF EXISTS public.mv_user_exercise_1rm;

-- Create a regular view with proper RLS
CREATE VIEW public.mv_user_exercise_1rm AS 
SELECT 
  w.user_id,
  we.exercise_id,
  MAX(epley_1rm(ws.weight, ws.reps)) AS estimated_1rm,
  MAX(ws.weight) AS max_weight,
  MAX(ws.reps) AS max_reps,
  COUNT(*) AS total_working_sets,
  MAX(ws.completed_at) AS last_updated
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.id
JOIN workout_sets ws ON ws.workout_exercise_id = we.id
WHERE ws.is_completed = true
  AND ws.set_kind IN ('normal', 'top_set', 'backoff')
  AND ws.weight IS NOT NULL
  AND ws.reps IS NOT NULL
  AND ws.reps > 0
  AND w.ended_at IS NOT NULL
GROUP BY w.user_id, we.exercise_id;

-- Enable RLS on the view  
ALTER VIEW public.mv_user_exercise_1rm ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view
CREATE POLICY "Users can view their own 1RM data" ON public.mv_user_exercise_1rm
FOR SELECT USING (user_id = auth.uid());