-- Enable RLS on materialized views to prevent public access through API
-- This will address both the "Security Definer View" and "Materialized View in API" warnings

ALTER TABLE public.mv_user_exercise_1rm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mv_last_set_per_user_exercise ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.mv_pr_weight_per_user_exercise ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to ensure users can only see their own data
CREATE POLICY "Users can only see their own 1RM data" ON public.mv_user_exercise_1rm
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can only see their own last sets" ON public.mv_last_set_per_user_exercise  
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can only see their own PR data" ON public.mv_pr_weight_per_user_exercise
FOR SELECT USING (user_id = auth.uid());