-- Create pre_workout_checkins table for tracking readiness quiz completion
CREATE TABLE IF NOT EXISTS public.pre_workout_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  readiness_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uniq_checkin_per_workout UNIQUE (workout_id)
);

-- Enable RLS
ALTER TABLE public.pre_workout_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies - restrict to owner
CREATE POLICY "Users can read their own checkins"
ON public.pre_workout_checkins
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins"
ON public.pre_workout_checkins
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins"
ON public.pre_workout_checkins
FOR UPDATE USING (auth.uid() = user_id);

-- Convenience view: does this workout have a checkin?
CREATE VIEW public.v_workout_has_checkin AS
  SELECT w.id as workout_id,
         EXISTS(SELECT 1 FROM public.pre_workout_checkins c WHERE c.workout_id = w.id) as has_checkin
  FROM public.workouts w;