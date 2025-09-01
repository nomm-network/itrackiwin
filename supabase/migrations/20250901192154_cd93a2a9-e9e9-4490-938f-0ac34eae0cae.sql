-- Add missing created_at column to template_exercises table
ALTER TABLE public.template_exercises 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();