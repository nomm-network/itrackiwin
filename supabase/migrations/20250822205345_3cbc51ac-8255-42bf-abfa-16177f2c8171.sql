-- Create enums for structured fitness data
DO $$ BEGIN
  CREATE TYPE training_focus AS ENUM ('muscle','strength','general','power');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE primary_weight_goal AS ENUM ('lose','maintain','recomp','gain');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE experience_level AS ENUM ('new','returning','intermediate','advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE progression_model AS ENUM ('double_progression','linear_load','rep_targets','percent_1rm','rpe_based');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create new user fitness profile table with structured data
CREATE TABLE IF NOT EXISTS public.user_fitness_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_weight_goal primary_weight_goal NOT NULL DEFAULT 'recomp',
  training_focus training_focus NOT NULL DEFAULT 'muscle',
  experience experience_level NOT NULL DEFAULT 'returning',
  days_per_week SMALLINT NOT NULL DEFAULT 3 CHECK (days_per_week BETWEEN 1 AND 7),
  preferred_session_minutes SMALLINT NOT NULL DEFAULT 60 CHECK (preferred_session_minutes BETWEEN 20 AND 180),
  bodyweight NUMERIC NULL,
  height_cm NUMERIC NULL,
  injuries JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_fitness_profile ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY user_fitness_profile_rw
ON public.user_fitness_profile
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create index for engine lookups
CREATE INDEX IF NOT EXISTS idx_user_fitness_profile_focus 
ON public.user_fitness_profile (training_focus, primary_weight_goal);

-- Create training focus presets table (admin-editable)
CREATE TABLE IF NOT EXISTS public.training_focus_presets (
  id SERIAL PRIMARY KEY,
  focus training_focus NOT NULL UNIQUE,
  rep_min SMALLINT NOT NULL,
  rep_max SMALLINT NOT NULL,
  pct1rm_min NUMERIC NOT NULL,   -- e.g., 0.65
  pct1rm_max NUMERIC NOT NULL,   -- e.g., 0.80
  rest_main_min SMALLINT NOT NULL,  -- seconds
  rest_main_max SMALLINT NOT NULL,
  warmup_pattern JSONB NOT NULL,    -- e.g., {"steps":[{"pct":0.35,"reps":10},{"pct":0.55,"reps":8},{"pct":0.7,"reps":5},{"pct":0.85,"reps":2}]}
  progression progression_model NOT NULL DEFAULT 'double_progression',
  weekly_sets_per_muscle_min SMALLINT NOT NULL DEFAULT 10,
  weekly_sets_per_muscle_max SMALLINT NOT NULL DEFAULT 20,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for presets (admins can manage)
ALTER TABLE public.training_focus_presets ENABLE ROW LEVEL SECURITY;

-- Create policies for presets
CREATE POLICY training_focus_presets_select_all
ON public.training_focus_presets
FOR SELECT 
USING (true);

CREATE POLICY training_focus_presets_admin_manage
ON public.training_focus_presets
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Seed default presets
INSERT INTO public.training_focus_presets (focus, rep_min, rep_max, pct1rm_min, pct1rm_max, rest_main_min, rest_main_max, warmup_pattern, progression)
VALUES
('muscle',   6, 12, 0.65, 0.80, 60,  90,  '{"steps":[{"pct":0.35,"reps":10},{"pct":0.55,"reps":8},{"pct":0.7,"reps":5}]}'::jsonb, 'double_progression'),
('strength', 1, 5,  0.80, 0.95, 150, 300, '{"steps":[{"pct":0.40,"reps":5},{"pct":0.60,"reps":3},{"pct":0.75,"reps":2},{"pct":0.85,"reps":1}]}'::jsonb, 'percent_1rm'),
('general',  12,20, 0.50, 0.65, 30,  60,  '{"steps":[{"pct":0.30,"reps":12},{"pct":0.50,"reps":10}]}'::jsonb, 'rep_targets'),
('power',    3, 6,  0.70, 0.85, 120, 180, '{"steps":[{"pct":0.40,"reps":5},{"pct":0.60,"reps":3},{"pct":0.75,"reps":2}]}'::jsonb, 'percent_1rm')
ON CONFLICT (focus) DO NOTHING;

-- Create weight goal tuning table (optional adjustments)
CREATE TABLE IF NOT EXISTS public.weight_goal_tuning (
  goal primary_weight_goal PRIMARY KEY,
  rest_multiplier NUMERIC NOT NULL DEFAULT 1.0,    -- e.g., lose: 0.85 (shorter rest)
  volume_multiplier NUMERIC NOT NULL DEFAULT 1.0,  -- e.g., gain: 1.05
  intensity_shift NUMERIC NOT NULL DEFAULT 0.0     -- +0.02 moves %1RM up by 2 pts
);

-- Enable RLS for goal tuning
ALTER TABLE public.weight_goal_tuning ENABLE ROW LEVEL SECURITY;

-- Create policies for goal tuning
CREATE POLICY weight_goal_tuning_select_all
ON public.weight_goal_tuning
FOR SELECT 
USING (true);

CREATE POLICY weight_goal_tuning_admin_manage
ON public.weight_goal_tuning
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Seed default goal tuning
INSERT INTO public.weight_goal_tuning(goal, rest_multiplier, volume_multiplier, intensity_shift) 
VALUES
('lose',     0.85, 1.00, -0.02),
('maintain', 1.00, 1.00,  0.00),
('recomp',   0.95, 1.00,  0.00),
('gain',     1.00, 1.05,  0.01)
ON CONFLICT (goal) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_user_fitness_profile_updated_at
BEFORE UPDATE ON public.user_fitness_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_focus_presets_updated_at
BEFORE UPDATE ON public.training_focus_presets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data from user_profile_fitness to user_fitness_profile
INSERT INTO public.user_fitness_profile (
  user_id,
  primary_weight_goal,
  training_focus,
  experience,
  days_per_week,
  preferred_session_minutes,
  bodyweight,
  height_cm,
  injuries,
  created_at,
  updated_at
)
SELECT 
  user_id,
  CASE 
    WHEN goal = 'lose' THEN 'lose'::primary_weight_goal
    WHEN goal = 'maintain' THEN 'maintain'::primary_weight_goal
    WHEN goal = 'body_recomposition' THEN 'recomp'::primary_weight_goal
    WHEN goal = 'gain' THEN 'gain'::primary_weight_goal
    ELSE 'recomp'::primary_weight_goal
  END,
  CASE 
    WHEN training_goal = 'hypertrophy' THEN 'muscle'::training_focus
    WHEN training_goal = 'strength' THEN 'strength'::training_focus
    WHEN training_goal = 'conditioning' THEN 'general'::training_focus
    ELSE 'muscle'::training_focus
  END,
  CASE 
    WHEN experience_level = 'new' THEN 'new'::experience_level
    WHEN experience_level = 'returning' THEN 'returning'::experience_level
    WHEN experience_level = 'intermediate' THEN 'intermediate'::experience_level
    WHEN experience_level = 'advanced' THEN 'advanced'::experience_level
    ELSE 'returning'::experience_level
  END,
  days_per_week,
  preferred_session_minutes,
  bodyweight,
  height_cm,
  injuries,
  created_at,
  updated_at
FROM public.user_profile_fitness
ON CONFLICT (user_id) DO UPDATE SET
  primary_weight_goal = EXCLUDED.primary_weight_goal,
  training_focus = EXCLUDED.training_focus,
  experience = EXCLUDED.experience,
  days_per_week = EXCLUDED.days_per_week,
  preferred_session_minutes = EXCLUDED.preferred_session_minutes,
  bodyweight = EXCLUDED.bodyweight,
  height_cm = EXCLUDED.height_cm,
  injuries = EXCLUDED.injuries,
  updated_at = EXCLUDED.updated_at;