-- Create exercise similarities table for curated exercise alternatives
CREATE TABLE IF NOT EXISTS public.exercise_similars (
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  similar_exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  reason text NULL,
  similarity_score numeric DEFAULT 0.8,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (exercise_id, similar_exercise_id)
);

-- Add RLS policies
ALTER TABLE public.exercise_similars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exercise similars are viewable by everyone" 
ON public.exercise_similars 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage exercise similars" 
ON public.exercise_similars 
FOR ALL 
USING (is_admin(auth.uid()));