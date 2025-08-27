-- Clean up any conflicting data first
DROP TABLE IF EXISTS public.template_exercise_grips CASCADE;
DROP TABLE IF EXISTS public.template_exercise_handles CASCADE;
DROP TABLE IF EXISTS public.exercise_handle_grips CASCADE;
DROP TABLE IF EXISTS public.exercise_handles CASCADE;
DROP TABLE IF EXISTS public.handle_translations CASCADE;
DROP TABLE IF EXISTS public.handles CASCADE;

-- 1) Catalog of gym handles / attachments
CREATE TABLE public.handles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('bar','pulldown','row','cable','rope','single','d-handle','triangle','ez-bar','v-bar','other')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.handles ENABLE ROW LEVEL SECURITY;

-- 2) Translations
CREATE TABLE public.handle_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle_id uuid NOT NULL REFERENCES public.handles(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(handle_id, language_code)
);

-- Enable RLS
ALTER TABLE public.handle_translations ENABLE ROW LEVEL SECURITY;

-- 3) Map which handles make sense for each exercise
CREATE TABLE public.exercise_handles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  handle_id uuid NOT NULL REFERENCES public.handles(id) ON DELETE CASCADE,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exercise_id, handle_id)
);

-- Enable RLS
ALTER TABLE public.exercise_handles ENABLE ROW LEVEL SECURITY;

-- 4) Per-exercise, per-handle recommended grips
CREATE TABLE public.exercise_handle_grips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  handle_id uuid NOT NULL REFERENCES public.handles(id) ON DELETE CASCADE,
  grip_id uuid NOT NULL REFERENCES public.grips(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exercise_id, handle_id, grip_id)
);

-- Enable RLS
ALTER TABLE public.exercise_handle_grips ENABLE ROW LEVEL SECURITY;

-- 5) One chosen handle per template exercise
CREATE TABLE public.template_exercise_handles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_exercise_id uuid NOT NULL REFERENCES public.template_exercises(id) ON DELETE CASCADE,
  handle_id uuid NOT NULL REFERENCES public.handles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_exercise_id)
);

-- Enable RLS
ALTER TABLE public.template_exercise_handles ENABLE ROW LEVEL SECURITY;

-- 6) Template-level default grips for chosen handle
CREATE TABLE public.template_exercise_grips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_exercise_id uuid NOT NULL REFERENCES public.template_exercises(id) ON DELETE CASCADE,
  grip_id uuid NOT NULL REFERENCES public.grips(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_exercise_id, grip_id)
);

-- Enable RLS
ALTER TABLE public.template_exercise_grips ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "handles_select_all" ON public.handles FOR SELECT USING (true);
CREATE POLICY "handles_admin_manage" ON public.handles FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "handle_translations_select_all" ON public.handle_translations FOR SELECT USING (true);
CREATE POLICY "handle_translations_admin_manage" ON public.handle_translations FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "exercise_handles_select_all" ON public.exercise_handles FOR SELECT USING (true);
CREATE POLICY "exercise_handles_admin_manage" ON public.exercise_handles FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "exercise_handle_grips_select_all" ON public.exercise_handle_grips FOR SELECT USING (true);
CREATE POLICY "exercise_handle_grips_admin_manage" ON public.exercise_handle_grips FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "template_exercise_handles_manage_own" ON public.template_exercise_handles 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.template_exercises te
    JOIN public.workout_templates wt ON wt.id = te.template_id
    WHERE te.id = template_exercise_handles.template_exercise_id
    AND wt.user_id = auth.uid()
  )
);

CREATE POLICY "template_exercise_grips_manage_own" ON public.template_exercise_grips 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.template_exercises te
    JOIN public.workout_templates wt ON wt.id = te.template_id
    WHERE te.id = template_exercise_grips.template_exercise_id
    AND wt.user_id = auth.uid()
  )
);

-- Seed common handles
INSERT INTO public.handles (slug, category) VALUES
  ('straight-bar','bar'),
  ('ez-curl-bar','ez-bar'),
  ('lat-bar-wide','pulldown'),
  ('lat-bar-standard','pulldown'),
  ('row-v-bar','v-bar'),
  ('row-triangle','triangle'),
  ('rope','rope'),
  ('single-d-handle','single');