-- Script 2: Root-cause fix (clean constraints + keep a single grip-aware trigger)

-- 2.1 Clean up all PR triggers & the old function if it exists
DROP TRIGGER IF EXISTS trg_upsert_prs_after_set              ON public.workout_sets;
DROP TRIGGER IF EXISTS upsert_prs_with_grips_trigger         ON public.workout_sets;
DROP TRIGGER IF EXISTS tr_upsert_prs_with_grips_after_set    ON public.workout_sets;
DROP FUNCTION IF EXISTS public.upsert_prs_after_set();

-- 2.2 Normalize unique constraint on personal_records to be grip-aware (idempotent)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM   pg_constraint
    WHERE  conrelid = 'public.personal_records'::regclass
    AND    contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE public.personal_records DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END$$;

-- Create a single, explicit UNIQUE on the 4-key tuple
ALTER TABLE public.personal_records
  ADD CONSTRAINT pr_user_ex_kind_grip_uniq
  UNIQUE (user_id, exercise_id, kind, grip_key);