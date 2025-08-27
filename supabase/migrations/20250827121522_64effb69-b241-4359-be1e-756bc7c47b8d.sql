-- Phase 1: Database Cleanup & Foundation

-- Task 1.1: Remove legacy name/description columns from base tables that have translations
-- (Only remove if they exist to avoid errors)

-- Check and remove name/description from exercises table (has exercises_translations)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema='public' AND table_name='exercises' AND column_name='name') THEN
    ALTER TABLE public.exercises DROP COLUMN name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema='public' AND table_name='exercises' AND column_name='description') THEN
    ALTER TABLE public.exercises DROP COLUMN description;
  END IF;
END$$;

-- Check and remove name/description from equipment table (has equipment_translations)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema='public' AND table_name='equipment' AND column_name='name') THEN
    ALTER TABLE public.equipment DROP COLUMN name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema='public' AND table_name='equipment' AND column_name='description') THEN
    ALTER TABLE public.equipment DROP COLUMN description;
  END IF;
END$$;

-- Task 1.2: Create user_exercise_estimates table for first-time exercise estimates
CREATE TABLE IF NOT EXISTS public.user_exercise_estimates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('rm1', 'rm5', 'rm10', 'rm15', 'bodyweight')),
  estimated_weight numeric NOT NULL,
  estimated_reps integer,
  unit text NOT NULL DEFAULT 'kg' CHECK (unit IN ('kg', 'lb')),
  confidence_level text DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Unique constraint: one estimate per user per exercise per type
  UNIQUE(user_id, exercise_id, type)
);

-- Enable RLS on user_exercise_estimates
ALTER TABLE public.user_exercise_estimates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_exercise_estimates
CREATE POLICY "Users can manage their own exercise estimates" 
ON public.user_exercise_estimates FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for user_exercise_estimates
CREATE TRIGGER update_user_exercise_estimates_updated_at
  BEFORE UPDATE ON public.user_exercise_estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_user_exercise_estimates_user_exercise 
ON public.user_exercise_estimates(user_id, exercise_id);

-- Seed some common handles if they don't exist (with proper slug uniqueness)
INSERT INTO public.handles (id, slug, category)
VALUES
  (gen_random_uuid(),'lat-pulldown-bar','bar'),
  (gen_random_uuid(),'cable-row-handle','handle'),
  (gen_random_uuid(),'tricep-rope','rope'),
  (gen_random_uuid(),'d-handle','handle')
ON CONFLICT (slug) DO NOTHING;