BEGIN;

-- 1) Add the columns the trigger expects
ALTER TABLE public.workout_sets
  ADD COLUMN IF NOT EXISTS grip_ids uuid[],
  ADD COLUMN IF NOT EXISTS grip_key text;

-- 2) Helper to normalize grip arrays into a stable key (sorted, deduped)
CREATE OR REPLACE FUNCTION public.normalize_grip_key(p_ids uuid[])
RETURNS text
LANGUAGE sql
IMMUTABLE
RETURNS NULL ON NULL INPUT
AS $$
  SELECT CASE
           WHEN p_ids IS NULL OR array_length(p_ids,1) IS NULL THEN NULL
           ELSE (
             SELECT string_agg(DISTINCT x::text, ',' ORDER BY x::text)
             FROM unnest(p_ids) AS x
           )
         END
$$;

-- 3) Backfill grip_ids and grip_key on existing sets from their workout_exercise
--    (if your FK column is named differently, adjust the join key below)
UPDATE public.workout_sets s
SET
  grip_ids = COALESCE(s.grip_ids, we.grip_ids),
  grip_key = COALESCE(s.grip_key, public.normalize_grip_key(COALESCE(s.grip_ids, we.grip_ids)))
FROM public.workout_exercises we
WHERE we.id = s.workout_exercise_id
  AND (s.grip_ids IS NULL OR s.grip_key IS NULL);

-- If still NULL, set empty string so the UNIQUE constraint below behaves
UPDATE public.workout_sets
SET grip_key = ''
WHERE grip_key IS NULL;

-- 4) Make sure personal_records uses grip_key in its uniqueness
--    (a) ensure the column exists and is not null for uniqueness
ALTER TABLE public.personal_records
  ADD COLUMN IF NOT EXISTS grip_key text DEFAULT '';

ALTER TABLE public.personal_records
  ALTER COLUMN grip_key SET DEFAULT '',
  ALTER COLUMN grip_key SET NOT NULL;

--    (b) drop the old 3-column unique, if it's still around
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'personal_records_user_ex_kind_unique'
       OR  conname = 'personal_records_user_ex_kind_uniq'
  ) THEN
    ALTER TABLE public.personal_records
      DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_unique,
      DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_uniq;
  END IF;
END$$;

--    (c) create the correct 4-column unique (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'personal_records_user_ex_kind_grip_unique'
  ) THEN
    ALTER TABLE public.personal_records
      ADD CONSTRAINT personal_records_user_ex_kind_grip_unique
      UNIQUE (user_id, exercise_id, kind, grip_key);
  END IF;
END$$;

-- 5) Keep only the grip-aware trigger/function on workout_sets
DROP TRIGGER IF EXISTS trg_upsert_prs_after_set          ON public.workout_sets;
DROP TRIGGER IF EXISTS upsert_prs_with_grips_trigger     ON public.workout_sets;
-- do NOT drop: tr_upsert_prs_with_grips_after_set  (that's the good one)

COMMIT;