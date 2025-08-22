-- Step 2: Gym Integration & Equipment System

-- Create user gym memberships table
CREATE TABLE IF NOT EXISTS public.user_gym_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  
  membership_type TEXT, -- 'full', 'peak', 'off_peak', 'student', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, gym_id)
);

-- Enable RLS
ALTER TABLE public.user_gym_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gym memberships
CREATE POLICY "Users can view their own gym memberships"
  ON public.user_gym_memberships
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gym memberships"
  ON public.user_gym_memberships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gym memberships"
  ON public.user_gym_memberships
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user equipment preferences table
CREATE TABLE IF NOT EXISTS public.user_equipment_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  
  preference_level SMALLINT NOT NULL DEFAULT 5 CHECK (preference_level >= 1 AND preference_level <= 10),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, equipment_id)
);

-- Enable RLS
ALTER TABLE public.user_equipment_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for equipment preferences
CREATE POLICY "Users can manage their own equipment preferences"
  ON public.user_equipment_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create gym equipment availability table
CREATE TABLE IF NOT EXISTS public.gym_equipment_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  is_functional BOOLEAN NOT NULL DEFAULT true,
  brand TEXT,
  model TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(gym_id, equipment_id)
);

-- Enable RLS
ALTER TABLE public.gym_equipment_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gym equipment
CREATE POLICY "Gym equipment is viewable by everyone"
  ON public.gym_equipment_availability
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gym equipment"
  ON public.gym_equipment_availability
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create user muscle group priorities
CREATE TABLE IF NOT EXISTS public.user_muscle_priorities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muscle_id UUID NOT NULL REFERENCES public.muscles(id) ON DELETE CASCADE,
  
  priority_level SMALLINT NOT NULL DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, muscle_id)
);

-- Enable RLS
ALTER TABLE public.user_muscle_priorities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for muscle priorities
CREATE POLICY "Users can manage their own muscle priorities"
  ON public.user_muscle_priorities
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_user_gym_memberships_updated_at
  BEFORE UPDATE ON public.user_gym_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_equipment_preferences_updated_at
  BEFORE UPDATE ON public.user_equipment_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gym_equipment_availability_updated_at
  BEFORE UPDATE ON public.gym_equipment_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_muscle_priorities_updated_at
  BEFORE UPDATE ON public.user_muscle_priorities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_gym_memberships_user_id ON public.user_gym_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gym_memberships_gym_id ON public.user_gym_memberships(gym_id);
CREATE INDEX IF NOT EXISTS idx_user_equipment_preferences_user_id ON public.user_equipment_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_equipment_availability_gym_id ON public.gym_equipment_availability(gym_id);
CREATE INDEX IF NOT EXISTS idx_user_muscle_priorities_user_id ON public.user_muscle_priorities(user_id);