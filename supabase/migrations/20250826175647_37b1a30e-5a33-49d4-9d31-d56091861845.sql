-- Create warmup feedback preferences table
CREATE TABLE IF NOT EXISTS public.user_exercise_warmup_prefs (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id),
  ease_bias integer NOT NULL DEFAULT 0, -- -2..+2
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, exercise_id)
);

-- Enable RLS
ALTER TABLE public.user_exercise_warmup_prefs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own warmup preferences" 
ON public.user_exercise_warmup_prefs 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RPC to upsert warmup bias
CREATE OR REPLACE FUNCTION public.upsert_warmup_bias(
  p_user_id uuid,
  p_exercise_id uuid,
  p_delta integer
) RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_exercise_warmup_prefs (user_id, exercise_id, ease_bias, updated_at)
  VALUES (p_user_id, p_exercise_id, p_delta, now())
  ON CONFLICT (user_id, exercise_id)
  DO UPDATE SET 
    ease_bias = LEAST(2, GREATEST(-2, user_exercise_warmup_prefs.ease_bias + p_delta)),
    updated_at = now();
END;
$$;