-- Remove old weight/height columns from users table (if they exist)
DO $$ 
BEGIN
    -- Drop weight_kg column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' AND column_name='weight_kg' AND table_schema='public') THEN
        ALTER TABLE public.users DROP COLUMN weight_kg;
    END IF;
    
    -- Drop height_cm column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' AND column_name='height_cm' AND table_schema='public') THEN
        ALTER TABLE public.users DROP COLUMN height_cm;
    END IF;
    
    -- Drop weight column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' AND column_name='weight' AND table_schema='public') THEN
        ALTER TABLE public.users DROP COLUMN weight;
    END IF;
    
    -- Drop height column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' AND column_name='height' AND table_schema='public') THEN
        ALTER TABLE public.users DROP COLUMN height;
    END IF;
END $$;

-- Update exercises to set bodyweight_involvement_pct for dips
UPDATE public.exercises 
SET attribute_values_json = jsonb_set(
    COALESCE(attribute_values_json, '{}'::jsonb),
    '{bodyweight_involvement_pct}',
    '1.0'::jsonb,
    true
)
WHERE load_mode = 'bodyweight_plus_optional' 
  AND (lower(display_name) LIKE '%dip%' OR lower(slug) LIKE '%dip%');

-- Also update pull-ups and chin-ups if they exist
UPDATE public.exercises 
SET attribute_values_json = jsonb_set(
    COALESCE(attribute_values_json, '{}'::jsonb),
    '{bodyweight_involvement_pct}',
    '1.0'::jsonb,
    true
)
WHERE load_mode = 'bodyweight_plus_optional' 
  AND (lower(display_name) SIMILAR TO '%(pull-up|chin-up|pull up|chin up)%' 
       OR lower(slug) SIMILAR TO '%(pull-up|chin-up|pull_up|chin_up)%');