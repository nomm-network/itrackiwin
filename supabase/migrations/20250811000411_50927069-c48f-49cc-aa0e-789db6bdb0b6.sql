-- Enable required extension for UUIDs (usually enabled by default)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'set_type') THEN
    CREATE TYPE public.set_type AS ENUM ('normal', 'warmup', 'drop', 'amrap', 'timed', 'distance');
  END IF;
END $$;

-- 2) Tables
-- Exercises master data (shared library + user-created)
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text GENERATED ALWAYS AS (regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')) STORED,
  description text,
  equipment text,
  primary_muscle text,
  secondary_muscles text[],
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure uniqueness for a user's custom exercises by slug
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'exercises_owner_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX exercises_owner_slug_unique ON public.exercises(owner_user_id, slug);
  END IF;
END $$;

-- Optional: avoid duplicate public entries (NULL owner) by slug via unique index
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'exercises_public_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX exercises_public_slug_unique ON public.exercises(slug) WHERE owner_user_id IS NULL;
  END IF;
END $$;

-- Workouts (a single training session)
CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  title text,
  notes text,
  perceived_exertion int CHECK (perceived_exertion BETWEEN 1 AND 10),
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_workouts_user_started'
  ) THEN
    CREATE INDEX idx_workouts_user_started ON public.workouts(user_id, started_at DESC);
  END IF;
END $$;

-- Workout exercises (the plan/order inside a session)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id),
  order_index int NOT NULL,
  is_superset_group text,
  notes text
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_workout_exercises_order'
  ) THEN
    CREATE INDEX idx_workout_exercises_order ON public.workout_exercises(workout_id, order_index);
  END IF;
END $$;

-- Sets (reps/weight/time details)
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  set_index int NOT NULL,
  set_kind public.set_type NOT NULL DEFAULT 'normal',
  reps int,
  weight numeric(6,2),
  weight_unit text NOT NULL DEFAULT 'kg',
  duration_seconds int,
  distance numeric(6,2),
  rpe numeric(3,1) CHECK (rpe BETWEEN 0 AND 10),
  completed_at timestamptz DEFAULT now(),
  is_completed boolean NOT NULL DEFAULT true,
  notes text
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_workout_sets_order'
  ) THEN
    CREATE INDEX idx_workout_sets_order ON public.workout_sets(workout_exercise_id, set_index);
  END IF;
END $$;

-- Templates (routines users can reuse)
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'workout_templates_user_name_unique'
  ) THEN
    CREATE UNIQUE INDEX workout_templates_user_name_unique ON public.workout_templates(user_id, name);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.template_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id),
  order_index int NOT NULL,
  default_sets int NOT NULL DEFAULT 3,
  target_reps int,
  target_weight numeric(6,2),
  weight_unit text NOT NULL DEFAULT 'kg',
  notes text
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_template_exercises_order'
  ) THEN
    CREATE INDEX idx_template_exercises_order ON public.template_exercises(template_id, order_index);
  END IF;
END $$;

-- Personal Records (computed & cached)
CREATE TABLE IF NOT EXISTS public.personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id),
  kind text NOT NULL,
  value numeric(8,2) NOT NULL,
  unit text,
  achieved_at timestamptz NOT NULL,
  workout_set_id uuid REFERENCES public.workout_sets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'personal_records_user_ex_kind_unique'
  ) THEN
    CREATE UNIQUE INDEX personal_records_user_ex_kind_unique ON public.personal_records(user_id, exercise_id, kind);
  END IF;
END $$;

-- User preferences (create table if not exists, then add column if needed)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone text NOT NULL DEFAULT 'UTC',
  unit_weight text NOT NULL DEFAULT 'kg',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) RLS enablement
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 4) Policies
-- exercises: public rows readable by all; user-owned only write
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='exercises' AND policyname='ex_read_all'
  ) THEN
    CREATE POLICY ex_read_all ON public.exercises
      FOR SELECT USING (is_public OR owner_user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='exercises' AND policyname='ex_user_write'
  ) THEN
    CREATE POLICY ex_user_write ON public.exercises
      FOR ALL USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());
  END IF;
END $$;

