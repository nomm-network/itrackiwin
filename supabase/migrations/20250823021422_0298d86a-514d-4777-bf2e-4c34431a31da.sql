-- Create injury constraints system for safe programming

-- Create severity enum for injuries
CREATE TYPE public.injury_severity AS ENUM (
  'mild',
  'moderate', 
  'severe',
  'chronic'
);

-- Create user_injuries join table to normalize injury data
CREATE TABLE public.user_injuries (
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
CREATE POLICY "Users can manage their own injuries"
  ON public.user_injuries
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add contraindications to exercises table
ALTER TABLE public.exercises 
ADD COLUMN contraindications jsonb DEFAULT '[]'::jsonb;

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

-- Add constraint for contraindications validation
ALTER TABLE public.exercises 
ADD CONSTRAINT valid_contraindications 
CHECK (validate_contraindications(contraindications));

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
      
      -- Check motion contraindications (for now, we'll be conservative)
      IF contraindication->>'type' = 'motion' THEN
        -- You could expand this with specific motion-to-body-part mappings
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

-- Create function to migrate existing injury data from user_fitness_profile
CREATE OR REPLACE FUNCTION migrate_existing_injuries()
RETURNS void AS $$
DECLARE
  profile_record RECORD;
  injury_item jsonb;
  body_part_slug text;
  body_part_uuid uuid;
BEGIN
  -- Migrate existing injury data if the injuries field exists and has data
  FOR profile_record IN 
    SELECT user_id, injuries 
    FROM public.user_fitness_profile 
    WHERE injuries IS NOT NULL AND injuries != '{}'::jsonb
  LOOP
    -- Handle different possible injury data structures
    IF jsonb_typeof(profile_record.injuries) = 'array' THEN
      -- Array of injury objects or strings
      FOR injury_item IN SELECT value FROM jsonb_array_elements(profile_record.injuries)
      LOOP
        IF jsonb_typeof(injury_item) = 'string' THEN
          -- Simple string injury (body part name)
          body_part_slug := injury_item #>> '{}';
        ELSIF injury_item ? 'body_part' THEN
          -- Object with body_part field
          body_part_slug := injury_item->>'body_part';
        ELSIF injury_item ? 'name' THEN
          -- Object with name field
          body_part_slug := injury_item->>'name';
        ELSE
          CONTINUE; -- Skip malformed entries
        END IF;
        
        -- Find body part by slug (approximate matching)
        SELECT id INTO body_part_uuid 
        FROM public.body_parts 
        WHERE slug ILIKE '%' || body_part_slug || '%' 
        LIMIT 1;
        
        -- Insert injury if body part found
        IF body_part_uuid IS NOT NULL THEN
          INSERT INTO public.user_injuries (user_id, body_part_id, notes, severity)
          VALUES (
            profile_record.user_id, 
            body_part_uuid,
            COALESCE(injury_item->>'notes', 'Migrated from profile'),
            COALESCE((injury_item->>'severity')::public.injury_severity, 'mild')
          )
          ON CONFLICT (user_id, body_part_id, is_active) DO NOTHING;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

-- Run the migration
SELECT migrate_existing_injuries();

-- Add some common exercise contraindications for popular exercises
UPDATE public.exercises 
SET contraindications = '[
  {"type": "body_part", "body_part_id": "' || bp.id || '", "severity": "moderate"}
]'::jsonb
FROM public.body_parts bp
WHERE bp.slug = 'lower-back' 
  AND (
    exercises.slug ILIKE '%deadlift%' OR
    exercises.slug ILIKE '%squat%' OR
    exercises.slug ILIKE '%row%'
  );

-- Add shoulder contraindications for overhead movements
UPDATE public.exercises 
SET contraindications = '[
  {"type": "body_part", "body_part_id": "' || bp.id || '", "severity": "mild"}
]'::jsonb
FROM public.body_parts bp
WHERE bp.slug ILIKE '%shoulder%' 
  AND (
    exercises.movement_pattern = 'vertical_push' OR
    exercises.slug ILIKE '%overhead%' OR
    exercises.slug ILIKE '%press%'
  );

-- Add knee contraindications for squatting movements
UPDATE public.exercises 
SET contraindications = '[
  {"type": "body_part", "body_part_id": "' || bp.id || '", "severity": "moderate"}
]'::jsonb  
FROM public.body_parts bp
WHERE bp.slug ILIKE '%knee%'
  AND exercises.movement_pattern IN ('squat', 'lunge');

-- Create updated_at trigger for user_injuries
CREATE TRIGGER update_user_injuries_updated_at
  BEFORE UPDATE ON public.user_injuries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_injuries_user_active ON public.user_injuries(user_id, is_active);
CREATE INDEX idx_user_injuries_body_part ON public.user_injuries(body_part_id);
CREATE INDEX idx_exercises_contraindications ON public.exercises USING gin(contraindications);

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

-- Drop the migration function as it's no longer needed
DROP FUNCTION IF EXISTS migrate_existing_injuries();