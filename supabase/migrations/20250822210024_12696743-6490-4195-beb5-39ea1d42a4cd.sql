-- Create new user fitness profile table with structured data
CREATE TABLE public.user_fitness_profile (
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
CREATE INDEX idx_user_fitness_profile_focus 
ON public.user_fitness_profile (training_focus, primary_weight_goal);

-- Create training focus presets table (admin-editable)
CREATE TABLE public.training_focus_presets (
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

-- Enable RLS for presets
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

-- Create weight goal tuning table (optional adjustments)
CREATE TABLE public.weight_goal_tuning (
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

-- Create trigger for updated_at
CREATE TRIGGER update_user_fitness_profile_updated_at
BEFORE UPDATE ON public.user_fitness_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_focus_presets_updated_at
BEFORE UPDATE ON public.training_focus_presets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();