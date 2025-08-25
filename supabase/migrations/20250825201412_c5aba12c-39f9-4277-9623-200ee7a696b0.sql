-- Fix the security issue with the view by adding proper RLS
ALTER VIEW public.v_pre_checkin_exists SET (security_barrier = true);

-- Add RLS policy for the view 
CREATE POLICY "Users can view their own pre-checkin status" ON workouts 
  FOR SELECT USING (auth.uid() = user_id);