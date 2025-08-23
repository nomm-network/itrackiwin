-- 5.1 Sex & body metrics
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sex text CHECK (sex IN ('male','female','other')) NULL,
ADD COLUMN IF NOT EXISTS height_cm numeric NULL,
ADD COLUMN IF NOT EXISTS weight_kg numeric NULL;

-- 5.2 Prioritized muscles
CREATE TABLE IF NOT EXISTS public.user_muscle_priorities (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muscle_id uuid NOT NULL REFERENCES public.muscles(id) ON DELETE CASCADE,
  priority_level smallint NOT NULL CHECK(priority_level BETWEEN 1 AND 5), -- 5 highest
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, muscle_id)
);

-- Enable RLS on user_muscle_priorities (if not already enabled)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_muscle_priorities' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_muscle_priorities ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 5.3 Warm-up presets stored compact
CREATE TABLE IF NOT EXISTS public.user_exercise_warmups (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  pretty_text text NOT NULL, -- "w1: 25kg x 10 ..."
  source jsonb NOT NULL DEFAULT '{}'::jsonb, -- machine/1RM/ref weight used to build it
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, exercise_id)
);

-- Enable RLS on user_exercise_warmups (if not already enabled)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_exercise_warmups' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_exercise_warmups ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 5.4 Warm-up feedback summary
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'warmup_quality') THEN
    CREATE TYPE public.warmup_quality AS ENUM ('not_enough','excellent','too_much');
  END IF;
END $$;

ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS warmup_quality public.warmup_quality NULL;

-- 5.5 Set-level "feel" (compact) - Add settings column if not exists
ALTER TABLE public.workout_sets 
ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Add GIN index for settings queries
CREATE INDEX IF NOT EXISTS idx_workout_sets_settings_gin 
ON public.workout_sets USING gin (settings);

-- RPC function to upsert user exercise warmup
CREATE OR REPLACE FUNCTION public.upsert_user_exercise_warmup(
  p_exercise_id uuid,
  p_pretty_text text,
  p_source jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.user_exercise_warmups (user_id, exercise_id, pretty_text, source, updated_at)
  VALUES (v_user_id, p_exercise_id, p_pretty_text, p_source, now())
  ON CONFLICT (user_id, exercise_id)
  DO UPDATE SET 
    pretty_text = EXCLUDED.pretty_text,
    source = EXCLUDED.source,
    updated_at = EXCLUDED.updated_at;

  RETURN p_exercise_id;
END;
$$;