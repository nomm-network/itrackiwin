-- =========================================================
-- BRO COACH UPGRADE - COMBINED MIGRATION (FIXED)
-- =========================================================

-- ---------------------------------------------------------
-- A) EXPERIENCE LEVEL: UPDATE ENUM + CREATE CONFIG TABLE
-- ---------------------------------------------------------

-- 1) Update existing enum to match our desired values
-- First add missing values
ALTER TYPE public.experience_level ADD VALUE IF NOT EXISTS 'very_experienced';

-- Drop values we don't want (if possible) and add aliases in config
-- Since we can't easily drop enum values, we'll work with existing ones:
-- new, returning, intermediate, advanced, very_experienced

-- 2) Add new column on user_profile_fitness (nullable first)
DO $$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_profile_fitness' AND column_name='experience_level_enum'
  ) THEN
    ALTER TABLE public.user_profile_fitness
      ADD COLUMN experience_level_enum public.experience_level;
  END IF;
END$$;

-- 3) Map existing data to enum values
WITH m AS (
  SELECT
    upf.id AS upf_id,
    CASE LOWER(COALESCE(upf.experience_level, 'new'))
      WHEN 'new-to-fitness' THEN 'new'
      WHEN 'new' THEN 'new'
      WHEN 'returning' THEN 'returning'
      WHEN 'regular' THEN 'intermediate'  -- map regular to intermediate
      WHEN 'intermediate' THEN 'intermediate'
      WHEN 'advanced' THEN 'advanced'
      WHEN 'very-experienced' THEN 'very_experienced'
      WHEN 'very_experienced' THEN 'very_experienced'
      ELSE 'new'
    END::public.experience_level AS new_enum
  FROM public.user_profile_fitness upf
)
UPDATE public.user_profile_fitness upf
SET experience_level_enum = m.new_enum
FROM m
WHERE m.upf_id = upf.id
  AND upf.experience_level_enum IS NULL;

-- 4) Make the new enum required and drop old columns
ALTER TABLE public.user_profile_fitness
  ALTER COLUMN experience_level_enum SET NOT NULL;

-- Drop old columns if present
DO $$
BEGIN
  IF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_profile_fitness' AND column_name='experience_level_id'
  ) THEN
    ALTER TABLE public.user_profile_fitness
      DROP COLUMN experience_level_id;
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_profile_fitness' AND column_name='experience_level'
  ) THEN
    ALTER TABLE public.user_profile_fitness
      DROP COLUMN experience_level;
  END IF;
END$$;

-- 5) Create config table with current enum values
CREATE TABLE IF NOT EXISTS public.experience_level_configs (
  experience_level public.experience_level PRIMARY KEY,
  start_intensity_low numeric NOT NULL,
  start_intensity_high numeric NOT NULL,
  warmup_set_count_min smallint NOT NULL,
  warmup_set_count_max smallint NOT NULL,
  main_rest_seconds_min smallint NOT NULL,
  main_rest_seconds_max smallint NOT NULL,
  weekly_progress_pct numeric NOT NULL,
  allow_high_complexity boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert config values for existing enum values
INSERT INTO public.experience_level_configs (
  experience_level, start_intensity_low, start_intensity_high,
  warmup_set_count_min, warmup_set_count_max,
  main_rest_seconds_min, main_rest_seconds_max,
  weekly_progress_pct, allow_high_complexity
)
VALUES
  ('new', 0.4, 0.6, 2, 3, 90, 120, 0.05, false),
  ('returning', 0.5, 0.7, 2, 3, 120, 150, 0.075, false),
  ('intermediate', 0.6, 0.8, 1, 2, 150, 180, 0.1, true),
  ('advanced', 0.7, 0.85, 1, 2, 180, 210, 0.075, true),
  ('very_experienced', 0.75, 0.9, 1, 2, 180, 240, 0.05, true)
ON CONFLICT (experience_level) DO NOTHING;

-- 6) Rename enum column to final name
ALTER TABLE public.user_profile_fitness
  RENAME COLUMN experience_level_enum TO experience_level;

-- ---------------------------------------------------------
-- B) USER PRIORITIZED MUSCLE GROUPS (for smarter plans)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_prioritized_muscle_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muscle_group_id uuid NOT NULL REFERENCES public.muscle_groups(id) ON DELETE CASCADE,
  priority smallint NOT NULL CHECK (priority BETWEEN 1 AND 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, muscle_group_id)
);

-- ---------------------------------------------------------
-- C) SHARED GYM EQUIPMENT + GYM ADMINS
-- ---------------------------------------------------------

