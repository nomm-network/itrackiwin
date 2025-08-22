-- Step 3: Enhanced Workout Features

-- Enhance existing readiness_checkins table structure (check if columns exist)
DO $$
BEGIN
    -- Add recovery score if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'readiness_checkins' 
                   AND column_name = 'recovery_score') THEN
        ALTER TABLE public.readiness_checkins 
        ADD COLUMN recovery_score NUMERIC(3,1) CHECK (recovery_score >= 0 AND recovery_score <= 10);
    END IF;
    
    -- Add mood if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'readiness_checkins' 
                   AND column_name = 'mood') THEN
        ALTER TABLE public.readiness_checkins 
        ADD COLUMN mood SMALLINT CHECK (mood >= 1 AND mood <= 10);
    END IF;
END $$;

-- Create workout session feedback table
CREATE TABLE IF NOT EXISTS public.workout_session_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session feedback
  perceived_exertion SMALLINT CHECK (perceived_exertion >= 1 AND perceived_exertion <= 10),
  energy_after SMALLINT CHECK (energy_after >= 1 AND energy_after <= 10),
  enjoyment SMALLINT CHECK (enjoyment >= 1 AND enjoyment <= 10),
  difficulty SMALLINT CHECK (difficulty >= 1 AND difficulty <= 10),
  
  -- Recovery indicators
  muscle_soreness SMALLINT CHECK (muscle_soreness >= 1 AND muscle_soreness <= 10),
  joint_stiffness SMALLINT CHECK (joint_stiffness >= 1 AND joint_stiffness <= 10),
  
  -- Notes and improvements
  notes TEXT,
  what_went_well TEXT,
  what_to_improve TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(workout_id, user_id)
);

-- Enable RLS
ALTER TABLE public.workout_session_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout feedback
CREATE POLICY "Users can manage their own workout feedback"
  ON public.workout_session_feedback
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create rest timer sessions table
CREATE TABLE IF NOT EXISTS public.rest_timer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_set_id UUID REFERENCES public.workout_sets(id) ON DELETE CASCADE,
  
  planned_rest_seconds INTEGER NOT NULL,
  actual_rest_seconds INTEGER,
  
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  was_interrupted BOOLEAN DEFAULT false,
  interruption_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rest_timer_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rest timer
CREATE POLICY "Users can manage their own rest timer sessions"
  ON public.rest_timer_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create progressive overload tracking
CREATE TABLE IF NOT EXISTS public.progressive_overload_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  
  strategy TEXT NOT NULL CHECK (strategy IN ('linear', 'double_progression', 'wave', 'percentage_based')),
  
  -- Current parameters
  current_weight NUMERIC(6,2),
  current_reps INTEGER,
  current_sets INTEGER,
  
  -- Progression rules
  weight_increment NUMERIC(4,2) DEFAULT 2.5,
  rep_range_min INTEGER DEFAULT 8,
  rep_range_max INTEGER DEFAULT 12,
  
  -- Progress tracking
  successful_sessions INTEGER DEFAULT 0,
  failed_sessions INTEGER DEFAULT 0,
  last_progression_date TIMESTAMP WITH TIME ZONE,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, exercise_id)
);

-- Enable RLS
ALTER TABLE public.progressive_overload_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for progressive overload
CREATE POLICY "Users can manage their own progressive overload plans"
  ON public.progressive_overload_plans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create auto-deload triggers table
CREATE TABLE IF NOT EXISTS public.auto_deload_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('failed_sessions', 'rpe_too_high', 'volume_drop', 'readiness_low')),
  threshold_value NUMERIC(5,2),
  
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  deload_percentage NUMERIC(4,2) DEFAULT 10.0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auto_deload_triggers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auto deload
CREATE POLICY "Users can manage their own auto deload triggers"
  ON public.auto_deload_triggers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_progressive_overload_plans_updated_at
  BEFORE UPDATE ON public.progressive_overload_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_deload_triggers_updated_at
  BEFORE UPDATE ON public.auto_deload_triggers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_session_feedback_workout_id ON public.workout_session_feedback(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_session_feedback_user_id ON public.workout_session_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_rest_timer_sessions_user_id ON public.rest_timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_rest_timer_sessions_workout_set_id ON public.rest_timer_sessions(workout_set_id);
CREATE INDEX IF NOT EXISTS idx_progressive_overload_plans_user_id ON public.progressive_overload_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_progressive_overload_plans_exercise_id ON public.progressive_overload_plans(exercise_id);
CREATE INDEX IF NOT EXISTS idx_auto_deload_triggers_user_id ON public.auto_deload_triggers(user_id);