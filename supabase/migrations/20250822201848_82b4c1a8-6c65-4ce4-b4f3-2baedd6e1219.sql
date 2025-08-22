-- Fix RLS security issue for user_profile_fitness table
-- Enable RLS on the table
ALTER TABLE public.user_profile_fitness ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profile_fitness table
CREATE POLICY "Users can view their own fitness profile" 
ON public.user_profile_fitness 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fitness profile" 
ON public.user_profile_fitness 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fitness profile" 
ON public.user_profile_fitness 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fitness profile" 
ON public.user_profile_fitness 
FOR DELETE 
USING (auth.uid() = user_id);