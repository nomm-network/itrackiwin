-- Fix materialized view security by creating helper functions instead of direct RLS

-- Create helper functions that enforce user access control
CREATE OR REPLACE FUNCTION public.get_user_last_set_for_exercise(p_exercise_id uuid)
RETURNS TABLE (
  user_id uuid,
  exercise_id uuid, 
  weight numeric,
  reps integer,
  completed_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT mv.user_id, mv.exercise_id, mv.weight, mv.reps, mv.completed_at
  FROM public.mv_last_set_per_user_exercise mv
  WHERE mv.user_id = auth.uid() 
    AND mv.exercise_id = p_exercise_id
    AND mv.rn = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_pr_for_exercise(p_exercise_id uuid)
RETURNS TABLE (
  user_id uuid,
  exercise_id uuid,
  best_weight numeric
)
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT mv.user_id, mv.exercise_id, mv.best_weight
  FROM public.mv_pr_weight_per_user_exercise mv
  WHERE mv.user_id = auth.uid() 
    AND mv.exercise_id = p_exercise_id;
END;
$$;

-- Revoke public access to materialized views
REVOKE ALL ON public.mv_last_set_per_user_exercise FROM PUBLIC;
REVOKE ALL ON public.mv_pr_weight_per_user_exercise FROM PUBLIC;

-- Grant access only to authenticated users through the helper functions
GRANT EXECUTE ON FUNCTION public.get_user_last_set_for_exercise(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_pr_for_exercise(uuid) TO authenticated;