-- per-user tables policies
-- workouts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='workouts' AND policyname='workouts_per_user_select'
  ) THEN
    CREATE POLICY workouts_per_user_select ON public.workouts FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='workouts' AND policyname='workouts_per_user_mutate'
  ) THEN
    CREATE POLICY workouts_per_user_mutate ON public.workouts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- workout_exercises
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='workout_exercises' AND policyname='workout_exercises_per_user_select'
  ) THEN
    CREATE POLICY workout_exercises_per_user_select ON public.workout_exercises FOR SELECT USING (
      EXISTS(SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='workout_exercises' AND policyname='workout_exercises_per_user_mutate'
  ) THEN
    CREATE POLICY workout_exercises_per_user_mutate ON public.workout_exercises FOR ALL USING (
      EXISTS(SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid())
    ) WITH CHECK (
      EXISTS(SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid())
    );
  END IF;
END $$;

-- workout_sets
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='workout_sets' AND policyname='workout_sets_per_user_select'
  ) THEN
    CREATE POLICY workout_sets_per_user_select ON public.workout_sets FOR SELECT USING (
      EXISTS(
        SELECT 1 FROM public.workout_exercises we
        JOIN public.workouts w ON w.id = we.workout_id
        WHERE we.id = workout_exercise_id AND w.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='workout_sets' AND policyname='workout_sets_per_user_mutate'
  ) THEN
    CREATE POLICY workout_sets_per_user_mutate ON public.workout_sets FOR ALL USING (
      EXISTS(
        SELECT 1 FROM public.workout_exercises we
        JOIN public.workouts w ON w.id = we.workout_id
        WHERE we.id = workout_exercise_id AND w.user_id = auth.uid()
      )
    ) WITH CHECK (
      EXISTS(
        SELECT 1 FROM public.workout_exercises we
        JOIN public.workouts w ON w.id = we.workout_id
        WHERE we.id = workout_exercise_id AND w.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- workout_templates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='workout_templates' AND policyname='workout_templates_per_user_select'
  ) THEN
    CREATE POLICY workout_templates_per_user_select ON public.workout_templates FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='workout_templates' AND policyname='workout_templates_per_user_mutate'
  ) THEN
    CREATE POLICY workout_templates_per_user_mutate ON public.workout_templates FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- template_exercises
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='template_exercises' AND policyname='template_exercises_per_user_select'
  ) THEN
    CREATE POLICY template_exercises_per_user_select ON public.template_exercises FOR SELECT USING (
      EXISTS(SELECT 1 FROM public.workout_templates t WHERE t.id = template_id AND t.user_id = auth.uid())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='template_exercises' AND policyname='template_exercises_per_user_mutate'
  ) THEN
    CREATE POLICY template_exercises_per_user_mutate ON public.template_exercises FOR ALL USING (
      EXISTS(SELECT 1 FROM public.workout_templates t WHERE t.id = template_id AND t.user_id = auth.uid())
    ) WITH CHECK (
      EXISTS(SELECT 1 FROM public.workout_templates t WHERE t.id = template_id AND t.user_id = auth.uid())
    );
  END IF;
END $$;

-- personal_records
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='personal_records' AND policyname='personal_records_per_user_select'
  ) THEN
    CREATE POLICY personal_records_per_user_select ON public.personal_records FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='personal_records' AND policyname='personal_records_per_user_mutate'
  ) THEN
    CREATE POLICY personal_records_per_user_mutate ON public.personal_records FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- user_settings policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_settings' AND policyname='user_settings_select_own'
  ) THEN
    CREATE POLICY user_settings_select_own ON public.user_settings FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_settings' AND policyname='user_settings_upsert_own'
  ) THEN
    CREATE POLICY user_settings_upsert_own ON public.user_settings FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- 5) Utility functions & triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Epley 1RM estimate
