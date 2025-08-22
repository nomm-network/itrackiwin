-- Step 1: Core User Fitness Profile System (working with existing enums)

-- Create missing enums only
CREATE TYPE public.fitness_goal AS ENUM ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'increase_strength', 'improve_endurance', 'general_fitness');

-- Update existing training_focus enum to add missing values
ALTER TYPE public.training_focus ADD VALUE IF NOT EXISTS 'cardio';
ALTER TYPE public.training_focus ADD VALUE IF NOT EXISTS 'bodybuilding';

-- Check if user_profile_fitness table exists, if not create it
CREATE TABLE IF NOT EXISTS public.user_profile_fitness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goals and focus
  goal public.fitness_goal,
  training_focus public.training_focus,
  experience_level public.experience_level,
  
  -- Body metrics
  bodyweight NUMERIC(5,2), -- in user's preferred unit
  height_cm INTEGER, -- always in cm for consistency
  body_fat_percentage NUMERIC(4,2),
  
  -- Training preferences  
  days_per_week SMALLINT CHECK (days_per_week >= 1 AND days_per_week <= 7),
  preferred_session_minutes INTEGER CHECK (preferred_session_minutes >= 15 AND preferred_session_minutes <= 300),
  
  -- Settings
  weight_unit public.weight_unit DEFAULT 'kg',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'user_profile_fitness' 
    AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.user_profile_fitness ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own fitness profile" ON public.user_profile_fitness;
DROP POLICY IF EXISTS "Users can insert their own fitness profile" ON public.user_profile_fitness;
DROP POLICY IF EXISTS "Users can update their own fitness profile" ON public.user_profile_fitness;

-- RLS Policies
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

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_user_profile_fitness_updated_at ON public.user_profile_fitness;
CREATE TRIGGER update_user_profile_fitness_updated_at
  BEFORE UPDATE ON public.user_profile_fitness
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create user gamification table
CREATE TABLE IF NOT EXISTS public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS for gamification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'user_gamification' 
    AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Gamification policies
DROP POLICY IF EXISTS "Users can view their own gamification data" ON public.user_gamification;
DROP POLICY IF EXISTS "Users can insert their own gamification data" ON public.user_gamification;
DROP POLICY IF EXISTS "Users can update their own gamification data" ON public.user_gamification;

CREATE POLICY "Users can view their own gamification data"
  ON public.user_gamification
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gamification data"
  ON public.user_gamification
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification data"
  ON public.user_gamification
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for gamification
DROP TRIGGER IF EXISTS update_user_gamification_updated_at ON public.user_gamification;
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON public.user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profile_fitness_user_id ON public.user_profile_fitness(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON public.user_gamification(user_id);