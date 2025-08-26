-- Create table for user exercise estimates
CREATE TABLE IF NOT EXISTS public.user_exercise_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  rep_target SMALLINT NOT NULL DEFAULT 10,
  est_weight_kg NUMERIC NOT NULL,
  source TEXT DEFAULT 'quick_estimate',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, exercise_id, rep_target)
);

-- Enable RLS
ALTER TABLE public.user_exercise_estimates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own exercise estimates" 
ON public.user_exercise_estimates 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER trg_user_exercise_estimates_updated
BEFORE UPDATE ON public.user_exercise_estimates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();