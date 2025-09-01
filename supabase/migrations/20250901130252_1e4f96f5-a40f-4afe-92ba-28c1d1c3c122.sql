BEGIN;

-- 1) Normalize grip_key so ON CONFLICT always targets the same value
ALTER TABLE public.personal_records
  ALTER COLUMN grip_key SET DEFAULT '',
  ALTER COLUMN grip_key DROP NOT NULL;    -- drop first in case it's set with NULLs
UPDATE public.personal_records SET grip_key = '' WHERE grip_key IS NULL;
ALTER TABLE public.personal_records
  ALTER COLUMN grip_key SET NOT NULL;

-- (If workout_sets has grip_key, normalize too; harmless if column absent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='workout_sets' AND column_name='grip_key'
  ) THEN
    EXECUTE $$UPDATE public.workout_sets SET grip_key = COALESCE(grip_key, '')$$;
    EXECUTE $$ALTER TABLE public.workout_sets
               ALTER COLUMN grip_key SET DEFAULT '',
               ALTER COLUMN grip_key SET NOT NULL$$;
  END IF;
END$$;

-- 2) Drop any legacy / deferrable / duplicate arbiters
ALTER TABLE public.personal_records
  DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_unique,
  DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_grip_unique,
  DROP CONSTRAINT IF EXISTS pr_user_ex_kind_grip_uniq;

-- Some migrations created unique indexes directly; drop them if present
DROP INDEX IF EXISTS pr_user_ex_kind_grip_idx;
DROP INDEX IF EXISTS personal_records_user_ex_kind_grip_idx;

-- 3) Create ONE non-deferrable unique index (what ON CONFLICT needs)
CREATE UNIQUE INDEX pr_user_ex_kind_grip_idx
  ON public.personal_records(user_id, exercise_id, kind, grip_key);

-- 4) Clean up duplicate/legacy triggers so only the grip-aware one remains
DROP TRIGGER IF EXISTS trg_upsert_prs_after_set          ON public.workout_sets;
DROP TRIGGER IF EXISTS upsert_prs_with_grips_trigger     ON public.workout_sets;
-- keep only one canonical trigger name; recreate if missing to be sure
DROP TRIGGER IF EXISTS tr_upsert_prs_with_grips_after_set ON public.workout_sets;

-- Reattach the good trigger to the existing grip-aware function
-- (function must already exist in your DB; this just wires it up cleanly)
CREATE TRIGGER tr_upsert_prs_with_grips_after_set
AFTER INSERT OR UPDATE ON public.workout_sets
FOR EACH ROW EXECUTE FUNCTION public.upsert_prs_with_grips_after_set();

COMMIT;