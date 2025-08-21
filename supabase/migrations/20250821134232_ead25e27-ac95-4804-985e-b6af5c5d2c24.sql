-- Create enums
CREATE TYPE weight_unit AS ENUM ('kg','lb');

-- 1) User gyms (multiple gym locations per user)
CREATE TABLE public.user_gyms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  is_default  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX user_gyms_one_default_per_user
  ON public.user_gyms(user_id) WHERE (is_default);

-- 2) Dumbbells inventory
CREATE TABLE public.user_gym_dumbbells (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_gym_id  uuid NOT NULL REFERENCES public.user_gyms(id) ON DELETE CASCADE,
  weight       numeric NOT NULL,
  unit         weight_unit NOT NULL DEFAULT 'kg',
  quantity     smallint NOT NULL DEFAULT 2,
  UNIQUE (user_gym_id, weight, unit)
);

-- 3) Plate inventory for barbells
CREATE TABLE public.user_gym_plates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_gym_id  uuid NOT NULL REFERENCES public.user_gyms(id) ON DELETE CASCADE,
  weight       numeric NOT NULL,
  unit         weight_unit NOT NULL DEFAULT 'kg',
  quantity     smallint NOT NULL,
  UNIQUE (user_gym_id, weight, unit)
);

-- 4) Bar types
CREATE TABLE public.bar_types (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  default_weight numeric NOT NULL,
  unit         weight_unit NOT NULL DEFAULT 'kg',
  UNIQUE (name, default_weight, unit)
);

-- Insert common bar types
INSERT INTO public.bar_types (name, default_weight, unit) VALUES
  ('Olympic Bar', 20, 'kg'),
  ('EZ Curl Bar', 10, 'kg'),
  ('Trap Bar', 25, 'kg'),
  ('Safety Squat Bar', 25, 'kg'),
  ('Olympic Bar', 45, 'lb'),
  ('EZ Curl Bar', 25, 'lb');

CREATE TABLE public.user_gym_bars (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_gym_id  uuid NOT NULL REFERENCES public.user_gyms(id) ON DELETE CASCADE,
  bar_type_id  uuid NOT NULL REFERENCES public.bar_types(id) ON DELETE RESTRICT,
  quantity     smallint NOT NULL DEFAULT 1
);

-- 5) Machine weight stacks
CREATE TABLE public.user_gym_machines (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_gym_id   uuid NOT NULL REFERENCES public.user_gyms(id) ON DELETE CASCADE,
  equipment_id  uuid REFERENCES public.equipment(id),
  label         text NOT NULL,
  stack_values  numeric[] NOT NULL,
  unit          weight_unit NOT NULL DEFAULT 'kg',
  aux_values    numeric[] DEFAULT '{}',
  UNIQUE (user_gym_id, label)
);

-- 6) Fractional add-ons
CREATE TABLE public.user_gym_miniweights (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_gym_id  uuid NOT NULL REFERENCES public.user_gyms(id) ON DELETE CASCADE,
  weight       numeric NOT NULL,
  unit         weight_unit NOT NULL DEFAULT 'kg',
  quantity     smallint NOT NULL,
  UNIQUE (user_gym_id, weight, unit)
);

-- 7) Active template rotation
CREATE TABLE public.user_active_templates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id    uuid NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  order_index    smallint NOT NULL,
  is_active      boolean NOT NULL DEFAULT true,
  last_done_at   timestamptz,
  notes          text,
  UNIQUE (user_id, template_id),
  UNIQUE (user_id, order_index)
);

-- 8) Template exercise machine preferences
CREATE TABLE public.template_exercise_machine_pref (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_exercise_id  uuid NOT NULL REFERENCES public.template_exercises(id) ON DELETE CASCADE,
  user_gym_machine_id   uuid NOT NULL REFERENCES public.user_gym_machines(id) ON DELETE CASCADE,
  UNIQUE (template_exercise_id)
);

-- 9) User lifting preferences
CREATE TABLE public.user_lifting_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prefer_smallest_increment boolean NOT NULL DEFAULT true,
  allow_mixed_plates boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gym_dumbbells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gym_plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gym_bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gym_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gym_miniweights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_exercise_machine_pref ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lifting_prefs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "own_gyms" ON public.user_gyms
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_dumbbells" ON public.user_gym_dumbbells
  USING (user_gym_id IN (SELECT id FROM public.user_gyms WHERE user_id = auth.uid()))
  WITH CHECK (user_gym_id IN (SELECT id FROM public.user_gyms WHERE user_id = auth.uid()));

