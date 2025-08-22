-- Drop the materialized view and create a secure view instead
DROP MATERIALIZED VIEW IF EXISTS public.mv_user_exercise_1rm CASCADE;

-- Create a regular view with RLS support for 1RM calculations
CREATE OR REPLACE VIEW public.mv_user_exercise_1rm
WITH (security_barrier = true)
AS
SELECT
  w.user_id,
  we.exercise_id,
  MAX(ws.weight * (1 + (ws.reps::numeric / 30.0)))     AS one_rm,
  MAX(ws.completed_at)                                 AS last_set_at,
  NOW()                                                AS refreshed_at
FROM public.workout_sets ws
JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
JOIN public.workouts w           ON w.id  = we.workout_id
WHERE
  ws.is_completed = true
  AND ws.weight IS NOT NULL
  AND ws.reps   IS NOT NULL
  AND ws.reps > 0
  AND w.user_id = auth.uid()  -- Filter by current user
GROUP BY
  w.user_id, we.exercise_id;

-- Enable RLS on the view
ALTER VIEW public.mv_user_exercise_1rm ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view
CREATE POLICY "Users can view their own 1RM data" 
ON public.mv_user_exercise_1rm 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update the refresh function to be simpler since we're using a view now
CREATE OR REPLACE FUNCTION public.refresh_1rm_materialized_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Since we're using a view instead of materialized view, no refresh needed
  -- The view will always return current data
  RETURN NEW;
END;
$$;