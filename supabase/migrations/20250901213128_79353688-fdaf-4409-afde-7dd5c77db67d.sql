-- =========================================================
-- SIMPLE, STABLE START WORKOUT PIPELINE
-- Normalizes schema + installs a single RPC that copies
-- template_exercises → workout_exercises reliably.
-- =========================================================

BEGIN;

-- ---------- 0) Helpers ----------
-- Create weight_unit enum if you don't already have one
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'weight_unit'
  ) THEN
    CREATE TYPE weight_unit AS ENUM ('kg','lb');
  END IF;
END$$;

-- ---------- 1) Normalize TEMPLATE_EXERCISES ----------
-- Ensure the exact columns we will read from exist
ALTER TABLE public.template_exercises
  ADD COLUMN IF NOT EXISTS order_index                integer,
  ADD COLUMN IF NOT EXISTS default_sets               smallint,
  ADD COLUMN IF NOT EXISTS target_reps                smallint,
  ADD COLUMN IF NOT EXISTS target_weight_kg           numeric,
  ADD COLUMN IF NOT EXISTS weight_unit                weight_unit DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS rest_seconds               integer,
  ADD COLUMN IF NOT EXISTS notes                      text,
  ADD COLUMN IF NOT EXISTS default_grip_ids           uuid[];

-- Migrate legacy columns into the normalized ones, if those legacy columns exist.
DO $$
BEGIN
  -- target_weight (legacy) → target_weight_kg
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='template_exercises' AND column_name='target_weight'
  ) THEN
    EXECUTE $I$
      UPDATE public.template_exercises
      SET target_weight_kg = COALESCE(target_weight_kg, NULLIF(target_weight::text,'')::numeric)
      WHERE target_weight_kg IS NULL
        AND target_weight IS NOT NULL
    $I$;
  END IF;

  -- rest_time (legacy) → rest_seconds
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='template_exercises' AND column_name='rest_time'
  ) THEN
    EXECUTE $I$
      UPDATE public.template_exercises
      SET rest_seconds = COALESCE(rest_seconds, NULLIF(rest_time::text,'')::integer)
      WHERE rest_seconds IS NULL
        AND rest_time IS NOT NULL
    $I$;
  END IF;
END$$;

-- Drop the legacy columns if they exist so future code can't "accidentally" use them
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='template_exercises' AND column_name='target_weight'
  ) THEN
    EXECUTE 'ALTER TABLE public.template_exercises DROP COLUMN target_weight';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='template_exercises' AND column_name='rest_time'
  ) THEN
    EXECUTE 'ALTER TABLE public.template_exercises DROP COLUMN rest_time';
  END IF;
END$$;

-- ---------- 2) Normalize WORKOUT_EXERCISES ----------
-- Ensure the exact columns we will write to exist
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS order_index        integer,
  ADD COLUMN IF NOT EXISTS target_sets       smallint,
  ADD COLUMN IF NOT EXISTS target_reps       smallint,
  ADD COLUMN IF NOT EXISTS target_weight_kg  numeric,
  ADD COLUMN IF NOT EXISTS weight_unit       weight_unit DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS rest_seconds      integer,
  ADD COLUMN IF NOT EXISTS notes             text,
  ADD COLUMN IF NOT EXISTS grip_ids          uuid[];

-- Migrate legacy columns into the normalized ones (if they exist)
DO $$
BEGIN
  -- target_weight (legacy) → target_weight_kg
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='workout_exercises' AND column_name='target_weight'
  ) THEN
    EXECUTE $I$
      UPDATE public.workout_exercises
      SET target_weight_kg = COALESCE(target_weight_kg, NULLIF(target_weight::text,'')::numeric)
      WHERE target_weight_kg IS NULL
        AND target_weight IS NOT NULL
    $I$;
  END IF;

  -- rest_time (legacy) → rest_seconds
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='workout_exercises' AND column_name='rest_time'
  ) THEN
    EXECUTE $I$
      UPDATE public.workout_exercises
      SET rest_seconds = COALESCE(rest_seconds, NULLIF(rest_time::text,'')::integer)
      WHERE rest_seconds IS NULL
        AND rest_time IS NOT NULL
    $I$;
  END IF;
END$$;

-- Drop the legacy columns so they can't be used again
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='workout_exercises' AND column_name='target_weight'
  ) THEN
    EXECUTE 'ALTER TABLE public.workout_exercises DROP COLUMN target_weight';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='workout_exercises' AND column_name='rest_time'
  ) THEN
    EXECUTE 'ALTER TABLE public.workout_exercises DROP COLUMN rest_time';
  END IF;
END$$;

-- ---------- 3) Clean up old functions/triggers in this area (optional but recommended) ----------
-- These are harmless if they don't exist.
DO $$ BEGIN
  PERFORM 1 FROM pg_proc WHERE proname = 'start_workout';
  IF FOUND THEN
    EXECUTE 'DROP FUNCTION public.start_workout(uuid)';
  END IF;
EXCEPTION WHEN undefined_function THEN
  -- no-op
END $$;

-- ---------- 4) Install the ONE simple RPC ----------
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_workout_id uuid;
  v_user_id    uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.workouts (user_id, started_at)
  VALUES (v_user_id, now())
  RETURNING id INTO v_workout_id;

  IF p_template_id IS NOT NULL THEN
    -- copy normalized fields one-to-one
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      target_sets,
      target_reps,
      target_weight_kg,
      weight_unit,
      rest_seconds,
      notes,
      grip_ids
    )
    SELECT
      v_workout_id,
      te.exercise_id,
      COALESCE(te.order_index, 1),
      COALESCE(te.default_sets, 3),
      te.target_reps,
      te.target_weight_kg,
      COALESCE(te.weight_unit, 'kg')::weight_unit,
      te.rest_seconds,
      te.notes,
      te.default_grip_ids
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index NULLS LAST, te.created_at;
  END IF;

  RETURN v_workout_id;
END;
$$;

-- (Optional) RLS helper if you use RLS on functions
REVOKE ALL ON FUNCTION public.start_workout(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_workout(uuid) TO anon, authenticated, service_role;

COMMIT;