-- 1) Shared machines per public gym
CREATE TABLE IF NOT EXISTS public.gym_machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE RESTRICT,
  label text,
  stack_values numeric[] DEFAULT NULL,
  aux_increment numeric DEFAULT NULL,
  quantity smallint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(gym_id, equipment_id, label)
);

-- 2) Usage stats
CREATE TABLE IF NOT EXISTS public.gym_machine_usage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  usage_count bigint NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  UNIQUE (gym_id, equipment_id)
);

-- 3) Gym Admins
CREATE TABLE IF NOT EXISTS public.gym_admins (
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','manager')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (gym_id, user_id)
);

-- 4) Popular equipment view
CREATE OR REPLACE VIEW public.v_gym_popular_equipment AS
SELECT
  gmus.gym_id,
  gmus.equipment_id,
  gmus.usage_count
FROM public.gym_machine_usage_stats gmus;

-- ---------------------------------------------------------
-- D) TEMPLATE MACHINE PREFERENCE: SUPPORT SHARED GYM
-- ---------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='template_exercise_machine_pref' AND column_name='gym_machine_id'
  ) THEN
    ALTER TABLE public.template_exercise_machine_pref
      ADD COLUMN gym_machine_id uuid REFERENCES public.gym_machines(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Add XOR constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'template_machine_pref_exactly_one_ref'
  ) THEN
    ALTER TABLE public.template_exercise_machine_pref
      ADD CONSTRAINT template_machine_pref_exactly_one_ref
      CHECK (
        (user_gym_machine_id IS NULL) <> (gym_machine_id IS NULL)
      );
  END IF;
END$$;

-- ---------------------------------------------------------
-- E) UNIFIED VIEW FOR AVAILABLE EQUIPMENT
-- ---------------------------------------------------------
CREATE OR REPLACE VIEW public.v_available_equipment_for_user AS
WITH memberships AS (
  SELECT ugm.user_id, ugm.gym_id
  FROM public.user_gym_memberships ugm
),
shared AS (
  SELECT m.user_id, gm.gym_id, gm.id AS machine_id, gm.equipment_id, 'shared'::text AS source
  FROM memberships m
  JOIN public.gym_machines gm ON gm.gym_id = m.gym_id
),
personal AS (
  SELECT ug.user_id, null::uuid AS gym_id, ugm.id AS machine_id, ugm.equipment_id, 'personal'::text AS source
  FROM public.user_gyms ug
  JOIN public.user_gym_machines ugm ON ugm.user_gym_id = ug.id
)
SELECT * FROM shared
UNION ALL
SELECT * FROM personal;

-- ---------------------------------------------------------
-- F) TRANSLATIONS
-- ---------------------------------------------------------
INSERT INTO public.text_translations (key, language_code, value)
VALUES
  ('enum.experience_level.new', 'en', 'New to fitness'),
  ('enum.experience_level.returning', 'en', 'Returning after a break'),
  ('enum.experience_level.intermediate', 'en', 'Intermediate'),
  ('enum.experience_level.advanced', 'en', 'Advanced'),
  ('enum.experience_level.very_experienced', 'en', 'Very experienced')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------
-- G) INDEXES
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_gym_machines_gym ON public.gym_machines(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_machines_equipment ON public.gym_machines(equipment_id);
CREATE INDEX IF NOT EXISTS idx_user_prioritized_muscle_groups_user ON public.user_prioritized_muscle_groups(user_id);

-- ---------------------------------------------------------
-- H) RLS POLICIES
-- ---------------------------------------------------------

-- gym_machines
ALTER TABLE public.gym_machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym members can view machines" ON public.gym_machines
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_gym_memberships ugm 
    WHERE ugm.user_id = auth.uid() AND ugm.gym_id = gym_machines.gym_id
  )
);

CREATE POLICY "Gym admins can manage machines" ON public.gym_machines
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.gym_admins ga 
    WHERE ga.user_id = auth.uid() AND ga.gym_id = gym_machines.gym_id
  )
);

-- gym_admins
ALTER TABLE public.gym_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own admin roles" ON public.gym_admins
FOR SELECT
USING (user_id = auth.uid());

-- user_prioritized_muscle_groups
ALTER TABLE public.user_prioritized_muscle_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own muscle priorities" ON public.user_prioritized_muscle_groups
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- experience_level_configs
ALTER TABLE public.experience_level_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experience configs are readable by all authenticated users" ON public.experience_level_configs
FOR SELECT
TO authenticated
USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_experience_level_configs_updated_at
BEFORE UPDATE ON public.experience_level_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();