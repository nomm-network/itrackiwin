-- Create injury constraints system for safe programming

-- Create severity enum for injuries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'injury_severity') THEN
    CREATE TYPE public.injury_severity AS ENUM (
      'mild',
      'moderate', 
      'severe',
      'chronic'
    );
  END IF;
END $$;

-- Create user_injuries join table to normalize injury data
CREATE TABLE IF NOT EXISTS public.user_injuries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  body_part_id uuid NOT NULL REFERENCES public.body_parts(id) ON DELETE CASCADE,
  notes text,
  severity public.injury_severity NOT NULL DEFAULT 'mild',
  diagnosed_at date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, body_part_id, is_active) -- Prevent duplicate active injuries per body part
);

-- Enable RLS on user_injuries
ALTER TABLE public.user_injuries ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_injuries
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can manage their own injuries" ON public.user_injuries;
  CREATE POLICY "Users can manage their own injuries"
    ON public.user_injuries
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Add contraindications to exercises table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exercises' 
    AND column_name = 'contraindications'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.exercises 
    ADD COLUMN contraindications jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create constraint to validate contraindications structure
CREATE OR REPLACE FUNCTION validate_contraindications(contraindications jsonb)
RETURNS boolean AS $$
DECLARE
  contraindication jsonb;
BEGIN
  -- If null or empty, it's valid
  IF contraindications IS NULL OR contraindications = '[]'::jsonb THEN
    RETURN true;
  END IF;
  
  -- Check each contraindication has required fields
  FOR contraindication IN SELECT value FROM jsonb_array_elements(contraindications)
  LOOP
    -- Must have type and either body_part_id or motion fields
    IF NOT (
      contraindication ? 'type' AND
      (contraindication ? 'body_part_id' OR contraindication ? 'motion')
    ) THEN
      RETURN false;
    END IF;
    
    -- Validate type is one of allowed values
    IF NOT (contraindication->>'type' IN ('body_part', 'motion', 'load_type', 'range_of_motion')) THEN
      RETURN false;
    END IF;
  END LOOP;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = 'public';

