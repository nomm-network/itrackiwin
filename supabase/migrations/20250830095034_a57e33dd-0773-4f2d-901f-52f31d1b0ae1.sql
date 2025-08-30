-- Add slug column to movements table
ALTER TABLE movements ADD COLUMN slug text;

-- Update movements with slugs based on existing names
UPDATE movements SET slug = public.slugify(name) WHERE name IS NOT NULL;

-- Make slug required for movements going forward
ALTER TABLE movements ALTER COLUMN slug SET NOT NULL;

-- Create unique index on slug
CREATE UNIQUE INDEX movements_slug_unique ON movements(slug);