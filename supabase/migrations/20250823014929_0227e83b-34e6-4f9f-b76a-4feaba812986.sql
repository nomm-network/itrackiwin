-- Create user_exercise_warmups table to track warmup preferences and feedback
CREATE TABLE IF NOT EXISTS public.user_exercise_warmups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  last_feedback JSONB,
  success_streak INTEGER DEFAULT 0,
  preferred_set_count INTEGER,
  preferred_intensity_adjustment NUMERIC(3,2),
  adaptation_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Enable RLS
ALTER TABLE public.user_exercise_warmups ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage their own warmup preferences" 
ON public.user_exercise_warmups 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_exercise_warmups_updated_at
BEFORE UPDATE ON public.user_exercise_warmups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_exercise_warmups_user_exercise 
ON public.user_exercise_warmups(user_id, exercise_id);

CREATE INDEX IF NOT EXISTS idx_user_exercise_warmups_updated_at 
ON public.user_exercise_warmups(updated_at);