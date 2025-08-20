-- Fix RLS security issues for exercise_default_grips table
ALTER TABLE public.exercise_default_grips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for exercise_default_grips
-- Users can view all default grips (public data)
CREATE POLICY "exercise_default_grips_select_all" 
ON public.exercise_default_grips 
FOR SELECT 
USING (true);

-- Only allow authenticated users to modify (typically admin operations)
CREATE POLICY "exercise_default_grips_mutate_auth" 
ON public.exercise_default_grips 
FOR ALL 
USING (auth.role() = 'authenticated'::text)
WITH CHECK (auth.role() = 'authenticated'::text);