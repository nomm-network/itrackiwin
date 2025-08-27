-- Fix RLS issues for new tables
ALTER TABLE public.exercise_default_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_default_grips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "exercise_default_handles_select_all" 
ON public.exercise_default_handles FOR SELECT
USING (true);

CREATE POLICY "exercise_default_handles_admin_manage" 
ON public.exercise_default_handles FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "exercise_default_grips_select_all" 
ON public.exercise_default_grips FOR SELECT
USING (true);

CREATE POLICY "exercise_default_grips_admin_manage" 
ON public.exercise_default_grips FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));