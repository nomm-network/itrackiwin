-- Create movement_translations table
CREATE TABLE IF NOT EXISTS movement_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id uuid NOT NULL REFERENCES movements(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(movement_id, language_code)
);

-- Enable RLS
ALTER TABLE movement_translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "movement_translations_select_all" ON movement_translations FOR SELECT USING (true);
CREATE POLICY "movement_translations_admin_manage" ON movement_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Migrate existing data to translations table for English
INSERT INTO movement_translations (movement_id, language_code, name, description)
SELECT 
  id,
  'en',
  name,
  'Movement pattern for ' || LOWER(name) || ' exercises'
FROM movements
WHERE name IS NOT NULL
ON CONFLICT (movement_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Add Romanian translations
INSERT INTO movement_translations (movement_id, language_code, name, description)
VALUES 
  ((SELECT id FROM movements WHERE slug = 'squat'), 'ro', 'Genuflexiuni', 'Model de mișcare pentru exercițiile de genuflexiuni'),
  ((SELECT id FROM movements WHERE slug = 'hinge'), 'ro', 'Balama', 'Model de mișcare pentru exercițiile de balama șoldului'),
  ((SELECT id FROM movements WHERE slug = 'press'), 'ro', 'Împingere', 'Model de mișcare pentru exercițiile de împingere'),
  ((SELECT id FROM movements WHERE slug = 'pull'), 'ro', 'Tragere', 'Model de mișcare pentru exercițiile de tragere'),
  ((SELECT id FROM movements WHERE slug = 'row'), 'ro', 'Vâslire', 'Model de mișcare pentru exercițiile de vâslire')
ON CONFLICT (movement_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Create updated_at trigger
CREATE TRIGGER update_movement_translations_updated_at
  BEFORE UPDATE ON movement_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Now drop the name column from movements table
ALTER TABLE movements DROP COLUMN name;