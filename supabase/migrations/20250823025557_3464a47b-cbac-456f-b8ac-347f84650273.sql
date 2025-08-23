-- Create rest_timer_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rest_timer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_set_id UUID,
  suggested_duration_seconds INTEGER NOT NULL,
  actual_duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  skipped_at TIMESTAMP WITH TIME ZONE,
  paused_count INTEGER DEFAULT 0,
  pause_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.rest_timer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own rest timer sessions"
ON public.rest_timer_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rest_timer_sessions_user_id ON public.rest_timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_rest_timer_sessions_workout_set_id ON public.rest_timer_sessions(workout_set_id);
CREATE INDEX IF NOT EXISTS idx_rest_timer_sessions_started_at ON public.rest_timer_sessions(started_at DESC);

-- Add foreign key constraint if workout_sets table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workout_sets' AND table_schema = 'public') THEN
    ALTER TABLE public.rest_timer_sessions 
    ADD CONSTRAINT rest_timer_sessions_workout_set_id_fkey 
    FOREIGN KEY (workout_set_id) REFERENCES public.workout_sets(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;