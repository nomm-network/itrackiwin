-- ===================== ENUMS =====================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'set_type') THEN
    CREATE TYPE set_type AS ENUM ('normal','warmup','top_set','backoff','drop','amrap','cooldown');
  ELSE
    ALTER TYPE set_type ADD VALUE IF NOT EXISTS 'warmup';
    ALTER TYPE set_type ADD VALUE IF NOT EXISTS 'top_set';
    ALTER TYPE set_type ADD VALUE IF NOT EXISTS 'backoff';
    ALTER TYPE set_type ADD VALUE IF NOT EXISTS 'drop';
    ALTER TYPE set_type ADD VALUE IF NOT EXISTS 'amrap';
    ALTER TYPE set_type ADD VALUE IF NOT EXISTS 'cooldown';
  END IF;
END $$;

DO $$ BEGIN
  CREATE TYPE effort_code AS ENUM ('++','+','-','--');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE body_side AS ENUM ('left','right','bilateral','unspecified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE progression_algo AS ENUM ('rep_range_linear','percent_1rm','rpe_based','pyramid','reverse_pyramid','dup','custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE group_type AS ENUM ('solo','superset','giant','finisher','circuit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===================== TRADUCERI GRIPS =====================
CREATE TABLE IF NOT EXISTS public.grips_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grip_id uuid NOT NULL REFERENCES public.grips(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (grip_id, language_code)
);

-- ===================== DEFAULT GRIPS NORMALIZATE =====================
CREATE TABLE IF NOT EXISTS public.exercise_default_grips (
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  grip_id uuid NOT NULL REFERENCES public.grips(id) ON DELETE RESTRICT,
  order_index int NOT NULL DEFAULT 1,
  PRIMARY KEY (exercise_id, grip_id)
);

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS default_grip_ids uuid[] DEFAULT '{}';

-- ===================== READINESS / PAIN =====================
CREATE TABLE IF NOT EXISTS public.readiness_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id uuid NULL REFERENCES public.workouts(id) ON DELETE SET NULL,
  checkin_at timestamptz NOT NULL DEFAULT now(),
  sleep_hours numeric(4,2),
  sleep_quality int2 CHECK (sleep_quality BETWEEN 1 AND 5),
  energy int2 CHECK (energy BETWEEN 1 AND 5),
  soreness int2 CHECK (soreness BETWEEN 0 AND 5),
  stress int2 CHECK (stress BETWEEN 0 AND 5),
  alcohol boolean,
  illness boolean,
  supplements jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_set_id uuid NULL REFERENCES public.workout_sets(id) ON DELETE SET NULL,
  body_part_id uuid NULL REFERENCES public.body_parts(id) ON DELETE SET NULL,
  side body_side NOT NULL DEFAULT 'unspecified',
  severity int2 CHECK (severity BETWEEN 1 AND 10),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===================== PROFIL SALĂ / OVERRIDES =====================
CREATE TABLE IF NOT EXISTS public.user_gym_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_name text NOT NULL DEFAULT 'default',
  barbell_weight numeric(6,2) NOT NULL DEFAULT 20.0,
  dumbbell_increment numeric(6,2) NOT NULL DEFAULT 2.5,
  machine_increment numeric(6,2) NOT NULL DEFAULT 2.5,
  cable_increment numeric(6,2) NOT NULL DEFAULT 2.5,
  microplates numeric[] DEFAULT '{}',
  available_dumbbells numeric[] DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, profile_name)
);

CREATE TABLE IF NOT EXISTS public.user_exercise_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  gym_profile_id uuid NULL REFERENCES public.user_gym_profiles(id) ON DELETE SET NULL,
  min_weight numeric(6,2),
  max_weight numeric(6,2),
  weight_increment numeric(6,2),
  available_levels int2[],
  available_inclines numeric[],
  available_resistances numeric[],
  extra jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- ===================== PROGRESIE & WARMUP POLICIES =====================
CREATE TABLE IF NOT EXISTS public.progression_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  algo progression_algo NOT NULL,
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.warmup_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.template_exercises
  ADD COLUMN IF NOT EXISTS progression_policy_id uuid REFERENCES public.progression_policies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS warmup_policy_id uuid REFERENCES public.warmup_policies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS set_scheme text,
  ADD COLUMN IF NOT EXISTS rep_range_min int2,
  ADD COLUMN IF NOT EXISTS rep_range_max int2,
  ADD COLUMN IF NOT EXISTS top_set_percent_1rm numeric(5,2),
  ADD COLUMN IF NOT EXISTS backoff_percent numeric(5,2),
  ADD COLUMN IF NOT EXISTS backoff_sets int2;

