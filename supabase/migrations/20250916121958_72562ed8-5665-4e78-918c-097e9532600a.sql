-- Add 3 nullable columns to workouts table for program tracking
ALTER TABLE public.workouts
ADD COLUMN program_id uuid NULL REFERENCES public.training_programs(id),
ADD COLUMN program_position integer NULL,
ADD COLUMN program_template_id uuid NULL REFERENCES public.workout_templates(id);

-- Add unique constraints to training_program_blocks for data integrity
ALTER TABLE public.training_program_blocks
ADD CONSTRAINT training_program_blocks_program_order_unique UNIQUE (program_id, order_index),
ADD CONSTRAINT training_program_blocks_program_template_unique UNIQUE (program_id, workout_template_id);

-- Create user_program_progress table
CREATE TABLE IF NOT EXISTS public.user_program_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  last_position integer NOT NULL DEFAULT 0,
  last_workout_id uuid NULL REFERENCES public.workouts(id),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, program_id)
);

-- Enable RLS
ALTER TABLE public.user_program_progress ENABLE ROW LEVEL SECURITY;

-- RLS policy for user_program_progress
CREATE POLICY "Users can manage their own program progress"
  ON public.user_program_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RPC: Get next program template
CREATE OR REPLACE FUNCTION public.get_next_program_template(p_program_id uuid, p_user_id uuid)
RETURNS TABLE(template_id uuid, order_position integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_pos integer := 0;
  template_count integer;
  next_pos integer;
BEGIN
  -- Get last position from user_program_progress
  SELECT last_position INTO last_pos
  FROM public.user_program_progress
  WHERE user_id = p_user_id AND program_id = p_program_id;
  
  -- If no progress record, start from 0
  last_pos := COALESCE(last_pos, 0);
  
  -- Get total template count for this program
  SELECT COUNT(*) INTO template_count
  FROM public.training_program_blocks
  WHERE program_id = p_program_id;
  
  -- Calculate next position (1-indexed, wraps around)
  next_pos := (last_pos % template_count) + 1;
  
  -- Return the template for this position
  RETURN QUERY
  SELECT tpb.workout_template_id, next_pos
  FROM public.training_program_blocks tpb
  WHERE tpb.program_id = p_program_id
    AND tpb.order_index = next_pos
  LIMIT 1;
END;
$$;

-- RPC: Advance program progress
CREATE OR REPLACE FUNCTION public.advance_program_progress(p_program_id uuid, p_user_id uuid, p_position integer, p_workout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_program_progress (user_id, program_id, last_position, last_workout_id, updated_at)
  VALUES (p_user_id, p_program_id, p_position, p_workout_id, now())
  ON CONFLICT (user_id, program_id)
  DO UPDATE SET
    last_position = EXCLUDED.last_position,
    last_workout_id = EXCLUDED.last_workout_id,
    updated_at = EXCLUDED.updated_at;
END;
$$;