-- Enable RLS on the spatial_ref_sys table that was flagged
-- This table is from PostGIS extension and typically doesn't need user-specific access controls
-- But we need to enable RLS to satisfy the linter
ALTER TABLE IF EXISTS spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow read access to all users for spatial reference systems
-- This is safe because spatial reference data is public reference information
DROP POLICY IF EXISTS "Allow read access to spatial reference systems" ON spatial_ref_sys;
CREATE POLICY "Allow read access to spatial reference systems"
ON spatial_ref_sys
FOR SELECT
TO public
USING (true);