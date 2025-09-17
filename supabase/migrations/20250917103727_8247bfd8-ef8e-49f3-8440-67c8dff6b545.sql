-- Create missing enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'location_type') THEN
        CREATE TYPE location_type AS ENUM ('home', 'gym');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_goal') THEN
        CREATE TYPE program_goal AS ENUM ('recomp', 'fat_loss', 'muscle_gain', 'strength', 'general_fitness');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_creator') THEN
        CREATE TYPE program_creator AS ENUM ('bro_ai', 'coach', 'user');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_status') THEN
        CREATE TYPE program_status AS ENUM ('draft', 'active', 'archived');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workout_block_type') THEN
        CREATE TYPE workout_block_type AS ENUM ('straight', 'superset', 'circuit');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_type') THEN
        CREATE TYPE movement_type AS ENUM ('compound', 'isolation');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'primary_muscle') THEN
        CREATE TYPE primary_muscle AS ENUM ('chest', 'back', 'quads', 'hamstrings', 'glutes', 'shoulders', 'biceps', 'triceps', 'calves', 'abs');
    END IF;
END $$;

-- Create fitness_profile table using correct enum values
CREATE TABLE public.fitness_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_level experience_level NOT NULL DEFAULT 'new',
  training_days_per_week INTEGER NOT NULL CHECK (training_days_per_week >= 1 AND training_days_per_week <= 7),
  location_type location_type NOT NULL DEFAULT 'gym',
  selected_gym_id UUID,
  available_equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority_muscle_groups TEXT[] DEFAULT ARRAY[]::TEXT[],
  injury_limits TEXT[] DEFAULT ARRAY[]::TEXT[],
  time_per_session_min INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create programs table
CREATE TABLE public.ai_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal program_goal NOT NULL,
  weeks INTEGER NOT NULL DEFAULT 8 CHECK (weeks > 0),
  created_by program_creator NOT NULL DEFAULT 'user',
  notes TEXT,
  status program_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create program_weeks table
CREATE TABLE public.ai_program_weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.ai_programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(program_id, week_number)
);

-- Create workouts table for programs
CREATE TABLE public.ai_program_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_week_id UUID NOT NULL REFERENCES public.ai_program_weeks(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  title TEXT NOT NULL,
  focus_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enhanced exercises table with AI coach fields  
CREATE TABLE public.ai_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  primary_muscle primary_muscle NOT NULL,
  secondary_muscles TEXT[] DEFAULT ARRAY[]::TEXT[],
  required_equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
  movement_type movement_type NOT NULL DEFAULT 'isolation',
  experience_min experience_level NOT NULL DEFAULT 'new',
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  grip_type TEXT,
  body_position TEXT,
  video_url TEXT,
  instructions TEXT,
  is_unilateral BOOLEAN DEFAULT false,
  is_bodyweight BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enhanced workout_exercises table for programs
CREATE TABLE public.ai_program_workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.ai_program_workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.ai_exercises(id) ON DELETE SET NULL,
  placeholder_name TEXT, -- for when exercise doesn't exist yet
  order_index INTEGER NOT NULL DEFAULT 1,
  sets INTEGER NOT NULL DEFAULT 3 CHECK (sets > 0),
  reps_min INTEGER DEFAULT 8 CHECK (reps_min > 0),
  reps_max INTEGER DEFAULT 12 CHECK (reps_max >= reps_min),
  rpe NUMERIC(3,1) CHECK (rpe >= 1 AND rpe <= 10),
  tempo TEXT, -- e.g., "3-1-1-0"
  rest_sec INTEGER DEFAULT 90 CHECK (rest_sec > 0),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority INTEGER DEFAULT 2 CHECK (priority >= 1 AND priority <= 3),
  primary_muscle primary_muscle,
  movement_type movement_type,
  required_equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (exercise_id IS NOT NULL OR placeholder_name IS NOT NULL)
);

-- Enable RLS on all tables
ALTER TABLE public.fitness_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_program_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_program_workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own fitness profile" ON public.fitness_profile
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI programs" ON public.ai_programs
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can access AI program weeks for their programs" ON public.ai_program_weeks
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.ai_programs p 
    WHERE p.id = ai_program_weeks.program_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can access AI workouts for their programs" ON public.ai_program_workouts
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.ai_program_weeks pw
    JOIN public.ai_programs p ON p.id = pw.program_id
    WHERE pw.id = ai_program_workouts.program_week_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can access AI workout exercises for their workouts" ON public.ai_program_workout_exercises
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.ai_program_workouts w
    JOIN public.ai_program_weeks pw ON pw.id = w.program_week_id
    JOIN public.ai_programs p ON p.id = pw.program_id
    WHERE w.id = ai_program_workout_exercises.workout_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "AI exercises are viewable by everyone" ON public.ai_exercises
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage AI exercises" ON public.ai_exercises
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER set_fitness_profile_updated_at
  BEFORE UPDATE ON public.fitness_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_ai_programs_updated_at
  BEFORE UPDATE ON public.ai_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_ai_program_workouts_updated_at
  BEFORE UPDATE ON public.ai_program_workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_ai_program_workout_exercises_updated_at
  BEFORE UPDATE ON public.ai_program_workout_exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_ai_exercises_updated_at
  BEFORE UPDATE ON public.ai_exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();