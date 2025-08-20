-- Fix RLS issue for workout_templates table
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;