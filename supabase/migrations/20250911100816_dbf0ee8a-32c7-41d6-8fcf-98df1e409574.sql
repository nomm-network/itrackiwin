-- Step 10: Rollout & Migration Hardening (Simplified and Fixed)

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

-- 2. Helper function to check feature flag
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

-- 3. Backfill existing data (idempotent)
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

-- 4. Add telemetry table for weight resolution tracking
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