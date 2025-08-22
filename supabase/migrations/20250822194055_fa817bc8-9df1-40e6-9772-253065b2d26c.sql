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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can view own settings') THEN
    CREATE POLICY "Users can view own settings" ON public.user_settings
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can insert own settings') THEN
    CREATE POLICY "Users can insert own settings" ON public.user_settings  
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can update own settings') THEN
    CREATE POLICY "Users can update own settings" ON public.user_settings
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS policies for user_profile_fitness
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profile_fitness' AND policyname = 'Users can view own fitness profile') THEN
    CREATE POLICY "Users can view own fitness profile" ON public.user_profile_fitness
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profile_fitness' AND policyname = 'Users can insert own fitness profile') THEN
    CREATE POLICY "Users can insert own fitness profile" ON public.user_profile_fitness
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profile_fitness' AND policyname = 'Users can update own fitness profile') THEN
    CREATE POLICY "Users can update own fitness profile" ON public.user_profile_fitness  
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add updated_at triggers conditionally
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_settings_updated_at') THEN
    CREATE TRIGGER update_user_settings_updated_at
      BEFORE UPDATE ON public.user_settings
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profile_fitness_updated_at') THEN
    CREATE TRIGGER update_user_profile_fitness_updated_at
      BEFORE UPDATE ON public.user_profile_fitness  
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;