CREATE OR REPLACE FUNCTION public.epley_1rm(weight numeric, reps int)
RETURNS numeric AS $$
BEGIN
  IF weight IS NULL OR reps IS NULL OR reps <= 0 THEN
    RETURN NULL;
  END IF;
  RETURN weight * (1 + reps::numeric / 30.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to upsert PRs after set insert/update
CREATE OR REPLACE FUNCTION public.upsert_prs_after_set()
RETURNS TRIGGER AS $$
DECLARE
  v_exercise_id uuid;
  v_user_id uuid;
  v_epley numeric(8,2);
BEGIN
  -- Ensure we have the related exercise and user
  SELECT we.exercise_id, w.user_id
    INTO v_exercise_id, v_user_id
  FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = NEW.workout_exercise_id;

  IF v_exercise_id IS NULL OR v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Heaviest (by weight)
  IF NEW.weight IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id)
    VALUES (v_user_id, v_exercise_id, 'heaviest', NEW.weight, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id)
    ON CONFLICT (user_id, exercise_id, kind)
    DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit, achieved_at = EXCLUDED.achieved_at, workout_set_id = EXCLUDED.workout_set_id
    WHERE EXCLUDED.value > public.personal_records.value;
  END IF;

  -- Best reps
  IF NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id)
    VALUES (v_user_id, v_exercise_id, 'reps', NEW.reps, 'reps', COALESCE(NEW.completed_at, now()), NEW.id)
    ON CONFLICT (user_id, exercise_id, kind)
    DO UPDATE SET value = EXCLUDED.value, achieved_at = EXCLUDED.achieved_at, workout_set_id = EXCLUDED.workout_set_id
    WHERE EXCLUDED.value > public.personal_records.value;
  END IF;

  -- 1RM estimate (Epley)
  IF NEW.weight IS NOT NULL AND NEW.reps IS NOT NULL AND NEW.reps > 0 THEN
    v_epley := public.epley_1rm(NEW.weight, NEW.reps);
    IF v_epley IS NOT NULL THEN
      INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id)
      VALUES (v_user_id, v_exercise_id, '1RM', v_epley, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id)
      ON CONFLICT (user_id, exercise_id, kind)
      DO UPDATE SET value = EXCLUDED.value, unit = EXCLUDED.unit, achieved_at = EXCLUDED.achieved_at, workout_set_id = EXCLUDED.workout_set_id
      WHERE EXCLUDED.value > public.personal_records.value;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_upsert_prs_after_set'
  ) THEN
    CREATE TRIGGER trg_upsert_prs_after_set
    AFTER INSERT OR UPDATE ON public.workout_sets
    FOR EACH ROW EXECUTE FUNCTION public.upsert_prs_after_set();
  END IF;
END $$;

-- 6) RPC helpers
-- Start a workout (optionally from template)
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid AS $$
DECLARE
  v_workout_id uuid;
  rec RECORD;
  v_we_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.workouts(user_id) VALUES (auth.uid()) RETURNING id INTO v_workout_id;

  IF p_template_id IS NOT NULL THEN
    -- Ensure template belongs to current user
    IF NOT EXISTS (SELECT 1 FROM public.workout_templates t WHERE t.id = p_template_id AND t.user_id = auth.uid()) THEN
      RAISE EXCEPTION 'Template not found or not owned by user';
    END IF;

    FOR rec IN
      SELECT te.exercise_id, te.order_index, te.default_sets
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      INSERT INTO public.workout_exercises(workout_id, exercise_id, order_index)
      VALUES (v_workout_id, rec.exercise_id, rec.order_index)
      RETURNING id INTO v_we_id;

      -- Pre-create placeholder sets per default_sets
      IF rec.default_sets IS NOT NULL AND rec.default_sets > 0 THEN
        INSERT INTO public.workout_sets(workout_exercise_id, set_index, set_kind, is_completed)
        SELECT v_we_id, s, 'normal'::public.set_type, false
        FROM generate_series(1, rec.default_sets) s;
      END IF;
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- End a workout
CREATE OR REPLACE FUNCTION public.end_workout(p_workout_id uuid)
RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.workouts SET ended_at = now()
  WHERE id = p_workout_id AND user_id = auth.uid()
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Workout not found or not owned by user';
  END IF;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Add a set with JSON payload
