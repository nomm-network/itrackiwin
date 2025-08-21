-- Fix Security Definer issues
-- 1. Functions that don't need SECURITY DEFINER (they only access user's own data):

-- Fix get_user_last_set_for_exercise - doesn't need SECURITY DEFINER since it filters by auth.uid()
CREATE OR REPLACE FUNCTION public.get_user_last_set_for_exercise(p_exercise_id uuid)
RETURNS TABLE(user_id uuid, exercise_id uuid, weight numeric, reps integer, completed_at timestamp with time zone)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT mv.user_id, mv.exercise_id, mv.weight, mv.reps, mv.completed_at
  FROM public.mv_last_set_per_user_exercise mv
  WHERE mv.user_id = auth.uid() 
    AND mv.exercise_id = p_exercise_id
    AND mv.rn = 1;
END;
$function$;

-- Fix get_user_pr_for_exercise - doesn't need SECURITY DEFINER since it filters by auth.uid()
CREATE OR REPLACE FUNCTION public.get_user_pr_for_exercise(p_exercise_id uuid)
RETURNS TABLE(user_id uuid, exercise_id uuid, best_weight numeric)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT mv.user_id, mv.exercise_id, mv.best_weight
  FROM public.mv_pr_weight_per_user_exercise mv
  WHERE mv.user_id = auth.uid() 
    AND mv.exercise_id = p_exercise_id;
END;
$function$;

-- Fix refresh_exercise_views - doesn't need SECURITY DEFINER since it's a utility function
CREATE OR REPLACE FUNCTION public.refresh_exercise_views(p_user_id uuid, p_exercise_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Refresh last set view for specific user+exercise
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_last_set_per_user_exercise;
  
  -- Refresh PR view for specific user+exercise  
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_pr_weight_per_user_exercise;
END;
$function$;

-- Keep SECURITY DEFINER for functions that legitimately need it:
-- has_role and is_admin need SECURITY DEFINER to bypass RLS when checking permissions
-- bootstrap_admin_if_empty needs SECURITY DEFINER to create admin roles
-- enforce_max_pins needs SECURITY DEFINER as a trigger function

-- Comment: The remaining SECURITY DEFINER functions are legitimate:
-- - has_role and is_admin: Need elevated privileges to read user_roles for permission checks
-- - bootstrap_admin_if_empty: Needs elevated privileges to create admin roles when none exist
-- - enforce_max_pins: Trigger function that needs to enforce business rules