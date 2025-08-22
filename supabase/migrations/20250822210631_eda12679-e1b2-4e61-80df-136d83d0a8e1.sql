-- Drop the existing user_fitness_profile table and recreate with proper structure
DROP TABLE IF EXISTS public.user_fitness_profile;

-- Create the new user_fitness_profile table with correct structure
CREATE TABLE public.user_fitness_profile (
  user_id uuid NOT NULL PRIMARY KEY,
  primary_weight_goal_id uuid NOT NULL,
  training_focus_id uuid NOT NULL,
  experience text NOT NULL CHECK (experience IN ('new', 'returning', 'intermediate', 'advanced')),
  sex text NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  bodyweight numeric NOT NULL,
  height_cm numeric NOT NULL,
  training_age_months integer NOT NULL DEFAULT 0,
  injuries jsonb DEFAULT '[]'::jsonb,
  prefer_short_rests boolean DEFAULT false,
  days_per_week integer NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
  preferred_session_minutes integer NOT NULL CHECK (preferred_session_minutes BETWEEN 15 AND 240),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT fk_user_fitness_profile_primary_weight_goal 
    FOREIGN KEY (primary_weight_goal_id) REFERENCES weight_goal_tuning(id),
  CONSTRAINT fk_user_fitness_profile_training_focus 
    FOREIGN KEY (training_focus_id) REFERENCES training_focus_presets(id)
);

-- Enable RLS
ALTER TABLE public.user_fitness_profile ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own fitness profile" 
ON public.user_fitness_profile 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fitness profile" 
ON public.user_fitness_profile 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fitness profile" 
ON public.user_fitness_profile 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_fitness_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_fitness_profile_updated_at
BEFORE UPDATE ON public.user_fitness_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_user_fitness_profile_updated_at();