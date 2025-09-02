-- Add public column to workout_templates table
ALTER TABLE public.workout_templates 
ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Update RLS policies to allow viewing public templates
DROP POLICY IF EXISTS "Users can view their own templates" ON public.workout_templates;

CREATE POLICY "Users can view their own templates or public templates" 
ON public.workout_templates 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

-- Keep other policies the same
CREATE POLICY "Users can create their own templates" 
ON public.workout_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.workout_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.workout_templates 
FOR DELETE 
USING (auth.uid() = user_id);