-- Create user settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_weight text NOT NULL DEFAULT 'kg',
  timezone text DEFAULT NULL,
  language_code text NOT NULL DEFAULT 'en',
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user fitness profile table  
CREATE TABLE IF NOT EXISTS public.user_profile_fitness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal text NOT NULL, -- 'lose' | 'maintain' | 'gain'
  training_goal text NOT NULL, -- 'hypertrophy' | 'strength' | 'conditioning'  
  experience_level text NOT NULL, -- 'new' | 'returning' | 'intermediate' | 'advanced'
  bodyweight numeric,
  height_cm numeric,
  injuries text[], 
  days_per_week smallint DEFAULT 3,
  preferred_session_minutes smallint DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_fitness ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings  
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for user_profile_fitness
CREATE POLICY "Users can view own fitness profile" ON public.user_profile_fitness
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fitness profile" ON public.user_profile_fitness
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fitness profile" ON public.user_profile_fitness  
  FOR UPDATE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profile_fitness_updated_at
  BEFORE UPDATE ON public.user_profile_fitness  
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();