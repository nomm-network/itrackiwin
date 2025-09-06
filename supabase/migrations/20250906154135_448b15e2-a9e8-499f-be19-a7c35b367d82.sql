-- Step 4: Equipment Intelligence - Update existing gym_equipment_overrides table

-- Add new columns to existing gym_equipment_overrides table
ALTER TABLE public.gym_equipment_overrides 
ADD COLUMN IF NOT EXISTS equipment_slug text,
ADD COLUMN IF NOT EXISTS base_implement_kg numeric(6,2),
ADD COLUMN IF NOT EXISTS plate_denoms_kg numeric[],
ADD COLUMN IF NOT EXISTS stack_min_kg numeric(6,2),
ADD COLUMN IF NOT EXISTS stack_max_kg numeric(6,2),
ADD COLUMN IF NOT EXISTS stack_increment_kg numeric(5,2),
ADD COLUMN IF NOT EXISTS fixed_increment_kg numeric(5,2),
ADD COLUMN IF NOT EXISTS notes text;

-- For now, let's create the view and functions using a different approach
-- We'll use the equipment table directly instead of relying on gym_equipment_overrides

-- View: effective equipment configuration (simplified for now)
CREATE OR REPLACE VIEW public.v_effective_equipment AS
SELECT
  ed.slug,
  ed.display_name,
  ed.loading_mode,
  ed.base_implement_kg,
  ed.plate_denoms_kg,
  ed.stack_min_kg,
  ed.stack_max_kg,
  ed.stack_increment_kg,
  ed.fixed_increment_kg,
  NULL::uuid as gym_id,
  ed.notes
FROM public.equipment_defaults ed;

-- RPC: get effective profile for (exercise_id, gym_id?) - fallback to defaults
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
    LIMIT 1
  )
  SELECT
    ed.slug, ed.loading_mode, ed.base_implement_kg, ed.plate_denoms_kg,
    ed.stack_min_kg, ed.stack_max_kg, ed.stack_increment_kg, ed.fixed_increment_kg
  FROM target t
  JOIN public.equipment_defaults ed ON ed.slug = t.equipment_slug
  UNION ALL
  -- Fallback to barbell_std if no mapping exists
  SELECT
    ed.slug, ed.loading_mode, ed.base_implement_kg, ed.plate_denoms_kg,
    ed.stack_min_kg, ed.stack_max_kg, ed.stack_increment_kg, ed.fixed_increment_kg
  FROM public.equipment_defaults ed
  WHERE ed.slug = 'barbell_std' AND NOT EXISTS (
    SELECT 1 FROM public.exercise_equipment_profiles eep WHERE eep.exercise_id = p_exercise
  )
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