-- ===================== CAPABILITIES + SETTINGS JSON (UI HINTS) =====================
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS capability_schema jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.template_exercises
  ADD COLUMN IF NOT EXISTS target_settings jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.workout_sets
  ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- ===================== SUPERSET / TIMERE =====================
CREATE TABLE IF NOT EXISTS public.workout_exercise_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  group_type group_type NOT NULL DEFAULT 'solo',
  name text,
  order_index int NOT NULL DEFAULT 1,
  rest_seconds_between_cycles int DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.workout_exercise_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_index int;

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes int,
  ADD COLUMN IF NOT EXISTS total_duration_seconds int;

ALTER TABLE public.workout_sets
  ADD COLUMN IF NOT EXISTS rest_seconds int,
  ADD COLUMN IF NOT EXISTS effort effort_code,
  ADD COLUMN IF NOT EXISTS had_pain boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS heart_rate int2;

-- ===================== INDEXĂRI HOT PATH =====================
CREATE INDEX IF NOT EXISTS idx_exercises_capability_schema ON public.exercises USING gin (capability_schema);
CREATE INDEX IF NOT EXISTS idx_workout_sets_settings ON public.workout_sets USING gin (settings);
CREATE INDEX IF NOT EXISTS readiness_user_time_idx ON public.readiness_checkins (user_id, checkin_at DESC);
CREATE INDEX IF NOT EXISTS pain_user_time_idx ON public.pain_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS pain_set_idx ON public.pain_events (workout_set_id);
CREATE INDEX IF NOT EXISTS user_exercise_overrides_user_idx ON public.user_exercise_overrides(user_id);
CREATE INDEX IF NOT EXISTS workouts_user_started_idx ON public.workouts(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS workout_exercises_workout_idx ON public.workout_exercises(workout_id, order_index);
CREATE INDEX IF NOT EXISTS workout_sets_we_idx ON public.workout_sets(workout_exercise_id, set_index);
CREATE INDEX IF NOT EXISTS workout_sets_completed_idx ON public.workout_sets(is_completed, completed_at DESC);
CREATE INDEX IF NOT EXISTS template_exercises_template_idx ON public.template_exercises(template_id, order_index);
CREATE INDEX IF NOT EXISTS personal_records_user_ex_idx ON public.personal_records(user_id, exercise_id, achieved_at DESC);
CREATE INDEX IF NOT EXISTS workout_set_grips_set_idx ON public.workout_set_grips(workout_set_id);

-- ===================== RLS POLICIES =====================
ALTER TABLE public.readiness_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "readiness_checkins_select_own" ON public.readiness_checkins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "readiness_checkins_insert_own" ON public.readiness_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "readiness_checkins_update_own" ON public.readiness_checkins
  FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.pain_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "pain_events_select_own" ON public.pain_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "pain_events_insert_own" ON public.pain_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "pain_events_update_own" ON public.pain_events
  FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.user_gym_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "user_gym_profiles_manage_own" ON public.user_gym_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_exercise_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "user_exercise_overrides_manage_own" ON public.user_exercise_overrides
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.progression_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "progression_policies_select_all" ON public.progression_policies
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "progression_policies_admin_manage" ON public.progression_policies
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

ALTER TABLE public.warmup_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "warmup_policies_select_all" ON public.warmup_policies
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "warmup_policies_admin_manage" ON public.warmup_policies
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

ALTER TABLE public.workout_exercise_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "workout_exercise_groups_manage_own" ON public.workout_exercise_groups
  FOR ALL USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_exercise_groups.workout_id AND w.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_exercise_groups.workout_id AND w.user_id = auth.uid()));

ALTER TABLE public.grips_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "grips_translations_select_all" ON public.grips_translations
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "grips_translations_admin_manage" ON public.grips_translations
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

ALTER TABLE public.exercise_default_grips ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "exercise_default_grips_select_all" ON public.exercise_default_grips
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "exercise_default_grips_mutate_auth" ON public.exercise_default_grips
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');