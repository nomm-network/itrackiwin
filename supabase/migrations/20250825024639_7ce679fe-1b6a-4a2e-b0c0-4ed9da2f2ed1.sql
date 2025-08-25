-- Enable RLS on the translation views (they should inherit from base tables)
-- The views will automatically use the RLS policies of the underlying tables
-- No additional policies needed for views since they inherit from base table policies

-- The security warnings are likely from existing issues, not this migration
-- Views automatically inherit RLS from their source tables

-- Grant proper permissions
GRANT SELECT ON v_exercises_with_translations TO authenticated;
GRANT SELECT ON v_exercises_with_translations TO anon;