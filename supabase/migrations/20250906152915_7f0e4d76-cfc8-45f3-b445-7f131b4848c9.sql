-- Step 4: Equipment Intelligence - Complete implementation

-- 1) Global defaults (brand-agnostic)
CREATE TABLE IF NOT EXISTS public.equipment_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  display_name text NOT NULL,
  loading_mode text NOT NULL CHECK (loading_mode IN ('plates','stack','fixed','bodyweight','band')),
  base_implement_kg numeric(6,2) DEFAULT 0,
  plate_denoms_kg numeric[] DEFAULT '{25,20,15,10,5,2.5,1.25,0.5}',
  stack_min_kg numeric(6,2) DEFAULT 5,
  stack_max_kg numeric(6,2) DEFAULT 120,
  stack_increment_kg numeric(5,2) DEFAULT 5,
  fixed_increment_kg numeric(5,2) DEFAULT 2.5,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2) Gym overrides (priority over defaults)
CREATE TABLE IF NOT EXISTS public.gym_equipment_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  equipment_slug text NOT NULL,
  base_implement_kg numeric(6,2),
  plate_denoms_kg numeric[],
  stack_min_kg numeric(6,2),
  stack_max_kg numeric(6,2),
  stack_increment_kg numeric(5,2),
  fixed_increment_kg numeric(5,2),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (gym_id, equipment_slug)
);

