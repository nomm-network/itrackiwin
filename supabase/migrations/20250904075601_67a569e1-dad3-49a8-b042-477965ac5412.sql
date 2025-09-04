-- Drop existing policy and recreate it
DROP POLICY IF EXISTS "Users can manage their own readiness logs" ON public.readiness_logs;

-- Create the correct policy
CREATE POLICY "Users can manage their own readiness logs" 
ON public.readiness_logs 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);