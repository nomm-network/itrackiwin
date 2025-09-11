-- Step 10: Rollout & Migration Hardening (Fixed)

-- 1. Feature flag table
CREATE TABLE IF NOT EXISTS app_flags (
  key text PRIMARY KEY,
  enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on app_flags
ALTER TABLE app_flags ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read flags
CREATE POLICY "app_flags_read_auth" ON app_flags FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage flags
CREATE POLICY "app_flags_admin_manage" ON app_flags FOR ALL USING (is_admin(auth.uid()));

-- Insert gym equipment v2 feature flag
INSERT INTO app_flags(key, enabled) VALUES ('gym_equipment_v2', false)
ON CONFLICT (key) DO NOTHING;

-- 2. Simplified compatibility view for weight resolution (without plate_profiles dependency)
CREATE OR REPLACE VIEW v_weight_resolution_active AS
SELECT
  COALESCE(g.id, 'default'::uuid) as gym_id,
  'kg' as unit,
  1.25 as min_increment_kg,
  2.5 as min_increment_lb,
  'System Default' as source_name,
  'system_default' as resolution_source
FROM gyms g
UNION ALL
-- Default entry for users without gym
SELECT 
  'default'::uuid as gym_id,
  'kg' as unit,
  1.25 as min_increment_kg,
  2.5 as min_increment_lb,
  'System Default' as source_name,
  'system_default' as resolution_source;

-- 3. Rack lookup flattener
CREATE OR REPLACE VIEW v_rack_lookup AS
SELECT 
  ds.id as gym_id,
  'dumbbell' as kind,
  ds.default_unit as unit,
  ds.min_kg as min_weight,
  ds.max_kg as max_weight,
  ds.step_kg as step
FROM dumbbell_sets ds
WHERE ds.is_active = true
UNION ALL
-- Add fixed bars as "racks" (global defaults)
SELECT
  NULL::uuid as gym_id,
  'fixed_bar' as kind,
  'kg' as unit,
  7.5 as min_weight,
  25 as max_weight,
  2.5 as step;

-- 4. Helper function to check feature flag
CREATE OR REPLACE FUNCTION is_feature_enabled(flag_key text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT enabled FROM app_flags WHERE key = flag_key),
    false
  );
$$;

-- 5. Enhanced resolution function with feature flag support
CREATE OR REPLACE FUNCTION fn_resolve_achievable_load_v2(
  exercise_id uuid,
  gym_id uuid DEFAULT NULL,
  desired_kg numeric DEFAULT 20,
  allow_mix_units boolean DEFAULT true,
  user_unit text DEFAULT 'kg'
) RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
  v_feature_enabled boolean;
  v_resolution_config RECORD;
  v_best_total numeric := 0;
  v_best_implement text := 'barbell';
  v_best_details jsonb := '{}';
  v_exercise_load_type load_type;
BEGIN
  -- Check if gym equipment v2 is enabled
  SELECT is_feature_enabled('gym_equipment_v2') INTO v_feature_enabled;
  
  IF NOT v_feature_enabled THEN
    -- Fall back to original resolver
    RETURN fn_resolve_achievable_load(exercise_id, gym_id, desired_kg, allow_mix_units);
  END IF;

  -- Get resolution config for this gym
  SELECT * INTO v_resolution_config
  FROM v_weight_resolution_active
  WHERE gym_id = COALESCE(fn_resolve_achievable_load_v2.gym_id, 'default'::uuid)
  LIMIT 1;

  -- Get exercise load type
  SELECT load_type INTO v_exercise_load_type
  FROM exercises 
  WHERE id = exercise_id;

  IF v_exercise_load_type IS NULL THEN
    v_exercise_load_type := 'dual_load';
  END IF;

  -- Enhanced barbell resolution with gym-specific increments
  IF v_exercise_load_type IN ('dual_load') THEN
    v_best_total := closest_barbell_weight_kg(
      desired_kg, 
      20, -- Bar weight
      ARRAY[25, 20, 15, 10, 5, 2.5, 1.25, v_resolution_config.min_increment_kg]
    );
    v_best_implement := 'barbell';
    v_best_details := jsonb_build_object(
      'bar_weight', 20,
      'min_increment', v_resolution_config.min_increment_kg,
      'resolution_source', v_resolution_config.resolution_source,
      'unit', v_resolution_config.unit
    );
  END IF;

  -- Enhanced dumbbell resolution using rack lookup
  IF v_exercise_load_type IN ('single_load', 'dual_load') THEN
    DECLARE
      v_rack_config RECORD;
    BEGIN
      SELECT * INTO v_rack_config
      FROM v_rack_lookup
      WHERE kind = 'dumbbell' AND (gym_id IS NULL OR gym_id = fn_resolve_achievable_load_v2.gym_id)
      LIMIT 1;
      
      IF v_rack_config IS NOT NULL THEN
        -- Snap to rack configuration
        v_best_total := ROUND(desired_kg / v_rack_config.step) * v_rack_config.step;
        v_best_total := GREATEST(v_rack_config.min_weight, LEAST(v_rack_config.max_weight, v_best_total));
        
        v_best_implement := 'dumbbell';
        v_best_details := jsonb_build_object(
          'dumbbell_weight', v_best_total,
          'rack_min', v_rack_config.min_weight,
          'rack_max', v_rack_config.max_weight,
          'rack_step', v_rack_config.step,
          'unit', v_rack_config.unit
        );
      END IF;
    END;
  END IF;

  -- Build enhanced result
  v_result := jsonb_build_object(
    'implement', v_best_implement,
    'total_kg', v_best_total,
    'details', v_best_details,
    'source', v_resolution_config.resolution_source,
    'achievable', true,
    'residual_kg', v_best_total - desired_kg,
    'feature_version', 'v2',
    'gym_id', gym_id,
    'user_unit', user_unit
  );

  RETURN v_result;
END;
$$;

-- 6. Backfill existing data (idempotent)
-- Add unit column to workouts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='unit') THEN
    ALTER TABLE workouts ADD COLUMN unit text DEFAULT 'kg';
  END IF;
END $$;

-- Add resolution_source to workouts if it doesn't exist  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='resolution_source') THEN
    ALTER TABLE workouts ADD COLUMN resolution_source text;
  END IF;
END $$;

-- Infer workout unit where null (safe backfill)
UPDATE workouts 
SET unit = 'kg', resolution_source = 'backfill_inferred'
WHERE unit IS NULL OR unit = '';

-- 7. Add telemetry table for weight resolution tracking
CREATE TABLE IF NOT EXISTS weight_resolution_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  exercise_id uuid,
  gym_id uuid,
  desired_weight numeric,
  resolved_weight numeric,
  implement text,
  resolution_source text,
  feature_version text DEFAULT 'v1',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE weight_resolution_log ENABLE ROW LEVEL SECURITY;

-- Users can insert their own logs
CREATE POLICY "weight_resolution_log_insert_own" ON weight_resolution_log 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "weight_resolution_log_admin_view" ON weight_resolution_log 
FOR SELECT USING (is_admin(auth.uid()));