CREATE OR REPLACE FUNCTION public.add_set(p_workout_exercise_id uuid, p_payload jsonb)
RETURNS uuid AS $$
DECLARE
  v_set_id uuid;
  v_next_index int;
  v_kind public.set_type;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify ownership through RLS by attempting to read parent
  PERFORM 1 FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = p_workout_exercise_id AND w.user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workout exercise not found or not owned by user';
  END IF;

  SELECT COALESCE(MAX(set_index), 0) + 1 INTO v_next_index
  FROM public.workout_sets WHERE workout_exercise_id = p_workout_exercise_id;

  v_kind := COALESCE((p_payload->>'set_kind')::public.set_type, 'normal');

  INSERT INTO public.workout_sets (
    workout_exercise_id, set_index, set_kind, reps, weight, weight_unit, duration_seconds, distance, rpe, notes, is_completed
  ) VALUES (
    p_workout_exercise_id,
    COALESCE((p_payload->>'set_index')::int, v_next_index),
    v_kind,
    (p_payload->>'reps')::int,
    (p_payload->>'weight')::numeric,
    COALESCE(p_payload->>'weight_unit', 'kg'),
    (p_payload->>'duration_seconds')::int,
    (p_payload->>'distance')::numeric,
    (p_payload->>'rpe')::numeric,
    NULLIF(p_payload->>'notes',''),
    COALESCE((p_payload->>'is_completed')::boolean, true)
  ) RETURNING id INTO v_set_id;

  RETURN v_set_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Clone a template into a new workout (helper)
CREATE OR REPLACE FUNCTION public.clone_template_to_workout(p_template_id uuid)
RETURNS uuid AS $$
BEGIN
  RETURN public.start_workout(p_template_id);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Create demo template for current user (uses public exercises). Returns template_id.
CREATE OR REPLACE FUNCTION public.create_demo_template_for_current_user()
RETURNS uuid AS $$
DECLARE
  v_template_id uuid;
  v_user uuid := auth.uid();
  v_bench uuid; v_ohp uuid; v_pushdown uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find exercises by slug from public library
  SELECT id INTO v_bench FROM public.exercises WHERE owner_user_id IS NULL AND slug = 'barbell-bench-press' LIMIT 1;
  SELECT id INTO v_ohp FROM public.exercises WHERE owner_user_id IS NULL AND slug = 'overhead-press' LIMIT 1;
  SELECT id INTO v_pushdown FROM public.exercises WHERE owner_user_id IS NULL AND slug = 'triceps-pushdown' LIMIT 1;

  INSERT INTO public.workout_templates(user_id, name, notes)
  VALUES (v_user, 'Push Day', 'Demo template')
  ON CONFLICT (user_id, name) DO UPDATE SET notes = EXCLUDED.notes
  RETURNING id INTO v_template_id;

  -- Clear and reinsert exercises for idempotency
  DELETE FROM public.template_exercises WHERE template_id = v_template_id;

  IF v_bench IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit)
    VALUES (v_template_id, v_bench, 1, 3, 8, 'kg');
  END IF;
  IF v_ohp IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit)
    VALUES (v_template_id, v_ohp, 2, 3, 10, 'kg');
  END IF;
  IF v_pushdown IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit)
    VALUES (v_template_id, v_pushdown, 3, 3, 12, 'kg');
  END IF;

  RETURN v_template_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 7) Seed public exercises (idempotent)
WITH seed(name, description, equipment, primary_muscle, secondary_muscles) AS (
  VALUES
    ('Barbell Back Squat','Barbell back squat for legs and glutes','barbell','legs', ARRAY['glutes','core']),
    ('Barbell Bench Press','Bench press targeting chest, triceps, shoulders','barbell','chest', ARRAY['triceps','shoulders']),
    ('Barbell Deadlift','Conventional deadlift','barbell','back', ARRAY['glutes','hamstrings','core']),
    ('Overhead Press','Standing strict press','barbell','shoulders', ARRAY['triceps','upper back']),
    ('Pull-up','Bodyweight vertical pull','bodyweight','back', ARRAY['biceps','core']),
    ('Dumbbell Row','Single-arm dumbbell row','dumbbell','back', ARRAY['biceps','rear delts']),
    ('Plank','Core isometric hold','bodyweight','core', ARRAY[]::text[]),
    ('Triceps Pushdown','Cable pushdown','machine','arms', ARRAY['triceps'])
)
INSERT INTO public.exercises(owner_user_id, name, description, equipment, primary_muscle, secondary_muscles, is_public)
SELECT NULL, s.name, s.description, s.equipment, s.primary_muscle, s.secondary_muscles, true
FROM seed s
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises e
  WHERE e.owner_user_id IS NULL
    AND e.slug = regexp_replace(lower(s.name), '[^a-z0-9]+', '-', 'g')
);
