-- 1) Create normalized taxonomy tables
-- body_parts
CREATE TABLE IF NOT EXISTS public.body_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.body_parts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='body_parts' AND policyname='body_parts_select_all'
  ) THEN
    CREATE POLICY "body_parts_select_all" ON public.body_parts FOR SELECT USING (true);
  END IF;
END $$;

-- muscle_groups
CREATE TABLE IF NOT EXISTS public.muscle_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_part_id uuid NOT NULL REFERENCES public.body_parts(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT muscle_groups_unique UNIQUE(body_part_id, name)
);
CREATE UNIQUE INDEX IF NOT EXISTS muscle_groups_slug_unique ON public.muscle_groups (slug);

ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='muscle_groups' AND policyname='muscle_groups_select_all'
  ) THEN
    CREATE POLICY "muscle_groups_select_all" ON public.muscle_groups FOR SELECT USING (true);
  END IF;
END $$;

-- muscles
CREATE TABLE IF NOT EXISTS public.muscles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_group_id uuid NOT NULL REFERENCES public.muscle_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT muscles_unique UNIQUE(muscle_group_id, name)
);
CREATE UNIQUE INDEX IF NOT EXISTS muscles_slug_unique ON public.muscles (slug);

ALTER TABLE public.muscles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='muscles' AND policyname='muscles_select_all'
  ) THEN
    CREATE POLICY "muscles_select_all" ON public.muscles FOR SELECT USING (true);
  END IF;
END $$;

-- 2) Alter exercises to reference new taxonomy
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS body_part_id uuid,
  ADD COLUMN IF NOT EXISTS primary_muscle_id uuid,
  ADD COLUMN IF NOT EXISTS secondary_muscle_ids uuid[];

-- Add FKs if not present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'exercises_body_part_fk'
  ) THEN
    ALTER TABLE public.exercises
      ADD CONSTRAINT exercises_body_part_fk
      FOREIGN KEY (body_part_id) REFERENCES public.body_parts(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'exercises_primary_muscle_fk'
  ) THEN
    ALTER TABLE public.exercises
      ADD CONSTRAINT exercises_primary_muscle_fk
      FOREIGN KEY (primary_muscle_id) REFERENCES public.muscles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_exercises_body_part_id ON public.exercises(body_part_id);
CREATE INDEX IF NOT EXISTS idx_exercises_primary_muscle_id ON public.exercises(primary_muscle_id);
CREATE INDEX IF NOT EXISTS idx_muscle_groups_body_part_id ON public.muscle_groups(body_part_id);
CREATE INDEX IF NOT EXISTS idx_muscles_muscle_group_id ON public.muscles(muscle_group_id);

-- 3) Seed initial taxonomy data
-- Body parts
INSERT INTO public.body_parts(name, slug)
VALUES
  ('Core','core'),
  ('Legs','legs'),
  ('Arms','arms'),
  ('Pectorals','pectorals'),
  ('Back','back'),
  ('Others','others')
ON CONFLICT (name) DO NOTHING;

-- Muscle groups
INSERT INTO public.muscle_groups (body_part_id, name, slug)
SELECT bp.id, 'Biceps', 'biceps' FROM public.body_parts bp WHERE bp.name='Arms'
ON CONFLICT (body_part_id, name) DO NOTHING;

INSERT INTO public.muscle_groups (body_part_id, name, slug)
SELECT bp.id, 'Quadriceps', 'quadriceps' FROM public.body_parts bp WHERE bp.name='Legs'
ON CONFLICT (body_part_id, name) DO NOTHING;

INSERT INTO public.muscle_groups (body_part_id, name, slug)
SELECT bp.id, 'Hamstrings', 'hamstrings' FROM public.body_parts bp WHERE bp.name='Legs'
ON CONFLICT (body_part_id, name) DO NOTHING;

INSERT INTO public.muscle_groups (body_part_id, name, slug)
SELECT bp.id, 'Chest', 'chest' FROM public.body_parts bp WHERE bp.name='Pectorals'
ON CONFLICT (body_part_id, name) DO NOTHING;

INSERT INTO public.muscle_groups (body_part_id, name, slug)
SELECT bp.id, 'Abs', 'abs' FROM public.body_parts bp WHERE bp.name='Core'
ON CONFLICT (body_part_id, name) DO NOTHING;

-- Muscles
INSERT INTO public.muscles (muscle_group_id, name, slug)
SELECT mg.id, 'Upper Chest', 'upper_chest' FROM public.muscle_groups mg WHERE mg.name='Chest'
ON CONFLICT (muscle_group_id, name) DO NOTHING;

INSERT INTO public.muscles (muscle_group_id, name, slug)
SELECT mg.id, 'Mid Chest', 'mid_chest' FROM public.muscle_groups mg WHERE mg.name='Chest'
ON CONFLICT (muscle_group_id, name) DO NOTHING;

-- 4) Best-effort backfill from legacy text fields to new IDs
-- Map exercises.body_part -> body_parts.id
UPDATE public.exercises e
SET body_part_id = bp.id
FROM public.body_parts bp
WHERE e.body_part IS NOT NULL
  AND lower(e.body_part) = lower(bp.name)
  AND e.body_part_id IS NULL;

-- Map exercises.primary_muscle -> muscles.id by slugified name (spaces -> underscores)
UPDATE public.exercises e
SET primary_muscle_id = m.id
FROM public.muscles m
WHERE e.primary_muscle IS NOT NULL
  AND lower(replace(e.primary_muscle,' ','_')) = lower(m.slug)
  AND e.primary_muscle_id IS NULL;

-- Map exercises.secondary_muscles (text[]) -> secondary_muscle_ids (uuid[])
UPDATE public.exercises e
SET secondary_muscle_ids = (
  SELECT array_agg(m.id)
  FROM unnest(e.secondary_muscles) sm(name)
  JOIN public.muscles m ON lower(replace(sm,' ','_')) = lower(m.slug)
)
WHERE e.secondary_muscles IS NOT NULL
  AND e.secondary_muscle_ids IS NULL;