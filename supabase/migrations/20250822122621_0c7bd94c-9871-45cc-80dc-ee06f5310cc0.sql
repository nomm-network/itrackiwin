-- Enable RLS on materialized view
ALTER MATERIALIZED VIEW public.mv_user_exercise_1rm ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to see only their own 1RM data
CREATE POLICY "Users can view their own 1RM data" ON public.mv_user_exercise_1rm
FOR SELECT USING (user_id = auth.uid());