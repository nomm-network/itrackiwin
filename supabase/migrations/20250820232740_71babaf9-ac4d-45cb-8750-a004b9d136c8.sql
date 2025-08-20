-- ===================== RLS POLICIES FOR NEW TABLES =====================

-- Enable RLS and create policies for grips_translations
ALTER TABLE public.grips_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "grips_translations_select_all" ON public.grips_translations;
CREATE POLICY "grips_translations_select_all" ON public.grips_translations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "grips_translations_admin_manage" ON public.grips_translations;
CREATE POLICY "grips_translations_admin_manage" ON public.grips_translations
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Enable RLS and create policies for exercise_default_grips
ALTER TABLE public.exercise_default_grips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exercise_default_grips_select_all" ON public.exercise_default_grips;
CREATE POLICY "exercise_default_grips_select_all" ON public.exercise_default_grips
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "exercise_default_grips_mutate_auth" ON public.exercise_default_grips;
CREATE POLICY "exercise_default_grips_mutate_auth" ON public.exercise_default_grips
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS and create policies for readiness_checkins
ALTER TABLE public.readiness_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "readiness_checkins_select_own" ON public.readiness_checkins;
CREATE POLICY "readiness_checkins_select_own" ON public.readiness_checkins
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "readiness_checkins_insert_own" ON public.readiness_checkins;
CREATE POLICY "readiness_checkins_insert_own" ON public.readiness_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "readiness_checkins_update_own" ON public.readiness_checkins;
CREATE POLICY "readiness_checkins_update_own" ON public.readiness_checkins
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS and create policies for pain_events
ALTER TABLE public.pain_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pain_events_select_own" ON public.pain_events;
CREATE POLICY "pain_events_select_own" ON public.pain_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pain_events_insert_own" ON public.pain_events;
CREATE POLICY "pain_events_insert_own" ON public.pain_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pain_events_update_own" ON public.pain_events;
CREATE POLICY "pain_events_update_own" ON public.pain_events
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS and create policies for user_gym_profiles
ALTER TABLE public.user_gym_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_gym_profiles_manage_own" ON public.user_gym_profiles;
CREATE POLICY "user_gym_profiles_manage_own" ON public.user_gym_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable RLS and create policies for user_exercise_overrides
ALTER TABLE public.user_exercise_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_exercise_overrides_manage_own" ON public.user_exercise_overrides;
CREATE POLICY "user_exercise_overrides_manage_own" ON public.user_exercise_overrides
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable RLS and create policies for progression_policies
ALTER TABLE public.progression_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "progression_policies_select_all" ON public.progression_policies;
CREATE POLICY "progression_policies_select_all" ON public.progression_policies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "progression_policies_admin_manage" ON public.progression_policies;
CREATE POLICY "progression_policies_admin_manage" ON public.progression_policies
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Enable RLS and create policies for warmup_policies
ALTER TABLE public.warmup_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "warmup_policies_select_all" ON public.warmup_policies;
CREATE POLICY "warmup_policies_select_all" ON public.warmup_policies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "warmup_policies_admin_manage" ON public.warmup_policies;
CREATE POLICY "warmup_policies_admin_manage" ON public.warmup_policies
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Enable RLS and create policies for workout_exercise_groups
ALTER TABLE public.workout_exercise_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workout_exercise_groups_manage_own" ON public.workout_exercise_groups;
CREATE POLICY "workout_exercise_groups_manage_own" ON public.workout_exercise_groups
  FOR ALL USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_exercise_groups.workout_id AND w.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_exercise_groups.workout_id AND w.user_id = auth.uid()));