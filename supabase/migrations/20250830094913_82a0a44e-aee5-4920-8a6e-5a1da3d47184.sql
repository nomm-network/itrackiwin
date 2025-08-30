-- Add slug column to movements table
ALTER TABLE movements ADD COLUMN slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX movements_slug_unique ON movements(slug) WHERE slug IS NOT NULL;

-- Add slug column to movement_translations table if it doesn't exist
ALTER TABLE movement_translations ADD COLUMN slug text;

-- Update movements with slugs based on existing names
UPDATE movements SET slug = public.slugify(name) WHERE name IS NOT NULL;

-- Update movement_translations with slugs based on existing names
UPDATE movement_translations SET slug = public.slugify(name) WHERE name IS NOT NULL;

-- Make slug required for movements going forward
ALTER TABLE movements ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint on movement_translations slug per language
CREATE UNIQUE INDEX movement_translations_slug_language_unique ON movement_translations(slug, language_code) WHERE slug IS NOT NULL;