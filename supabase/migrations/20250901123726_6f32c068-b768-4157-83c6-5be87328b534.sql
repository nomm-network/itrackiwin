-- CRITICAL FIX: Personal Records Constraint Conflict Resolution
-- This fixes the "duplicate key value violates unique constraint" error in workout set logging

BEGIN;

-- 0) Make sure grip_key exists on personal_records and is normalized
ALTER TABLE public.personal_records
  ADD COLUMN IF NOT EXISTS grip_key text;

UPDATE public.personal_records
SET grip_key = COALESCE(grip_key, '')
WHERE grip_key IS NULL;

-- 1) Drop ANY legacy 3-col unique on (user_id, exercise_id, kind)
DO $$
DECLARE
  cons_name text;
BEGIN
  -- drop the common legacy name if present
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'personal_records_user_ex_kind_unique'
      AND conrelid = 'public.personal_records'::regclass
  ) THEN
    ALTER TABLE public.personal_records
    DROP CONSTRAINT personal_records_user_ex_kind_unique;
  END IF;

  -- drop any other 3-col uniques on same columns regardless of name
  FOR cons_name IN
    SELECT c.conname
    FROM   pg_constraint c
    JOIN   pg_class t ON t.oid = c.conrelid
    JOIN   pg_namespace n ON n.oid = t.relnamespace
    WHERE  n.nspname = 'public'
      AND  t.relname = 'personal_records'
      AND  c.contype = 'u'
      AND  (
        SELECT array_agg(attname ORDER BY a.attnum)
        FROM   unnest(c.conkey) WITH ORDINALITY ck(attnum, ord)
        JOIN   pg_attribute a ON a.attrelid = t.oid AND a.attnum = ck.attnum
      ) = ARRAY['user_id','exercise_id','kind']
  LOOP
    EXECUTE format('ALTER TABLE public.personal_records DROP CONSTRAINT %I', cons_name);
  END LOOP;
END$$;

-- 2) Ensure the correct 4-col unique exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'personal_records_user_ex_kind_grip_unique'
      AND conrelid = 'public.personal_records'::regclass
  ) THEN
    ALTER TABLE public.personal_records
      ADD CONSTRAINT personal_records_user_ex_kind_grip_unique
      UNIQUE (user_id, exercise_id, kind, grip_key);
  END IF;
END$$;

-- 3) Replace the PR upsert function (grip-aware, simple & safe)
CREATE OR REPLACE FUNCTION public.upsert_prs_with_grips_after_set()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  gkey text;
  v_now timestamptz := now();
  v_weight numeric;
BEGIN
  -- build a stable grip key: explicit -> from ids -> empty
  gkey := COALESCE(
            NULLIF(NEW.grip_key, ''),
            CASE WHEN NEW.grip_ids IS NOT NULL
                 THEN array_to_string(ARRAY(SELECT unnest(NEW.grip_ids)::text ORDER BY 1), ',')
                 ELSE '' END,
            ''
          );

  -- best available weight value (adjust if your column is named differently)
  v_weight := NEW.weight;

  -- HEAVIEST
  IF v_weight IS NOT NULL THEN
    INSERT INTO public.personal_records (user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (NEW.user_id, NEW.exercise_id, 'heaviest', v_weight, 'kg', v_now, NEW.id, gkey)
    ON CONFLICT (user_id, exercise_id, kind, grip_key)
    DO UPDATE SET
      value         = GREATEST(public.personal_records.value, EXCLUDED.value),
      unit          = EXCLUDED.unit,
      achieved_at   = CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.achieved_at ELSE public.personal_records.achieved_at END,
      workout_set_id= CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.workout_set_id ELSE public.personal_records.workout_set_id END;
  END IF;

  -- REPS
  IF NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records (user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (NEW.user_id, NEW.exercise_id, 'reps', NEW.reps, 'reps', v_now, NEW.id, gkey)
    ON CONFLICT (user_id, exercise_id, kind, grip_key)
    DO UPDATE SET
      value         = GREATEST(public.personal_records.value, EXCLUDED.value),
      achieved_at   = CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.achieved_at ELSE public.personal_records.achieved_at END,
      workout_set_id= CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.workout_set_id ELSE public.personal_records.workout_set_id END;
  END IF;

  -- 1RM (Epley) if both present
  IF v_weight IS NOT NULL AND NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records (user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
    VALUES (NEW.user_id, NEW.exercise_id, '1RM', v_weight * (1 + (NEW.reps::numeric / 30.0)), 'kg', v_now, NEW.id, gkey)
    ON CONFLICT (user_id, exercise_id, kind, grip_key)
    DO UPDATE SET
      value         = GREATEST(public.personal_records.value, EXCLUDED.value),
      unit          = EXCLUDED.unit,
      achieved_at   = CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.achieved_at ELSE public.personal_records.achieved_at END,
      workout_set_id= CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.workout_set_id ELSE public.personal_records.workout_set_id END;
  END IF;

  RETURN NEW;
END
$fn$;

-- 4) Make sure ONLY the correct trigger exists on workout_sets
DROP TRIGGER IF EXISTS trg_upsert_prs_after_set          ON public.workout_sets;
DROP TRIGGER IF EXISTS upsert_prs_with_grips_trigger     ON public.workout_sets;
DROP TRIGGER IF EXISTS tr_upsert_prs_with_grips_after_set ON public.workout_sets;

CREATE TRIGGER tr_upsert_prs_with_grips_after_set
AFTER INSERT OR UPDATE ON public.workout_sets
FOR EACH ROW
EXECUTE FUNCTION public.upsert_prs_with_grips_after_set();

COMMIT;

-- 5) Sanity checks
-- a) Show remaining uniques on personal_records
SELECT conname, pg_get_constraintdef(oid) AS constraint_def
FROM pg_constraint
WHERE conrelid = 'public.personal_records'::regclass
  AND contype = 'u';

-- b) Show active (non-internal) triggers on workout_sets
SELECT tgname, tgfoid::regprocedure
FROM pg_trigger
WHERE tgrelid = 'public.workout_sets'::regclass
  AND NOT tgisinternal;