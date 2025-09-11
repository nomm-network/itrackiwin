-- Create equipment profiles linking table
CREATE TABLE IF NOT EXISTS public.equipment_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  profile_type text NOT NULL CHECK (profile_type IN ('plate','stack')),
  profile_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (equipment_id, profile_type)
);

-- Create stack profiles table if not exists
CREATE TABLE IF NOT EXISTS public.stack_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  notes text,
  stack_weights numeric[] NOT NULL DEFAULT '{}',
  aux_weights numeric[] DEFAULT '{}', -- auxiliary add-on weights
  default_unit weight_unit NOT NULL DEFAULT 'kg',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Foreign key enforcement trigger for equipment_profiles
CREATE OR REPLACE FUNCTION public.equipment_profiles_enforce_fk()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.profile_type = 'plate' THEN
    PERFORM 1 FROM public.plate_profiles WHERE id = NEW.profile_id;
    IF NOT FOUND THEN 
      RAISE EXCEPTION 'plate_profile % missing', NEW.profile_id; 
    END IF;
  ELSIF NEW.profile_type = 'stack' THEN
    PERFORM 1 FROM public.stack_profiles WHERE id = NEW.profile_id;
    IF NOT FOUND THEN 
      RAISE EXCEPTION 'stack_profile % missing', NEW.profile_id; 
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_equipment_profiles_enforce_fk ON public.equipment_profiles;
CREATE TRIGGER trg_equipment_profiles_enforce_fk
  BEFORE INSERT OR UPDATE ON public.equipment_profiles
  FOR EACH ROW EXECUTE FUNCTION public.equipment_profiles_enforce_fk();

-- Create gym equipment profile overrides table
CREATE TABLE IF NOT EXISTS public.user_gym_equipment_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_gym_id uuid NOT NULL REFERENCES public.user_gyms(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  plate_profile_id uuid NULL REFERENCES public.plate_profiles(id),
  stack_profile_id uuid NULL REFERENCES public.stack_profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_gym_id, equipment_id)
);

-- Add updated_at triggers
CREATE TRIGGER set_equipment_profiles_updated_at
  BEFORE UPDATE ON public.equipment_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_stack_profiles_updated_at
  BEFORE UPDATE ON public.stack_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_gym_equipment_profiles_updated_at
  BEFORE UPDATE ON public.user_gym_equipment_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.equipment_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stack_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gym_equipment_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for equipment_profiles
CREATE POLICY ep_read_all ON public.equipment_profiles 
  FOR SELECT USING (true);

CREATE POLICY ep_admin_only ON public.equipment_profiles
  FOR ALL USING (is_admin(auth.uid()));

-- RLS policies for stack_profiles
CREATE POLICY sp_read_all ON public.stack_profiles 
  FOR SELECT USING (true);

CREATE POLICY sp_admin_only ON public.stack_profiles
  FOR ALL USING (is_admin(auth.uid()));

-- RLS policies for user_gym_equipment_profiles
CREATE POLICY ugep_read ON public.user_gym_equipment_profiles
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.gym_admins ga 
      WHERE ga.user_id = auth.uid() AND ga.gym_id = user_gym_id
    )
  );

CREATE POLICY ugep_write ON public.user_gym_equipment_profiles
  FOR INSERT WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.gym_admins ga 
      WHERE ga.user_id = auth.uid() AND ga.gym_id = user_gym_id
    )
  );

CREATE POLICY ugep_update ON public.user_gym_equipment_profiles
  FOR UPDATE USING (
    EXISTS(
      SELECT 1 FROM public.gym_admins ga 
      WHERE ga.user_id = auth.uid() AND ga.gym_id = user_gym_id
    )
  );

-- Insert default stack profile
INSERT INTO public.stack_profiles (name, stack_weights, aux_weights, default_unit, notes)
VALUES (
  'Standard Machine Stack',
  ARRAY[5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100]::numeric[],
  ARRAY[1.25,2.5]::numeric[],
  'kg',
  'Standard selectorized machine stack with auxiliary weights'
);

-- Function to get equipment profile with gym override support
CREATE OR REPLACE FUNCTION public.get_equipment_profile(
  p_equipment_id uuid,
  p_user_gym_id uuid DEFAULT NULL
)
RETURNS TABLE(
  plate_profile_id uuid,
  stack_profile_id uuid
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  -- First check for gym-specific override
  IF p_user_gym_id IS NOT NULL THEN
    SELECT ugep.plate_profile_id, ugep.stack_profile_id
    INTO plate_profile_id, stack_profile_id
    FROM public.user_gym_equipment_profiles ugep
    WHERE ugep.user_gym_id = p_user_gym_id 
      AND ugep.equipment_id = p_equipment_id;
    
    IF FOUND THEN
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Fallback to global equipment profiles
  SELECT 
    MAX(CASE WHEN ep.profile_type = 'plate' THEN ep.profile_id END),
    MAX(CASE WHEN ep.profile_type = 'stack' THEN ep.profile_id END)
  INTO plate_profile_id, stack_profile_id
  FROM public.equipment_profiles ep
  WHERE ep.equipment_id = p_equipment_id;
  
  RETURN NEXT;
END $$;