-- Add constraint for contraindications validation (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_contraindications'
    AND table_name = 'exercises'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.exercises 
    ADD CONSTRAINT valid_contraindications 
    CHECK (validate_contraindications(contraindications));
  END IF;
END $$;

-- Create injury-safe exercise filtering function
CREATE OR REPLACE FUNCTION filter_exercises_by_injuries(
  p_user_id uuid,
  p_exercise_ids uuid[] DEFAULT NULL
)
RETURNS TABLE(
  exercise_id uuid,
  is_safe boolean,
  contraindication_reasons text[]
) AS $$
DECLARE
  user_injury_parts uuid[];
  exercise_record RECORD;
  contraindication jsonb;
  reasons text[];
  is_exercise_safe boolean;
BEGIN
  -- Get user's active injured body parts
  SELECT array_agg(DISTINCT body_part_id) INTO user_injury_parts
  FROM public.user_injuries 
  WHERE user_id = p_user_id AND is_active = true;
  
  -- If no injuries, all exercises are safe
  IF user_injury_parts IS NULL THEN
    IF p_exercise_ids IS NOT NULL THEN
      RETURN QUERY
      SELECT id, true, ARRAY[]::text[]
      FROM public.exercises 
      WHERE id = ANY(p_exercise_ids);
    ELSE
      RETURN QUERY
      SELECT id, true, ARRAY[]::text[]
      FROM public.exercises;
    END IF;
    RETURN;
  END IF;
  
  -- Check each exercise against user's injuries
  FOR exercise_record IN 
    SELECT id, contraindications
    FROM public.exercises 
    WHERE (p_exercise_ids IS NULL OR id = ANY(p_exercise_ids))
  LOOP
    is_exercise_safe := true;
    reasons := ARRAY[]::text[];
    
    -- Check contraindications against user injuries
    FOR contraindication IN 
      SELECT value FROM jsonb_array_elements(COALESCE(exercise_record.contraindications, '[]'::jsonb))
    LOOP
      -- Check body part contraindications
      IF contraindication->>'type' = 'body_part' THEN
        IF (contraindication->>'body_part_id')::uuid = ANY(user_injury_parts) THEN
          is_exercise_safe := false;
          reasons := array_append(reasons, 
            format('Contraindicated for injured %s', 
              (SELECT slug FROM public.body_parts WHERE id = (contraindication->>'body_part_id')::uuid)
            )
          );
        END IF;
      END IF;
      
      -- Check motion contraindications
      IF contraindication->>'type' = 'motion' THEN
        is_exercise_safe := false;
        reasons := array_append(reasons, 
          format('Motion contraindication: %s', contraindication->>'motion')
        );
      END IF;
    END LOOP;
    
    exercise_id := exercise_record.id;
    is_safe := is_exercise_safe;
    contraindication_reasons := reasons;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = 'public';

-- Create function to add contraindications properly
CREATE OR REPLACE FUNCTION add_exercise_contraindications()
RETURNS void AS $$
DECLARE
  lower_back_id uuid;
  shoulder_id uuid;
  knee_id uuid;
BEGIN
  -- Get body part IDs
  SELECT id INTO lower_back_id FROM public.body_parts WHERE slug ILIKE '%lower%back%' OR slug ILIKE '%lumbar%' LIMIT 1;
  SELECT id INTO shoulder_id FROM public.body_parts WHERE slug ILIKE '%shoulder%' LIMIT 1;
  SELECT id INTO knee_id FROM public.body_parts WHERE slug ILIKE '%knee%' LIMIT 1;
  
  -- Add lower back contraindications for deadlifts, squats, rows
  IF lower_back_id IS NOT NULL THEN
    UPDATE public.exercises 
    SET contraindications = jsonb_build_array(
      jsonb_build_object(
        'type', 'body_part',
        'body_part_id', lower_back_id,
        'severity', 'moderate'
      )
    )
    WHERE (
      slug ILIKE '%deadlift%' OR
      slug ILIKE '%squat%' OR
      slug ILIKE '%row%'
    ) AND contraindications = '[]'::jsonb;
  END IF;
  
  -- Add shoulder contraindications for overhead movements
  IF shoulder_id IS NOT NULL THEN
    UPDATE public.exercises 
    SET contraindications = jsonb_build_array(
      jsonb_build_object(
        'type', 'body_part',
        'body_part_id', shoulder_id,
        'severity', 'mild'
      )
    )
    WHERE (
      movement_pattern = 'vertical_push' OR
      slug ILIKE '%overhead%' OR
      (slug ILIKE '%press%' AND slug NOT ILIKE '%bench%')
    ) AND contraindications = '[]'::jsonb;
  END IF;
  
  -- Add knee contraindications for squatting movements
  IF knee_id IS NOT NULL THEN
    UPDATE public.exercises 
    SET contraindications = jsonb_build_array(
      jsonb_build_object(
        'type', 'body_part',
        'body_part_id', knee_id,
        'severity', 'moderate'
      )
    )
    WHERE movement_pattern IN ('squat', 'lunge') 
      AND contraindications = '[]'::jsonb;
  END IF;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

-- Run the contraindications setup
SELECT add_exercise_contraindications();

-- Create updated_at trigger for user_injuries if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_user_injuries_updated_at'
    AND event_object_table = 'user_injuries'
  ) THEN
    CREATE TRIGGER update_user_injuries_updated_at
      BEFORE UPDATE ON public.user_injuries
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_injuries_user_active ON public.user_injuries(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_injuries_body_part ON public.user_injuries(body_part_id);
CREATE INDEX IF NOT EXISTS idx_exercises_contraindications ON public.exercises USING gin(contraindications);

-- Create view for injury-safe exercises per user
CREATE OR REPLACE VIEW public.v_safe_exercises_for_user AS
SELECT 
  e.id,
  e.name,
  e.slug,
  e.movement_pattern,
  e.exercise_skill_level,
  e.complexity_score,
  e.contraindications,
  CASE 
    WHEN auth.uid() IS NULL THEN true -- No user context, assume safe
    WHEN NOT EXISTS (
      SELECT 1 FROM public.user_injuries ui 
      WHERE ui.user_id = auth.uid() AND ui.is_active = true
    ) THEN true -- No active injuries
    ELSE (
      SELECT is_safe 
      FROM public.filter_exercises_by_injuries(auth.uid(), ARRAY[e.id]) 
      WHERE exercise_id = e.id
    )
  END as is_safe_for_user
FROM public.exercises e
WHERE e.is_public = true OR e.owner_user_id = auth.uid();

-- Grant permissions
GRANT SELECT ON public.v_safe_exercises_for_user TO authenticated;

-- Clean up
DROP FUNCTION IF EXISTS add_exercise_contraindications();