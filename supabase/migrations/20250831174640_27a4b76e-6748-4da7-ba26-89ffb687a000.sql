-- EMERGENCY FIX: Force drop old constraint and ensure only grip-aware constraint exists
-- The old constraint "personal_records_user_ex_kind_unique" is still active

-- 1) Force drop the old constraint that doesn't include grip_key
DO $$
BEGIN
  -- Try multiple potential old constraint names
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'personal_records' 
    AND c.conname = 'personal_records_user_ex_kind_unique'
  ) THEN
    ALTER TABLE public.personal_records 
    DROP CONSTRAINT personal_records_user_ex_kind_unique;
    RAISE NOTICE 'Dropped old constraint: personal_records_user_ex_kind_unique';
  END IF;

  -- Also check for any other old variants
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'personal_records' 
    AND c.conname LIKE '%user_ex_kind%'
    AND c.conname != 'personal_records_user_exercise_kind_grip_key'
  ) THEN
    EXECUTE 'ALTER TABLE public.personal_records DROP CONSTRAINT ' || 
      (SELECT c.conname FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       WHERE t.relname = 'personal_records' 
       AND c.conname LIKE '%user_ex_kind%'
       AND c.conname != 'personal_records_user_exercise_kind_grip_key'
       LIMIT 1);
  END IF;
END $$;

-- 2) Ensure we have the correct grip-aware constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'personal_records' 
    AND c.conname = 'personal_records_user_exercise_kind_grip_key'
  ) THEN
    ALTER TABLE public.personal_records 
    ADD CONSTRAINT personal_records_user_exercise_kind_grip_key 
    UNIQUE (user_id, exercise_id, kind, grip_key);
    RAISE NOTICE 'Added grip-aware constraint: personal_records_user_exercise_kind_grip_key';
  END IF;
END $$;