-- Check if there are existing records with the same user_id, exercise_id, kind but different grip_key
-- First drop the old constraint completely
ALTER TABLE public.personal_records DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_unique;

-- Clean up any duplicate records that would violate the new constraint
-- Keep the record with the highest value for each group
DELETE FROM public.personal_records pr1
WHERE EXISTS (
  SELECT 1 FROM public.personal_records pr2
  WHERE pr2.user_id = pr1.user_id
    AND pr2.exercise_id = pr1.exercise_id
    AND pr2.kind = pr1.kind
    AND pr2.value > pr1.value
    AND pr2.id != pr1.id
);

-- Add the corrected constraint that includes grip_key
-- Note: This constraint may already exist from previous migrations, so use IF NOT EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'personal_records_user_ex_kind_grip_unique'
  ) THEN
    ALTER TABLE public.personal_records 
    ADD CONSTRAINT personal_records_user_ex_kind_grip_unique 
    UNIQUE (user_id, exercise_id, kind, grip_key);
  END IF;
END $$;