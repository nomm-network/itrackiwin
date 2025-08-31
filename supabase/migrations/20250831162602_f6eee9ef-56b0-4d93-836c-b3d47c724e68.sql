-- 1) Drop legacy unique constraint if it still exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conrelid = 'public.personal_records'::regclass
      AND  conname  = 'personal_records_user_ex_kind_unique'
  ) THEN
    ALTER TABLE public.personal_records
      DROP CONSTRAINT personal_records_user_ex_kind_unique;
  END IF;
END$$;

-- 2) Replace any older PR uniqueness with a single, NULL-safe composite
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename  = 'personal_records'
      AND indexname  = 'personal_records_user_ex_kind_grip_key_uniq'
  ) THEN
    DROP INDEX public.personal_records_user_ex_kind_grip_key_uniq;
  END IF;
END$$;

CREATE UNIQUE INDEX personal_records_user_ex_kind_grip_key_uniq
ON public.personal_records (user_id, exercise_id, kind, COALESCE(grip_key, ''));

-- 3) Fix user_exercise_warmups table structure
ALTER TABLE public.user_exercise_warmups
  ADD COLUMN IF NOT EXISTS workout_exercise_id uuid,
  ADD COLUMN IF NOT EXISTS warmup_sets_done smallint,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Helpful index for quick lookup
CREATE INDEX IF NOT EXISTS idx_u_warmups_workout_ex
  ON public.user_exercise_warmups (workout_exercise_id);

-- 4) Fix RLS policies for workout_sets
DROP POLICY IF EXISTS ins_user_owned ON public.workout_sets;
DROP POLICY IF EXISTS sel_user_owned ON public.workout_sets;
DROP POLICY IF EXISTS upd_user_owned ON public.workout_sets;

CREATE POLICY ins_user_owned
ON public.workout_sets
FOR INSERT
WITH CHECK (auth.uid() = (SELECT w.user_id
                          FROM workout_exercises we
                          JOIN workouts w ON w.id = we.workout_id
                          WHERE we.id = workout_sets.workout_exercise_id));

CREATE POLICY sel_user_owned
ON public.workout_sets
FOR SELECT USING (
  auth.uid() = (SELECT w.user_id
                FROM workout_exercises we
                JOIN workouts w ON w.id = we.workout_id
                WHERE we.id = workout_sets.workout_exercise_id)
);

CREATE POLICY upd_user_owned
ON public.workout_sets
FOR UPDATE USING (
  auth.uid() = (SELECT w.user_id
                FROM workout_exercises we
                JOIN workouts w ON w.id = we.workout_id
                WHERE we.id = workout_sets.workout_exercise_id)
);

-- 5) Fix RLS policies for workout_set_metric_values
DROP POLICY IF EXISTS ins_metric_user_owned ON public.workout_set_metric_values;
DROP POLICY IF EXISTS sel_metric_user_owned ON public.workout_set_metric_values;

CREATE POLICY ins_metric_user_owned
ON public.workout_set_metric_values
FOR INSERT
WITH CHECK (auth.uid() = (SELECT w.user_id
                          FROM workout_sets ws
                          JOIN workout_exercises we ON we.id = ws.workout_exercise_id
                          JOIN workouts w ON w.id = we.workout_id
                          WHERE ws.id = workout_set_metric_values.workout_set_id));

CREATE POLICY sel_metric_user_owned
ON public.workout_set_metric_values
FOR SELECT USING (
  auth.uid() = (SELECT w.user_id
                FROM workout_sets ws
                JOIN workout_exercises we ON we.id = ws.workout_exercise_id
                JOIN workouts w ON w.id = we.workout_id
                WHERE ws.id = workout_set_metric_values.workout_set_id)
);

-- 6) Fix RLS policies for workout_set_grips
DROP POLICY IF EXISTS ins_grip_user_owned ON public.workout_set_grips;
DROP POLICY IF EXISTS sel_grip_user_owned ON public.workout_set_grips;

CREATE POLICY ins_grip_user_owned
ON public.workout_set_grips
FOR INSERT
WITH CHECK (auth.uid() = (SELECT w.user_id
                          FROM workout_sets ws
                          JOIN workout_exercises we ON we.id = ws.workout_exercise_id
                          JOIN workouts w ON w.id = we.workout_id
                          WHERE ws.id = workout_set_grips.workout_set_id));

CREATE POLICY sel_grip_user_owned
ON public.workout_set_grips
FOR SELECT USING (
  auth.uid() = (SELECT w.user_id
                FROM workout_sets ws
                JOIN workout_exercises we ON we.id = ws.workout_exercise_id
                JOIN workouts w ON w.id = we.workout_id
                WHERE ws.id = workout_set_grips.workout_set_id)
);

-- 7) Fix RLS policies for user_exercise_warmups
DROP POLICY IF EXISTS ins_warmup_user_owned ON public.user_exercise_warmups;
DROP POLICY IF EXISTS sel_warmup_user_owned ON public.user_exercise_warmups;
DROP POLICY IF EXISTS upd_warmup_user_owned ON public.user_exercise_warmups;

CREATE POLICY ins_warmup_user_owned
ON public.user_exercise_warmups
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY sel_warmup_user_owned
ON public.user_exercise_warmups
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY upd_warmup_user_owned
ON public.user_exercise_warmups
FOR UPDATE USING (auth.uid() = user_id);

-- 8) Create unified set logging function
CREATE OR REPLACE FUNCTION public.log_workout_set(
  p_workout_exercise_id uuid,
  p_set_index integer,
  p_metrics jsonb,
  p_grip_ids uuid[] DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_set_id uuid;
  v_metric_def RECORD;
  v_grip_id uuid;
BEGIN
  -- Insert workout set
  INSERT INTO workout_sets (
    workout_exercise_id,
    set_index,
    is_completed,
    completed_at
  ) VALUES (
    p_workout_exercise_id,
    p_set_index,
    true,
    now()
  ) RETURNING id INTO v_set_id;

  -- Insert metric values
  FOR v_metric_def IN 
    SELECT md.id, md.slug, md.value_type
    FROM exercise_metric_defs emd
    JOIN metric_defs md ON md.id = emd.metric_id
    JOIN workout_exercises we ON we.exercise_id = emd.exercise_id
    WHERE we.id = p_workout_exercise_id
  LOOP
    IF p_metrics ? v_metric_def.slug THEN
      INSERT INTO workout_set_metric_values (
        workout_set_id,
        metric_def_id,
        value
      ) VALUES (
        v_set_id,
        v_metric_def.id,
        p_metrics -> v_metric_def.slug
      );
    END IF;
  END LOOP;

  -- Insert grips if provided
  IF p_grip_ids IS NOT NULL THEN
    FOREACH v_grip_id IN ARRAY p_grip_ids
    LOOP
      INSERT INTO workout_set_grips (workout_set_id, grip_id)
      VALUES (v_set_id, v_grip_id);
    END LOOP;
  END IF;

  RETURN v_set_id;
END;
$$;