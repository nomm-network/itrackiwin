BEGIN;

-- 0) Lock the two tables we touch
LOCK TABLE public.personal_records IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.workout_sets     IN SHARE ROW EXCLUSIVE MODE;

-- 1) Drop any legacy/duplicate PR uniqueness constraints or indexes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.personal_records'::regclass
      AND conname  = 'personal_records_user_ex_kind_unique'
  ) THEN
    ALTER TABLE public.personal_records
      DROP CONSTRAINT personal_records_user_ex_kind_unique;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.personal_records'::regclass
      AND conname  = 'personal_records_user_ex_kind_grip_unique'
  ) THEN
    ALTER TABLE public.personal_records
      DROP CONSTRAINT personal_records_user_ex_kind_grip_unique;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.personal_records'::regclass
      AND conname  = 'pr_user_ex_kind_grip_uniq'
  ) THEN
    ALTER TABLE public.personal_records
      DROP CONSTRAINT pr_user_ex_kind_grip_uniq;
  END IF;
END$$;

-- 2) Normalize PR grip_key so uniqueness works deterministically
ALTER TABLE public.personal_records
  ALTER COLUMN grip_key SET DEFAULT '',
  ALTER COLUMN grip_key SET NOT NULL;

-- 3) Recreate the ONE canonical uniqueness constraint (grip-aware)
ALTER TABLE public.personal_records
  ADD CONSTRAINT personal_records_user_ex_kind_grip_unique
  UNIQUE (user_id, exercise_id, kind, grip_key)
  DEFERRABLE INITIALLY IMMEDIATE;

-- 4) Remove every PR-related trigger on workout_sets except the one we keep
--    (We keep only a single "with_grips" trigger name; if you don't have it,
--     this block is still safe to run.)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tgname
    FROM   pg_trigger
    WHERE  tgrelid = 'public.workout_sets'::regclass
      AND  NOT tgisinternal
  LOOP
    -- Drop any trigger that looks PR-related except the canonical one
    IF r.tgname ILIKE '%prs%' OR r.tgname ILIKE '%personal%' THEN
      IF r.tgname <> 'tr_upsert_prs_with_grips_after_set' THEN
        EXECUTE format('DROP TRIGGER %I ON public.workout_sets;', r.tgname);
      END IF;
    END IF;
  END LOOP;
END$$;

-- 5) Make sure workout_exercises carries the grip decision (source of truth)
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS grip_key  text,
  ADD COLUMN IF NOT EXISTS grip_ids  uuid[];

-- 6) If workout_sets has a grip_key column, keep it in sync going forward
--    (optional safeguard; no-op if the column doesn't exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='workout_sets' AND column_name='grip_key'
  ) THEN
    -- Ensure it is always text and nullable (we will coalesce in PR logic)
    ALTER TABLE public.workout_sets
      ALTER COLUMN grip_key TYPE text USING grip_key::text;
  END IF;
END$$;

COMMIT;