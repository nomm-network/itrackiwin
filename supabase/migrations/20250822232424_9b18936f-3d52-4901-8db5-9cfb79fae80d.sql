-- Step 1: Core User Fitness Profile System

-- Create enums for user fitness preferences
CREATE TYPE public.fitness_goal AS ENUM ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'increase_strength', 'improve_endurance', 'general_fitness');
CREATE TYPE public.training_focus AS ENUM ('muscle_building', 'strength', 'cardio', 'powerlifting', 'bodybuilding', 'general');
CREATE TYPE public.experience_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE public.weight_unit AS ENUM ('kg', 'lbs');

-- Create user fitness profile table
CREATE TABLE public.user_profile_fitness (
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

-- Enable RLS
ALTER TABLE public.user_profile_fitness ENABLE ROW LEVEL SECURITY;

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

-- Updated trigger
CREATE TRIGGER update_user_profile_fitness_updated_at
  BEFORE UPDATE ON public.user_profile_fitness
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create user XP and level tracking
CREATE TABLE public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gamification
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

-- Trigger for gamification updates
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON public.user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_profile_fitness_user_id ON public.user_profile_fitness(user_id);
CREATE INDEX idx_user_gamification_user_id ON public.user_gamification(user_id);