-- 3) Exercise → default mapping
CREATE TABLE IF NOT EXISTS public.exercise_equipment_profiles (
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  equipment_slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (exercise_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_geo_gym ON public.gym_equipment_overrides(gym_id);
CREATE INDEX IF NOT EXISTS idx_eep_exercise ON public.exercise_equipment_profiles(exercise_id);
CREATE INDEX IF NOT EXISTS idx_eep_slug ON public.exercise_equipment_profiles(equipment_slug);

-- Seed some defaults
INSERT INTO public.equipment_defaults (slug, display_name, loading_mode, base_implement_kg, plate_denoms_kg, stack_min_kg, stack_max_kg, stack_increment_kg, fixed_increment_kg, notes) VALUES
('barbell_std', 'Standard Barbell', 'plates', 20, '{25,20,15,10,5,2.5,1.25}', NULL, NULL, NULL, NULL, 'Standard Olympic barbell with common plate denominations'),
('barbell_technique', 'Technique Bar', 'plates', 15, '{10,5,2.5,1.25,0.5}', NULL, NULL, NULL, NULL, 'Lighter technique bar with micro-plates'),
('dbell_std', 'Standard Dumbbells', 'fixed', 0, NULL, NULL, NULL, NULL, 2.5, 'Standard dumbbell increments'),
('dbell_micro', 'Micro Dumbbells', 'fixed', 0, NULL, NULL, NULL, NULL, 1, 'Dumbbells with smaller increments'),
('stack_std', 'Standard Stack', 'stack', 0, NULL, 5, 120, 5, NULL, 'Standard weight stack machine'),
('stack_micro', 'Micro Stack', 'stack', 0, NULL, 2.5, 120, 2.5, NULL, 'Weight stack with micro increments'),
('kb_std', 'Standard Kettlebells', 'fixed', 0, NULL, NULL, NULL, NULL, 4, 'Standard kettlebell increments'),
('bodyweight', 'Bodyweight', 'bodyweight', 0, NULL, NULL, NULL, NULL, NULL, 'Bodyweight exercises'),
('band_std', 'Resistance Bands', 'band', 0, NULL, NULL, NULL, NULL, NULL, 'Resistance band exercises')
ON CONFLICT (slug) DO NOTHING;

-- View: effective equipment configuration
CREATE OR REPLACE VIEW public.v_effective_equipment AS
SELECT
  ed.slug,
  ed.display_name,
  ed.loading_mode,
  -- resolved values: coalesce(gym override, default)
  COALESCE(geo.base_implement_kg, ed.base_implement_kg) AS base_implement_kg,
  COALESCE(geo.plate_denoms_kg, ed.plate_denoms_kg) AS plate_denoms_kg,
  COALESCE(geo.stack_min_kg, ed.stack_min_kg) AS stack_min_kg,
  COALESCE(geo.stack_max_kg, ed.stack_max_kg) AS stack_max_kg,
  COALESCE(geo.stack_increment_kg, ed.stack_increment_kg) AS stack_increment_kg,
  COALESCE(geo.fixed_increment_kg, ed.fixed_increment_kg) AS fixed_increment_kg,
  geo.gym_id,
  COALESCE(geo.notes, ed.notes) AS notes
FROM public.equipment_defaults ed
LEFT JOIN public.gym_equipment_overrides geo ON geo.equipment_slug = ed.slug;

-- RPC: get effective profile for (exercise_id, gym_id?)
CREATE OR REPLACE FUNCTION public.get_effective_equipment_profile(p_exercise uuid, p_gym uuid DEFAULT NULL)
RETURNS TABLE(
  slug text,
  loading_mode text,
  base_implement_kg numeric,
  plate_denoms_kg numeric[],
  stack_min_kg numeric,
  stack_max_kg numeric,
  stack_increment_kg numeric,
  fixed_increment_kg numeric
) 
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH target AS (
    SELECT eep.equipment_slug
    FROM public.exercise_equipment_profiles eep
    WHERE eep.exercise_id = p_exercise
  )
  SELECT
    ve.slug, ve.loading_mode, ve.base_implement_kg, ve.plate_denoms_kg,
    ve.stack_min_kg, ve.stack_max_kg, ve.stack_increment_kg, ve.fixed_increment_kg
  FROM target t
  JOIN public.v_effective_equipment ve ON ve.slug = t.equipment_slug
  WHERE (ve.gym_id = p_gym) OR (ve.gym_id IS NULL)
  ORDER BY ve.gym_id NULLS LAST
  LIMIT 1;
$$;

-- RPC: compute nearest achievable load for a target
CREATE OR REPLACE FUNCTION public.round_load_for_exercise(
  p_exercise uuid,
  p_gym uuid,
  p_target_kg numeric
) RETURNS numeric
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE 
  cfg record;
  result numeric := NULL;
  side_target numeric;
  rem numeric;
  chosen numeric;
  p numeric;
BEGIN
  SELECT * INTO cfg FROM public.get_effective_equipment_profile(p_exercise, p_gym);
  
  IF NOT FOUND THEN
    -- fallback: treat as fixed 0.5 kg increments if unmapped
    RETURN round(p_target_kg * 2) / 2.0;
  END IF;

  IF cfg.loading_mode = 'stack' THEN
    -- clamp then snap
    result := GREATEST(cfg.stack_min_kg, LEAST(cfg.stack_max_kg, p_target_kg));
    result := round((result - cfg.stack_min_kg) / cfg.stack_increment_kg) * cfg.stack_increment_kg + cfg.stack_min_kg;
    RETURN result;
    
  ELSIF cfg.loading_mode = 'fixed' THEN
    RETURN round(p_target_kg / cfg.fixed_increment_kg) * cfg.fixed_increment_kg;
    
  ELSIF cfg.loading_mode = 'plates' THEN
    -- greedy approximation: compute per-side weight needed; use available denoms
    side_target := GREATEST(0, p_target_kg - cfg.base_implement_kg) / 2.0;
    rem := side_target;
    chosen := 0;
    
    -- sort denoms desc; iterate
    FOR p IN SELECT unnest(cfg.plate_denoms_kg) AS d ORDER BY d DESC LOOP
      WHILE rem >= p LOOP
        rem := rem - p;
        chosen := chosen + p;
      END LOOP;
    END LOOP;
    
    result := cfg.base_implement_kg + 2 * chosen;
    RETURN result;
    
  ELSE
    RETURN p_target_kg;
  END IF;
END$$;

-- RPC: produce load suggestions for a set of percentages
CREATE OR REPLACE FUNCTION public.suggest_loads(
  p_exercise uuid,
  p_gym uuid,
  p_estimated_1rm numeric,
  p_percentages numeric[] DEFAULT '{0.4,0.6,0.75,0.85}'
) RETURNS TABLE(pct numeric, suggested_kg numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT 
    pct,
    public.round_load_for_exercise(p_exercise, p_gym, p_estimated_1rm * pct) AS suggested_kg
  FROM unnest(p_percentages) AS pct;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_effective_equipment_profile(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.round_load_for_exercise(uuid, uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.suggest_loads(uuid, uuid, numeric, numeric[]) TO authenticated;

-- Enable RLS
ALTER TABLE public.equipment_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_equipment_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_equipment_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Equipment defaults: readable by everyone
CREATE POLICY ed_read ON public.equipment_defaults 
FOR SELECT USING (true);

-- Gym overrides: read for gym admins and all users for transparency
CREATE POLICY geo_read ON public.gym_equipment_overrides
FOR SELECT USING (true);

CREATE POLICY geo_write_admin ON public.gym_equipment_overrides
FOR INSERT WITH CHECK (public.is_gym_admin(gym_id));

CREATE POLICY geo_update_admin ON public.gym_equipment_overrides
FOR UPDATE USING (public.is_gym_admin(gym_id)) 
WITH CHECK (public.is_gym_admin(gym_id));

CREATE POLICY geo_delete_admin ON public.gym_equipment_overrides
FOR DELETE USING (public.is_gym_admin(gym_id));

-- Exercise equipment profiles: readable by all, writable by admins
CREATE POLICY eep_read ON public.exercise_equipment_profiles 
FOR SELECT USING (true);

CREATE POLICY eep_admin_manage ON public.exercise_equipment_profiles
FOR ALL USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_equipment_defaults_updated_at
  BEFORE UPDATE ON public.equipment_defaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_equipment_overrides_updated_at
  BEFORE UPDATE ON public.gym_equipment_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_equipment_profiles_updated_at
  BEFORE UPDATE ON public.exercise_equipment_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();