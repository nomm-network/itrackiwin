-- Drop existing check constraints that are too restrictive
ALTER TABLE public.readiness_checkins DROP CONSTRAINT IF EXISTS readiness_checkins_energy_check;
ALTER TABLE public.readiness_checkins DROP CONSTRAINT IF EXISTS readiness_checkins_sleep_quality_check;
ALTER TABLE public.readiness_checkins DROP CONSTRAINT IF EXISTS readiness_checkins_soreness_check;
ALTER TABLE public.readiness_checkins DROP CONSTRAINT IF EXISTS readiness_checkins_stress_check;

-- Add new constraints that allow values from 0 to 10
ALTER TABLE public.readiness_checkins ADD CONSTRAINT readiness_checkins_energy_check 
  CHECK (energy >= 0 AND energy <= 10);

ALTER TABLE public.readiness_checkins ADD CONSTRAINT readiness_checkins_sleep_quality_check 
  CHECK (sleep_quality >= 0 AND sleep_quality <= 10);

ALTER TABLE public.readiness_checkins ADD CONSTRAINT readiness_checkins_soreness_check 
  CHECK (soreness >= 0 AND soreness <= 10);

ALTER TABLE public.readiness_checkins ADD CONSTRAINT readiness_checkins_stress_check 
  CHECK (stress >= 0 AND stress <= 10);