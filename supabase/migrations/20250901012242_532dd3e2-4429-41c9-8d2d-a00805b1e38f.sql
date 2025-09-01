-- Add configured column to equipment, handles, and exercises tables
ALTER TABLE equipment ADD COLUMN configured boolean NOT NULL DEFAULT false;
ALTER TABLE handles ADD COLUMN configured boolean NOT NULL DEFAULT false;
ALTER TABLE exercises ADD COLUMN configured boolean NOT NULL DEFAULT false;

-- Add indexes for better performance on configured filters
CREATE INDEX idx_equipment_configured ON equipment(configured);
CREATE INDEX idx_handles_configured ON handles(configured);
CREATE INDEX idx_exercises_configured ON exercises(configured);