BEGIN;

-- First, let's see what constraints and indexes exist
-- Drop ALL unique constraints on personal_records
DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Drop all unique constraints
  FOR rec IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.personal_records'::regclass 
    AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE public.personal_records DROP CONSTRAINT %I', rec.conname);
  END LOOP;
  
  -- Drop all unique indexes
  FOR rec IN
    SELECT indexname
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'personal_records'
    AND indexdef LIKE '%UNIQUE%'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I', rec.indexname);
  END LOOP;
END$$;

-- Normalize grip_key first
ALTER TABLE public.personal_records
  ALTER COLUMN grip_key SET DEFAULT '';
UPDATE public.personal_records SET grip_key = '' WHERE grip_key IS NULL;
ALTER TABLE public.personal_records
  ALTER COLUMN grip_key SET NOT NULL;

-- Create the one and only non-deferrable unique index
CREATE UNIQUE INDEX pr_user_ex_kind_grip_idx
  ON public.personal_records(user_id, exercise_id, kind, grip_key);

-- Clean up all PR triggers
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'public.workout_sets'::regclass
    AND NOT tgisinternal
    AND (tgname ILIKE '%prs%' OR tgname ILIKE '%personal%')
  LOOP
    EXECUTE format('DROP TRIGGER %I ON public.workout_sets', rec.tgname);
  END LOOP;
END$$;

-- Recreate the correct trigger
CREATE TRIGGER tr_upsert_prs_with_grips_after_set
AFTER INSERT OR UPDATE ON public.workout_sets
FOR EACH ROW EXECUTE FUNCTION public.upsert_prs_with_grips_after_set();

COMMIT;