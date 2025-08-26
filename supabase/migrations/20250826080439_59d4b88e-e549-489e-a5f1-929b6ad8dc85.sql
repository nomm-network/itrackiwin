-- Add RLS policies for new views

-- Enable RLS on the new views
ALTER VIEW v_current_workout SET (security_barrier = true);
ALTER VIEW v_exercise_last_set SET (security_barrier = true);

-- Create RLS policies for v_current_workout
CREATE POLICY "Users can view their own current workouts" 
ON v_current_workout FOR SELECT 
USING (auth.uid() = user_id);

-- Create RLS policies for v_exercise_last_set  
CREATE POLICY "Users can view their own exercise last sets"
ON v_exercise_last_set FOR SELECT
USING (auth.uid() = user_id);