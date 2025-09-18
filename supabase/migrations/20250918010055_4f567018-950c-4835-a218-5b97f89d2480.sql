-- Add description column to training_programs to match our interface
ALTER TABLE public.training_programs
ADD COLUMN description text;