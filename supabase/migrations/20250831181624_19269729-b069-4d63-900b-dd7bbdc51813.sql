-- Drop the existing trigger and recreate it properly
DROP TRIGGER IF EXISTS tr_upsert_prs_with_grips_after_set ON workout_sets;

-- Create the trigger
CREATE TRIGGER tr_upsert_prs_with_grips_after_set
AFTER INSERT OR UPDATE ON workout_sets
FOR EACH ROW
EXECUTE FUNCTION upsert_prs_with_grips_after_set();