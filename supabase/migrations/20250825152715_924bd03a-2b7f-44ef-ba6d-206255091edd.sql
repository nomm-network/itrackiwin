-- Add rep ranges to template_exercises
ALTER TABLE public.template_exercises 
ADD COLUMN IF NOT EXISTS target_rep_min integer,
ADD COLUMN IF NOT EXISTS target_rep_max integer;

-- Track pre-workout check-ins
CREATE TABLE IF NOT EXISTS public.preworkout_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workout_id uuid NULL,
  is_sick boolean NOT NULL DEFAULT false,
  slept_poorly boolean NOT NULL DEFAULT false,
  low_energy boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Women's cycle tracking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sex text CHECK (sex IN ('male','female','other')) DEFAULT null,
ADD COLUMN IF NOT EXISTS cycle_tracking_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.cycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_date date NOT NULL,
  kind text NOT NULL CHECK (kind IN ('period_start','period_end')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add pain tracking to workout_sets if not exists
ALTER TABLE public.workout_sets 
ADD COLUMN IF NOT EXISTS had_pain boolean NOT NULL DEFAULT false;

-- Enable RLS
ALTER TABLE public.preworkout_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for preworkout_checkins
CREATE POLICY "Users can manage their own checkins" 
ON public.preworkout_checkins 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for cycle_events
CREATE POLICY "Users can manage their own cycle events" 
ON public.cycle_events 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.preworkout_checkins 
ADD CONSTRAINT fk_preworkout_checkins_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.preworkout_checkins 
ADD CONSTRAINT fk_preworkout_checkins_workout_id 
FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;

ALTER TABLE public.cycle_events 
ADD CONSTRAINT fk_cycle_events_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;