-- Create workout_checkins table for pre-workout readiness data
CREATE TABLE IF NOT EXISTS public.workout_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  energy smallint CHECK (energy BETWEEN 1 AND 10),
  sleep_quality smallint CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_hours numeric CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  soreness smallint CHECK (soreness BETWEEN 1 AND 10),
  stress smallint CHECK (stress BETWEEN 1 AND 10),
  illness boolean DEFAULT false,
  alcohol boolean DEFAULT false,
  supplements text[] DEFAULT '{}',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- One readiness check per workout per user
  UNIQUE(workout_id, user_id)
);

-- Enable RLS
ALTER TABLE public.workout_checkins ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own workout checkins" 
ON public.workout_checkins FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_workout_checkins_workout_user 
ON public.workout_checkins(workout_id, user_id);