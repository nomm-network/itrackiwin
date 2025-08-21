-- Fix security warnings from the database linter

-- 1. Fix search_path issues for all functions by setting explicit search_path
CREATE OR REPLACE FUNCTION public.refresh_exercise_views(p_user_id uuid, p_exercise_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Refresh last set view for specific user+exercise
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_last_set_per_user_exercise;
  
  -- Refresh PR view for specific user+exercise  
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_pr_weight_per_user_exercise;
END;
$$;

-- 2. Create RLS policies for materialized views to restrict API access
ALTER MATERIALIZED VIEW public.mv_last_set_per_user_exercise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own last sets" 
ON public.mv_last_set_per_user_exercise
FOR SELECT 
USING (auth.uid() = user_id);

ALTER MATERIALIZED VIEW public.mv_pr_weight_per_user_exercise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own PRs" 
ON public.mv_pr_weight_per_user_exercise
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Move pg_trgm extension to extensions schema (if possible)
-- Note: pg_trgm is commonly kept in public schema for compatibility, but we'll document this