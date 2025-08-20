-- Create table for user exercise preferences (grips, settings per exercise in templates)
CREATE TABLE public.template_exercise_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_exercise_id uuid NOT NULL,
  user_id uuid NOT NULL,
  preferred_grips jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(template_exercise_id, user_id)
);

-- Enable RLS
ALTER TABLE public.template_exercise_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access only
CREATE POLICY "template_exercise_preferences_per_user_select"
ON public.template_exercise_preferences
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "template_exercise_preferences_per_user_mutate"
ON public.template_exercise_preferences
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_template_exercise_preferences_updated_at
BEFORE UPDATE ON public.template_exercise_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();