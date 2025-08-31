-- CRITICAL FIX: Resolve workout set logging failure
-- Issue: Multiple conflicting triggers + old unique constraint causing 100% failure rate

BEGIN;

-- 1) Personal Records: enforce the grip-aware unique key ONLY
ALTER TABLE public.personal_records
  DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_unique,
  DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_unique1,
  DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_grip_unique;

ALTER TABLE public.personal_records
  ADD CONSTRAINT personal_records_user_ex_kind_grip_unique
  UNIQUE (user_id, exercise_id, kind, grip_key);

-- 2) Workout set triggers: remove obsolete/duplicate ones
DROP TRIGGER IF EXISTS trg_upsert_prs_after_set ON public.workout_sets;          -- ❌ old (no grip support)
DROP TRIGGER IF EXISTS upsert_prs_with_grips_trigger ON public.workout_sets;     -- ❌ duplicate

-- 3) Ensure only the correct trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'tr_upsert_prs_with_grips_after_set'
      AND tgrelid = 'public.workout_sets'::regclass
  ) THEN
    CREATE TRIGGER tr_upsert_prs_with_grips_after_set
    AFTER INSERT OR UPDATE ON public.workout_sets
    FOR EACH ROW EXECUTE FUNCTION public.upsert_prs_with_grips_after_set();
  END IF;
END$$;

-- 4) Clean up obsolete function that caused the conflicts
DROP FUNCTION IF EXISTS public.upsert_prs_after_set();

COMMIT;