CREATE POLICY "own_plates" ON public.user_gym_plates
  USING (user_gym_id IN (SELECT id FROM public.user_gyms WHERE user_id = auth.uid()))
  WITH CHECK (user_gym_id IN (SELECT id FROM public.user_gyms WHERE user_id = auth.uid()));

CREATE POLICY "own_bars" ON public.user_gym_bars
  USING (user_gym_id IN (SELECT id FROM public.user_gyms WHERE user_id = auth.uid()))
  WITH CHECK (user_gym_id IN (SELECT id FROM public.user_gyms WHERE user_id = auth.uid()));

CREATE POLICY "own_machines" ON public.user_gym_machines
  USING (user_gym_id IN (SELECT id FROM public.user_gyms WHERE user_id = auth.uid()))
  WITH CHECK (user_gym_id IN (SELECT id FROM public.user_gyms WHERE user_id = auth.uid()));

CREATE POLICY "own_miniweights" ON public.user_gym_miniweights
  USING (user_gym_id IN (SELECT id FROM public.user_gyms WHERE user_id = auth.uid()))
  WITH CHECK (user_gym_id IN (SELECT id FROM public.user_gyms WHERE user_id = auth.uid()));

CREATE POLICY "own_active_templates" ON public.user_active_templates
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_machine_pref" ON public.template_exercise_machine_pref
  USING (
    user_gym_machine_id IN (SELECT m.id
                            FROM public.user_gym_machines m
                            JOIN public.user_gyms g ON g.id = m.user_gym_id
                            WHERE g.user_id = auth.uid())
  )
  WITH CHECK (
    user_gym_machine_id IN (SELECT m.id
                            FROM public.user_gym_machines m
                            JOIN public.user_gyms g ON g.id = m.user_gym_id
                            WHERE g.user_id = auth.uid())
  );

CREATE POLICY "own_lifting_prefs" ON public.user_lifting_prefs
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Bar types are public for selection
CREATE POLICY "bar_types_select_all" ON public.bar_types FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX ON public.user_active_templates(user_id, is_active, order_index);
CREATE INDEX ON public.user_active_templates(user_id, last_done_at);
CREATE INDEX ON public.user_gym_dumbbells(user_gym_id, weight);
CREATE INDEX ON public.user_gym_plates(user_gym_id, weight);
CREATE INDEX ON public.user_gym_machines(user_gym_id);

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_default_gym(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.user_gyms
  WHERE user_id = _user_id
  ORDER BY is_default DESC, created_at ASC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.next_template_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT template_id
  FROM public.user_active_templates
  WHERE user_id = _user_id AND is_active = true
  ORDER BY COALESCE(last_done_at, to_timestamp(0)) ASC, order_index ASC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.closest_machine_weight(
  desired numeric,
  stack numeric[],
  aux numeric[]
) RETURNS numeric
LANGUAGE plpgsql IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  candidate numeric;
  best numeric := NULL;
  diff numeric := NULL;
  a numeric;
BEGIN
  -- exact stack steps
  FOREACH candidate IN ARRAY stack LOOP
    IF diff IS NULL OR abs(candidate - desired) < diff THEN
      best := candidate; diff := abs(candidate - desired);
    END IF;
    -- stack + one aux plate
    FOREACH a IN ARRAY aux LOOP
      IF diff IS NULL OR abs(candidate + a - desired) < diff THEN
        best := candidate + a; diff := abs(candidate + a - desired);
      END IF;
    END LOOP;
  END LOOP;
  RETURN COALESCE(best, 0);
END $$;

CREATE OR REPLACE FUNCTION public.bar_min_increment(_gym_id uuid)
RETURNS numeric
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH all_fracs AS (
    SELECT weight FROM public.user_gym_plates WHERE user_gym_id = _gym_id
    UNION
    SELECT weight FROM public.user_gym_miniweights WHERE user_gym_id = _gym_id
  )
  SELECT COALESCE(MIN(weight), 1)::numeric * 2
  FROM all_fracs;
$$;