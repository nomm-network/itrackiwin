-- Remove category column from handles table since we now use handle_equipment_rules
ALTER TABLE handles DROP COLUMN IF EXISTS category;

-- Drop the category check constraint if it exists
ALTER TABLE handles DROP CONSTRAINT IF EXISTS handles_category_check;