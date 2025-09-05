-- Add favorite system for workout templates

-- Add favorite boolean to workout_templates table
ALTER TABLE public.workout_templates 
ADD COLUMN IF NOT EXISTS favorite BOOLEAN NOT NULL DEFAULT false;

-- Create user_favorite_templates table for per-user favorites
CREATE TABLE IF NOT EXISTS public.user_favorite_templates (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, template_id)
);

-- Enable RLS on user_favorite_templates
ALTER TABLE public.user_favorite_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for user_favorite_templates
CREATE POLICY "Users can manage their own favorite templates" 
ON public.user_favorite_templates 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance on user favorites lookup
CREATE INDEX IF NOT EXISTS idx_user_favorite_templates_user_id 
ON public.user_favorite_templates(user_id);

CREATE INDEX IF NOT EXISTS idx_user_favorite_templates_template_id 
ON public.user_favorite_templates(template_id);