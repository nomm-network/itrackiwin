-- Fix personal_records constraint and trigger issues
-- 1) Safety: make sure the column exists
ALTER TABLE public.personal_records
  ADD COLUMN IF NOT EXISTS grip_key text;

-- 2) Drop ANY old 3-col uniques (name-agnostic)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM   pg_constraint
    WHERE  conrelid = 'public.personal_records'::regclass
      AND  contype  = 'u'
      AND  conkey   = (
             SELECT ARRAY_AGG(attnum ORDER BY attnum)
             FROM   pg_attribute
             WHERE  attrelid = 'public.personal_records'::regclass
             AND    attname IN ('user_id','exercise_id','kind')
           )
  LOOP
    EXECUTE format('ALTER TABLE public.personal_records DROP CONSTRAINT %I', r.conname);
  END LOOP;
END$$;

-- Also drop any 3-col unique indexes created outside constraints (paranoia)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT i.relname AS idx
    FROM   pg_index x
    JOIN   pg_class i ON i.oid = x.indexrelid
    JOIN   pg_class t ON t.oid = x.indrelid
    WHERE  t.relname = 'personal_records'
      AND  x.indisunique
      AND  array_position(x.indkey, (SELECT attnum FROM pg_attribute WHERE attrelid=t.oid AND attname='user_id')) IS NOT NULL
      AND  array_position(x.indkey, (SELECT attnum FROM pg_attribute WHERE attrelid=t.oid AND attname='exercise_id')) IS NOT NULL
      AND  array_position(x.indkey, (SELECT attnum FROM pg_attribute WHERE attrelid=t.oid AND attname='kind')) IS NOT NULL
      AND  array_position(x.indkey, (SELECT attnum FROM pg_attribute WHERE attrelid=t.oid AND attname='grip_key')) IS NULL
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I', r.idx);
  END LOOP;
END$$;

-- 3) Backfill current PR rows with a grip_key so they won't collide
--    Prefer set.grip_key, then workout_exercise.grip_key, else ''.
UPDATE public.personal_records pr
SET grip_key = COALESCE(ws.grip_key, we.grip_key, '')
FROM public.workout_sets ws
LEFT JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
WHERE pr.workout_set_id = ws.id
  AND (pr.grip_key IS NULL OR pr.grip_key = '');

-- 4) Create the ONLY valid unique now (4 columns)
ALTER TABLE public.personal_records
  ADD CONSTRAINT personal_records_user_ex_kind_grip_unique
  UNIQUE (user_id, exercise_id, kind, grip_key);

-- 5) Replace the upsert function to always use the 4-col conflict
CREATE OR REPLACE FUNCTION public.upsert_prs_with_grips_after_set()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id      uuid;
  v_exercise_id  uuid;
  v_kind         text;
  v_value        numeric;
  v_unit         text;
  v_grip_key     text;
BEGIN
  -- derive user/exercise/kind/value from the set row (adjust if your columns differ)
  v_user_id     := NEW.user_id;
  v_exercise_id := NEW.exercise_id;
  v_kind        := NEW.pr_kind;           -- e.g., 'heaviest' / 'reps' / '1RM'
  v_value       := NEW.pr_value;
  v_unit        := COALESCE(NEW.unit, 'kg');
  v_grip_key    := COALESCE(NEW.grip_key, '');

  -- no PR context -> skip quietly
  IF v_user_id IS NULL OR v_exercise_id IS NULL OR v_kind IS NULL OR v_value IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.personal_records
    (user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_key)
  VALUES
    (v_user_id, v_exercise_id, v_kind, v_value, v_unit, now(), NEW.id, v_grip_key)
  ON CONFLICT (user_id, exercise_id, kind, grip_key)
  DO UPDATE
    SET value         = GREATEST(EXCLUDED.value, public.personal_records.value),
        unit          = EXCLUDED.unit,
        achieved_at   = CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.achieved_at ELSE public.personal_records.achieved_at END,
        workout_set_id= CASE WHEN EXCLUDED.value > public.personal_records.value THEN EXCLUDED.workout_set_id ELSE public.personal_records.workout_set_id END;

  RETURN NEW;
END$$;

-- 6) Leave ONLY the grip-aware trigger; drop the rest
DROP TRIGGER IF EXISTS trg_upsert_prs_after_set           ON public.workout_sets;
DROP TRIGGER IF EXISTS upsert_prs_with_grips_trigger      ON public.workout_sets;
DROP TRIGGER IF EXISTS tr_upsert_prs_with_grips_after_set ON public.workout_sets;

CREATE TRIGGER tr_upsert_prs_with_grips_after_set
AFTER INSERT OR UPDATE ON public.workout_sets
FOR EACH ROW
EXECUTE FUNCTION public.upsert_prs_with_grips_after_set();

-- 7) Quick sanity checks
-- a) What uniques exist now?
SELECT conname, conkey
FROM   pg_constraint
WHERE  conrelid = 'public.personal_records'::regclass
AND    contype = 'u';

-- b) Current PR rows (see keys)
SELECT user_id, exercise_id, kind, grip_key, value, workout_set_id
FROM   public.personal_records
ORDER  BY achieved_at DESC
LIMIT  50;