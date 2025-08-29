-- Add exercise_aliases table for better search
CREATE TABLE IF NOT EXISTS public.exercise_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (exercise_id, alias)
);

-- Enable RLS
ALTER TABLE public.exercise_aliases ENABLE ROW LEVEL SECURITY;

-- Create policies for exercise_aliases
CREATE POLICY "exercise_aliases_select_all" 
ON public.exercise_aliases 
FOR SELECT 
USING (true);

CREATE POLICY "exercise_aliases_admin_manage" 
ON public.exercise_aliases 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add tags column to exercises for search facets
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add visibility column to attribute_schemas for membership gating
ALTER TABLE public.attribute_schemas 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'general' CHECK (visibility IN ('general', 'pro_only', 'deprecated'));

-- Update existing attribute schemas to deprecate angle-based attributes that change prime movers
UPDATE public.attribute_schemas 
SET visibility = 'deprecated', is_active = false 
WHERE title ILIKE '%angle%' OR title ILIKE '%incline%' OR title ILIKE '%decline%';

-- Add user features for membership gating
CREATE TABLE IF NOT EXISTS public.user_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_features ENABLE ROW LEVEL SECURITY;

-- Create policies for user_features
CREATE POLICY "user_features_own_access" 
ON public.user_features 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercise_aliases_exercise_id ON public.exercise_aliases(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_aliases_alias ON public.exercise_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_exercises_tags ON public.exercises USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_features_user_id ON public.user_features(user_id);